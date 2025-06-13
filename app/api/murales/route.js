import { PrismaClient } from "@prisma/client";
import cloudinary from "../../../utils/cloudinary";

const prisma = new PrismaClient();

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
