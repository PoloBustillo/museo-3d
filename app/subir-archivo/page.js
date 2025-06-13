"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const schema = yup.object().shape({
  author: yup.string().required("El nombre del autor/a es obligatorio"),
  title: yup.string().required("El título es obligatorio"),
  year: yup
    .number()
    .typeError("El año debe ser un número")
    .min(1900, "Año mínimo 1900")
    .max(2100, "Año máximo 2100")
    .required("El año es obligatorio"),
  description: yup.string().required("La descripción es obligatoria"),
  files: yup
    .array()
    .min(1, "Debes seleccionar al menos un archivo")
    .required("Debes seleccionar al menos un archivo"),
});

export default function SubirArchivo() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: yupResolver(schema), defaultValues: { files: [] } });

  const files = watch("files");

  const onDrop = useCallback(
    (acceptedFiles) => {
      setValue("files", acceptedFiles, { shouldValidate: true });
    },
    [setValue]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const onSubmit = async (data) => {
    toast.success("¡Archivo enviado correctamente! (demo)");
    reset();
  };

  // Función para eliminar un archivo de la lista
  const removeFile = (idx) => {
    setValue(
      "files",
      files.filter((_, i) => i !== idx),
      { shouldValidate: true }
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 mt-8"
      >
        <h2 className="text-2xl font-bold text-center text-indigo-900 mb-6">
          Subir archivo al acervo
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Nombre del autor/a
            </label>
            <input
              {...register("author")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ej: Elena Poniatowska"
            />
            {errors.author && (
              <p className="text-red-600 text-sm mt-1">
                {errors.author.message}
              </p>
            )}
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Título del archivo
            </label>
            <input
              {...register("title")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ej: Volante original 1968"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Año
            </label>
            <input
              type="number"
              {...register("year")}
              className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ej: 1968"
              min={1900}
              max={2100}
            />
            {errors.year && (
              <p className="text-red-600 text-sm mt-1">{errors.year.message}</p>
            )}
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Descripción, contexto, etc.
            </label>
            <textarea
              {...register("description")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Breve descripción del archivo, contexto histórico, etc."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Selecciona uno o más archivos
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 bg-gray-100"
              }`}
            >
              <input {...getInputProps()} />
              {files && files.length > 0 ? (
                <ul className="mt-2 text-left text-sm">
                  {files.map((file, idx) => (
                    <li
                      key={idx}
                      className="text-gray-800 flex items-center gap-2 mb-1"
                    >
                      {file.type.startsWith("image") && (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded shadow border border-gray-200"
                          onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                        />
                      )}
                      <span className="font-semibold text-indigo-700">
                        {file.name}
                      </span>{" "}
                      <span className="text-gray-500">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500">
                  Arrastra archivos aquí o haz click para seleccionar
                </span>
              )}
            </div>
            {errors.files && (
              <p className="text-red-600 text-sm mt-1">
                {errors.files.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 py-2 px-6 rounded-lg bg-indigo-700 text-white font-bold shadow hover:bg-indigo-800 transition disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : "Subir"}
          </button>
        </form>
        <div className="mt-8 text-center">
          <Link href="/" className="text-indigo-700 underline font-bold">
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
