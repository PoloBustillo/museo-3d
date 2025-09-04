import { PrismaClient } from "@prisma/client";
import cloudinary from "../../../../utils/cloudinary";

const prisma = new PrismaClient();

// GET /api/murales/[id]
export async function GET(req, context) {
  const params = await context.params;
  const { id } = params;
  const muralId = Number(id);

  if (!id || isNaN(muralId)) {
    return new Response(
      JSON.stringify({
        error: "ID de mural inválido",
        message: "El parámetro 'id' es requerido y debe ser un número.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const mural = await prisma.mural.findUnique({
      where: { id: muralId },
      include: {
        SalaMural: {
          include: {
            sala: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                creadorId: true,
                creador: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
                colaboradores: {
                  select: {
                    id: true,
                    rol: true,
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!mural) {
      return new Response(
        JSON.stringify({
          error: "Mural no encontrado",
          message: `No se encontró un mural con ID ${id}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(mural), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener mural por ID:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al obtener el mural",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// PUT /api/murales/[id]
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = params;
  const muralId = Number(id);

  if (!id || isNaN(muralId)) {
    return new Response(
      JSON.stringify({
        error: "ID de mural inválido",
        message: "El parámetro 'id' es requerido y debe ser un número.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let data;
    let file;
    let url_imagen = undefined;

    if (contentType.includes("application/json")) {
      data = await req.json();
      url_imagen = data.url_imagen || data.imagenUrl;
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      data = Object.fromEntries(form.entries());
      file = form.get("imagen");
      url_imagen = data.url_imagen || data.imagenUrl;
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
    } else {
      return new Response(
        JSON.stringify({ error: "Content-Type no soportado." }),
        {
          status: 415,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
     // 2. Validar que la descripción exista
    if (!data.descripcion || !data.descripcion.trim()) {
      return new Response(
        JSON.stringify({ error: "La descripción de la obra es obligatoria." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    //Función de análisis de sentimientos
    async function sentimentalAnalysis() {
      try {
        const response = await fetch("https://kenaisan-sentiana.hf.space/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.descripcion })
        });

        if (!response.ok) throw new Error("Error en la API de Hugging Face");

        const responseData = await response.json();
        const probNegativa = parseFloat(responseData.probabilidades[0][0].toFixed(7));
        const probPositiva = parseFloat(responseData.probabilidades[0][1].toFixed(7));

        return [responseData.polaridad, probNegativa, probPositiva];

      } catch (err) {
        console.error("⚠️ Error analizando sentimiento:", err);
        // Si falla la IA, asignamos valores por defecto
         return ["POSITIVO", 0.6666, 0.77777];
      }
    }

    // Ejecutar el análisis de sentimientos
    const [polaridad, probNegativa, probPositiva] = await sentimentalAnalysis();

    // Filtrar solo los campos válidos para el modelo Prisma
    const allowedFields = [
      "titulo",
      "descripcion",
      "autor",
      "tecnica",
      "ubicacion",
      "url_imagen", // Nombre correcto según schema
      "modelo3dUrl",
      "latitud",
      "longitud",
      "anio",
      "artistId",
      "userId", // Reactivado - debería funcionar ahora
      "dimensiones",
      "estado",
      "imagenUrlWebp", // Este sí existe en el schema
      "imagenesSecundarias",
      "videoUrl",
      "audioUrl",
      "salaId",
      "exposiciones",
      "publica",
      "destacada",
      "deletedAt",
      "tags",
      "orden",
      "visitas",
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (key === "url_imagen") {
        // Manejar tanto url_imagen como imagenUrl del frontend
        if (url_imagen !== undefined) {
          updateData["url_imagen"] = url_imagen;
        } else if (data.imagenUrl !== undefined) {
          updateData["url_imagen"] = data.imagenUrl;
        }
      } else if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }
    //Añadimos los datos de la IA al modelo
    updateData.polaridad = polaridad;
    updateData.probNegativa = probNegativa;
    updateData.probPositiva = probPositiva;

    // Conversión de tipos para algunos campos
    if (updateData.latitud !== undefined && updateData.latitud !== null) {
      updateData.latitud = parseFloat(updateData.latitud);
    }
    if (updateData.longitud !== undefined && updateData.longitud !== null) {
      updateData.longitud = parseFloat(updateData.longitud);
    }
    if (updateData.anio !== undefined && updateData.anio !== null) {
      updateData.anio = Number(updateData.anio);
    }

    // Conversiones adicionales para campos problemáticos
    if (updateData.salaId !== undefined && updateData.salaId !== null) {
      updateData.salaId =
        updateData.salaId === "" ? null : Number(updateData.salaId);
    }
    if (updateData.orden !== undefined && updateData.orden !== null) {
      updateData.orden =
        updateData.orden === "" ? null : Number(updateData.orden);
    }
    if (updateData.visitas !== undefined && updateData.visitas !== null) {
      updateData.visitas = Number(updateData.visitas);
    }

    // Convertir strings booleanos a booleanos reales
    if (updateData.publica !== undefined) {
      updateData.publica =
        updateData.publica === "true" || updateData.publica === true;
    }
    if (updateData.destacada !== undefined) {
      updateData.destacada =
        updateData.destacada === "true" || updateData.destacada === true;
    }

    // Parsear JSON strings para campos JSON
    if (updateData.tags !== undefined && typeof updateData.tags === "string") {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (e) {
        console.warn("Error parsing tags:", e);
        updateData.tags = [];
      }
    }
    if (
      updateData.exposiciones !== undefined &&
      typeof updateData.exposiciones === "string"
    ) {
      try {
        updateData.exposiciones = JSON.parse(updateData.exposiciones);
      } catch (e) {
        console.warn("Error parsing exposiciones:", e);
        updateData.exposiciones = null;
      }
    }
    if (
      updateData.imagenesSecundarias !== undefined &&
      typeof updateData.imagenesSecundarias === "string"
    ) {
      try {
        updateData.imagenesSecundarias = JSON.parse(
          updateData.imagenesSecundarias
        );
      } catch (e) {
        console.warn("Error parsing imagenesSecundarias:", e);
        updateData.imagenesSecundarias = null;
      }
    }

    // Debug: logging de los datos procesados
    console.log("💾 Datos procesados para actualización:", {
      updateDataKeys: Object.keys(updateData),
      updateData: JSON.stringify(updateData, null, 2),
    });

    // Actualizar mural
    const mural = await prisma.mural.update({
      where: { id: muralId },
      data: updateData,
      include: {
        SalaMural: {
          include: {
            sala: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                creador: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return new Response(JSON.stringify(mural), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al actualizar mural:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al actualizar el mural",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// DELETE /api/murales/[id]
export async function DELETE(req, context) {
  const params = await context.params;
  const { id } = params;
  const muralId = Number(id);

  if (!id || isNaN(muralId)) {
    return new Response(
      JSON.stringify({
        error: "ID de mural inválido",
        message: "El parámetro 'id' es requerido y debe ser un número.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Soft delete: actualiza deletedAt
    const mural = await prisma.mural.update({
      where: { id: muralId },
      data: { deletedAt: new Date() },
    });
    return new Response(JSON.stringify({ success: true, mural }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Error al eliminar mural",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
