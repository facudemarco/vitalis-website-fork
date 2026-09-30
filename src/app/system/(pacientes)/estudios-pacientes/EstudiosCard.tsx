"use client";
import {useEffect, useState} from "react";

import {
  UserAdmin,
  UserCompany,
  UserPatient,
  UserProfessional,
  UserSecretary,
  Studies,
} from "@/types";

import {apiClient} from "@/lib/axios";
import {authService} from "@/services/authService";
import {dataService} from "@/services/dataService";

export default function EstudiosCard({studies}: {studies: Studies}) {
  const [userData, setUserData] = useState<
    UserAdmin | UserCompany | UserPatient | UserProfessional | UserSecretary | null
  >(null);

  // Modal upload states
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {user} = await authService.getCurrentUser();

        setUserData(user ?? null);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    void fetchUser();
  }, []);

  const downloadStudy = async () => {
    try {
      const response = await apiClient.get<{
        url: string;
        original_filename: string;
        mime_type: string;
      }>(`/studies/files/${studies.id}`, {
        withCredentials: true,
      });

      const {url, original_filename} = response.data;

      const link = document.createElement("a");

      link.href = url;
      link.download = original_filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error descargando el estudio:", error);
      alert("Error al descargar el archivo. Por favor, intenta nuevamente.");
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmWithReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Por favor selecciona un archivo de informe.");
      return;
    }

    const fileToUpload = selectedFile;

    setUploading(true);
    try {
      // 1. Subir el archivo de informe usando el endpoint existente
      await dataService.uploadStudyFile(studies.id, fileToUpload, true);
      // 2. Cambiar el estado del estudio a "Disponible"
      await dataService.changeStudyStatus(studies.id, {
        status: "Disponible",
        study_type: studies.study_type,
      });
      alert("Informe cargado y estudio confirmado correctamente.");
      setShowUploadModal(false);
      setSelectedFile(null);
      window.location.reload();
    } catch (error) {
      console.error("Error al confirmar el estudio:", error);
      alert("Ocurrió un error al confirmar el estudio. Por favor intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmWithoutReport = async () => {
    setUploading(true);
    try {
      await dataService.changeStudyStatus(studies.id, {
        status: "Disponible",
        study_type: studies.study_type,
      });
      alert("Estudio confirmado correctamente.");
      window.location.reload();
    } catch (error) {
      console.error("Error al confirmar el estudio:", error);
      alert("Ocurrió un error al confirmar el estudio. Por favor intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-200";
      case "Disponible":
        return "text-green-400";
      default:
        return "text-red-400";
    }
  };

  const files = studies.files || [];
  const studyFiles = files.filter((file) => !file.is_report);
  const reportFiles = files.filter((file) => file.is_report);

  return (
    <>
      <section className="bg-blue md:text-md flex w-full items-center justify-between gap-5 rounded-xl p-5 text-sm text-white">
        <div className="flex gap-2">
          <img alt="image-estudie" className="size-10" src="/estudios1.png" />
          <div>
            <div className="flex items-center gap-2 text-sm">
              <p>Estudio:</p>
              <b>{studies.study_type}</b>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <p>Realizado el:</p>
              <b>{studies.created_at?.split("T")[0]}</b>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-start gap-2">
            <p className="flex items-center gap-1">
              Estado:
              <b className={getStatusColor(studies.status)}>
                {studies.status === "pending"
                  ? "Pendiente"
                  : studies.status === "Disponible"
                    ? "Disponible"
                    : "No reconocido"}
              </b>
            </p>

            {/* Render download options if Available */}
            {studies.status === "Disponible" && (
              <div className="flex w-full flex-col items-start gap-1">
                {studyFiles.map((file, index) => (
                  <button
                    key={file.id}
                    className="block cursor-pointer text-left underline"
                    onClick={() => downloadFile(file.file_path, file.original_filename)}
                  >
                    Descargar Estudio {studyFiles.length > 1 ? `#${index + 1}` : ""} (
                    {file.original_filename})
                  </button>
                ))}
                {reportFiles.map((file) => (
                  <button
                    key={file.id}
                    className="block cursor-pointer text-left font-semibold text-green-300 underline"
                    onClick={() => downloadFile(file.file_path, file.original_filename)}
                  >
                    Descargar Informe ({file.original_filename})
                  </button>
                ))}
                {files.length === 0 && studies.study_type === "Consentimiento informado" && (
                  <p className="text-sm text-amber-200">
                    Este consentimiento todavía no tiene un PDF adjunto.
                  </p>
                )}
                {files.length === 0 && studies.study_type !== "Consentimiento informado" && (
                  <button className="cursor-pointer underline" onClick={() => void downloadStudy()}>
                    Descargar PDF
                  </button>
                )}
              </div>
            )}

            {/* Pending status view for staff */}
            {(userData?.role === "professional" ||
              userData?.role === "admin" ||
              userData?.role === "secretary") &&
              studies.status === "pending" && (
                <div className="flex w-full flex-col items-start gap-1">
                  {files.map((f, i) => (
                    <button
                      key={f.id}
                      className="block cursor-pointer text-left underline"
                      onClick={() => downloadFile(f.file_path, f.original_filename)}
                    >
                      Descargar Archivo {files.length > 1 ? `#${i + 1}` : ""} ({f.original_filename}
                      )
                    </button>
                  ))}
                  {files.length === 0 && studies.study_type !== "Consentimiento informado" && (
                    <button
                      className="cursor-pointer underline"
                      onClick={() => void downloadStudy()}
                    >
                      Descargar PDF
                    </button>
                  )}
                </div>
              )}
          </div>

          {/* Action button for Specialist / Médico */}
          {userData?.role === "professional" && studies.status === "pending" && (
            <div className="flex flex-wrap gap-2">
              {studies.requires_report !== false ? (
                <button
                  className="cursor-pointer rounded bg-white/20 px-3 py-1 font-medium underline transition hover:bg-white/30"
                  disabled={uploading}
                  onClick={() => setShowUploadModal(true)}
                >
                  Agregar informe
                </button>
              ) : (
                <>
                  <button
                    className="cursor-pointer rounded bg-white/20 px-3 py-1 font-medium underline transition hover:bg-white/30 disabled:opacity-50"
                    disabled={uploading}
                    onClick={() => void handleConfirmWithoutReport()}
                  >
                    Confirmar estudio
                  </button>
                  <button
                    className="cursor-pointer rounded bg-white/20 px-3 py-1 font-medium underline transition hover:bg-white/30 disabled:opacity-50"
                    disabled={uploading}
                    onClick={() => setShowUploadModal(true)}
                  >
                    Agregar informe (opcional)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Upload Report Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 text-black shadow-lg">
            <h3 className="text-lg font-bold">Confirmar Estudio con Informe</h3>
            <p className="mt-1 mb-4 text-sm text-gray-500">
              Estudio: <strong>{studies.study_type}</strong>
            </p>

            <form className="flex flex-col gap-4" onSubmit={handleConfirmWithReport}>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                  Seleccionar archivo de informe (PDF o Imagen):
                </span>
                <input
                  required
                  accept=".pdf,image/*"
                  className="rounded-lg border border-gray-300 bg-white p-2 text-sm"
                  disabled={uploading}
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </label>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                  disabled={uploading}
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={uploading}
                  type="submit"
                >
                  {uploading ? "Subiendo..." : "Confirmar y Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
