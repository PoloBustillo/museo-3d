import { PrismaClient } from "@prisma/client";
import cloudinary from "../../../utils/cloudinary";

const prisma = new PrismaClient();

// GET - Obtener todos los murales
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const salaId = searchParams.get("salaId");
    const autor = searchParams.get("autor");
    const tecnica = searchParams.get("tecnica");
    const anio = searchParams.get("anio");

    // Construir filtros dinámicamente
    const where = {};
    if (salaId) where.salaId = Number(salaId);
    if (autor) where.autor = { contains: autor, mode: "insensitive" };
    if (tecnica) where.tecnica = { contains: tecnica, mode: "insensitive" };
    if (anio) where.anio = Number(anio);

    const murales = await prisma.mural.findMany({
      where,
      include: {
        sala: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: [{ anio: "desc" }, { nombre: "asc" }],
    });

    // Agregar estadísticas
    const stats = {
      total: murales.length,
      porSala: {},
      porTecnica: {},
      porAnio: {},
    };

    murales.forEach((mural) => {
      // Estadísticas por sala
      const salaNombre = mural.sala?.nombre || "Sin sala";
      stats.porSala[salaNombre] = (stats.porSala[salaNombre] || 0) + 1;

      // Estadísticas por técnica
      if (mural.tecnica) {
        stats.porTecnica[mural.tecnica] =
          (stats.porTecnica[mural.tecnica] || 0) + 1;
      }

      // Estadísticas por año
      if (mural.anio) {
        stats.porAnio[mural.anio] = (stats.porAnio[mural.anio] || 0) + 1;
      }
    });

    return new Response(
      JSON.stringify({
        murales,
        estadisticas: stats,
        filtros: {
          salaId: salaId || null,
          autor: autor || null,
          tecnica: tecnica || null,
          anio: anio || null,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al obtener murales:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al obtener murales",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let data;
    let file;
    if (contentType.includes("application/json")) {
      data = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      data = Object.fromEntries(form.entries());
      file = form.get("imagen");
    } else {
      return new Response(
        JSON.stringify({ error: "Content-Type no soportado." }),
        {
          status: 415,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let url_imagen = data.url_imagen;
    // Si recibimos archivo, subimos a Cloudinary
    if (
      file &&
      typeof file === "object" &&
      file.type &&
      file.type.startsWith("image/")
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "murales" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });
      url_imagen = upload.secure_url;
    }

    if (!url_imagen) {
      return new Response(
        JSON.stringify({
          error:
            "Debes proporcionar la URL de la imagen subida a Cloudinary o un archivo imagen.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const mural = await prisma.mural.create({
      data: {
        nombre: data.nombre,
        tecnica: data.tecnica,
        anio: Number(data.anio),
        ubicacion: data.ubicacion,
        url_imagen,
        autor: data.autor || undefined,
        colaboradores: data.colaboradores || undefined,
        medidas: data.medidas || undefined,
        ...(data.salaId ? { salaId: Number(data.salaId) } : {}),
      },
    });
    return new Response(JSON.stringify(mural), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
