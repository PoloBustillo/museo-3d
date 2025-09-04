import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import cloudinary from "../../../../../utils/cloudinary";
// Import correct GLB generator
import { generateMuralGLB } from "../../../../../utils/generateMuralGLB";

const prisma = new PrismaClient();

export async function POST(req, context) {
  const params = await context.params;
  const { id } = params;
  const muralId = Number(id);

  // Validar sesión y rol
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 403,
    });
  }

  try {
    console.log(
      `🚀 Generando modelo 3D automáticamente para mural ID: ${muralId}`
    );

    // Obtener mural y su imagen
    const mural = await prisma.mural.findUnique({ where: { id: muralId } });
    if (!mural || !mural.url_imagen) {
      return new Response(
        JSON.stringify({ error: "Mural o imagen no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generar modelo 3D a partir de la imagen
    const glbBlob = await generateMuralGLB(mural.url_imagen);
    if (!glbBlob) {
      return new Response(
        JSON.stringify({ error: "No se pudo generar el modelo 3D" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Subir a Cloudinary
    console.log("☁️ Subiendo modelo generado a Cloudinary...");
    const arrayBuffer = await glbBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const upload = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "modelos3d",
            resource_type: "raw",
            format: "glb",
            public_id: `modelo_mural_${muralId}_${Date.now()}`,
          },
          (err, result) => {
            if (err) {
              console.error("❌ Error en Cloudinary:", err);
              reject(err);
            } else {
              console.log("✅ Subida a Cloudinary exitosa:", result.secure_url);
              resolve(result);
            }
          }
        )
        .end(buffer);
    });
    const modelo3dUrl = upload.secure_url;

    // Actualizar mural
    console.log("💾 Actualizando base de datos...");
    await prisma.mural.update({
      where: { id: muralId },
      data: { modelo3dUrl },
    });

    console.log(
      `✅ Modelo 3D generado y subido exitosamente para mural ID: ${muralId}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Modelo 3D generado y subido exitosamente",
        modelo3dUrl,
        muralId: muralId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error al generar/subir modelo 3D:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno al generar/subir modelo 3D",
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
