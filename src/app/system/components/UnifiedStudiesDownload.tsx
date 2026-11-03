"use client";

import {useState} from "react";
import type {Studies, UserPatient} from "@/types";
import {dataService} from "@/services/dataService";
import {orderPatientStudies} from "@/lib/studyOrder";

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
      const {PDFDocument} = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const file of files) {
        try {
          const response = await fetch(file.file_path, {credentials: "include", cache: "no-store"});
          if (!response.ok) throw new Error();
          const source = await PDFDocument.load(await response.arrayBuffer());
          if (!source.getPageCount()) throw new Error();
          for (const page of await merged.copyPages(source, source.getPageIndices())) {
            merged.addPage(page);
          }
        } catch {
          setError(`No se pudo incorporar el PDF «${file.original_filename}». Revisá si se puede descargar y abrir por separado.`);
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
