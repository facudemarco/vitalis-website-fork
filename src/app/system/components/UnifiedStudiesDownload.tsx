"use client";

import {useState} from "react";
import type {Studies, UserPatient} from "@/types";
import {dataService} from "@/services/dataService";
import {orderPatientStudies} from "@/lib/studyOrder";
import {normalizeMedicalRecordDefaults} from "@/lib/medicalRecordDefaults";

function pdfFiles(studies: Studies[]) {
  return orderPatientStudies(studies).flatMap((study) =>
    (study.files ?? [])
      .filter((file) => file.mime_type?.split(";")[0].trim().toLowerCase() === "application/pdf" ||
        /\.pdf$/i.test(file.original_filename))
      .sort((a, b) => Number(Boolean(a.is_report)) - Number(Boolean(b.is_report)) ||
        (a.uploaded_at ?? "").localeCompare(b.uploaded_at ?? "")),
  );
}

export default function UnifiedStudiesDownload({patient, studies}: {patient: UserPatient; studies: Studies[]}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (patient.patient_status !== "Completado" || !patient.id || !pdfFiles(studies).length) return null;
  const patientId = patient.id;

  async function download() {
    setBusy(true);
    setError("");
    try {
      const [currentPatient, currentStudies] = await Promise.all([
        dataService.getPatientById(patientId),
        dataService.getStudiesByPatientId(patientId),
      ]);
      if (currentPatient.patient_status !== "Completado") {
        setError("El paciente ya no está completado. Actualizá la página.");
        return;
      }
      const files = pdfFiles(currentStudies);
      if (!files.length) {
        setError("No hay archivos PDF para unificar.");
        return;
      }
      const records = await dataService.getMedicalRecord(patientId);
      const medicalRecord = records[0];
      if (!medicalRecord?.id) {
        setError("No se encontró la historia clínica guardada de este paciente.");
        return;
      }
      const [{PDFDocument}, {pdf}, {MedicalHistoryPDF}] = await Promise.all([
        import("pdf-lib"),
        import("@react-pdf/renderer"),
        import("../medical-history/components/MedicalHistoryPDF"),
      ]);
      const merged = await PDFDocument.create();
      try {
        const history = await pdf(
          <MedicalHistoryPDF
            medicalRecord={normalizeMedicalRecordDefaults(medicalRecord)}
            patientCompanyName={currentPatient.company_name || (currentPatient.company_id ? "Empresa" : "Particular")}
          />,
        ).toBlob();
        const source = await PDFDocument.load(await history.arrayBuffer());
        if (!source.getPageCount()) throw new Error();
        for (const page of await merged.copyPages(source, source.getPageIndices())) {
          merged.addPage(page);
        }
      } catch {
        setError("No se pudo generar la historia clínica. Volvé a intentar la descarga.");
        return;
      }
      for (const file of files) {
        try {
          const bytes = await dataService.getStudyPdf(file.file_path);
          const source = await PDFDocument.load(bytes);
          if (!source.getPageCount()) throw new Error();
          for (const page of await merged.copyPages(source, source.getPageIndices())) {
            merged.addPage(page);
          }
        } catch (failure) {
          const status = (failure as {response?: {status?: number}})?.response?.status;
          const reason = status === 404
            ? "El archivo no está disponible en el servidor que estás usando."
            : status === 401 || status === 403
              ? "La sesión actual no tiene acceso al archivo."
              : "Revisá si se puede descargar y abrir por separado.";
          setError(`No se pudo incorporar el PDF «${file.original_filename}». ${reason}`);
          return;
        }
      }
      const url = URL.createObjectURL(new Blob([new Uint8Array(await merged.save())], {type: "application/pdf"}));
      const link = document.createElement("a");
      link.href = url;
      const name = `${patient.last_name ?? ""} ${patient.first_name ?? ""}`.trim().replace(/[^\p{L}\p{N}]+/gu, "-");
      link.download = `estudios-${name || "paciente"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError("No se pudo generar el PDF unificado. Volvé a intentar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" disabled={busy} onClick={() => void download()}
        className="bg-blue cursor-pointer rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50">
        {busy ? "Unificando archivos…" : "Descargar PDF unificado"}
      </button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
