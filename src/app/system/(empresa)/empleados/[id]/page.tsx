"use client";
import Link from "next/link";
import {use, useEffect, useState} from "react";
import {pdf} from "@react-pdf/renderer";
import {FileText} from "lucide-react";

import {MedicalRecord, Studies, UserPatient} from "@/types";

import EstudiosCard from "@/app/system/(pacientes)/estudios-pacientes/EstudiosCard";
import Panel from "@/app/system/components/Panel";
import {ArrowLeft, Clients} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";
import {MedicalHistoryPDF} from "@/app/system/medical-history/components/MedicalHistoryPDF";

interface PageProps {
  params: Promise<{id: string}>;
}

export default function EstudiosPacientesPage({params}: PageProps) {
  const [data, setData] = useState<UserPatient | null>(null);
  const id = use(params).id;
  const [studies, setStudies] = useState<Studies[]>([]);
  const [downloadingHistory, setDownloadingHistory] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const data = async () => {
      setData(null);
      setStudies([]);
      setLoadError(false);
      try {
        const res = await dataService.getPatientById(id);
        if (res.patient_status !== "Completado") {
          setLoadError(true);
          return;
        }
        const studies = await dataService.getStudiesByPatientId(id);

        setData(res);
        setStudies(studies);
      } catch (error) {
        console.error(error);
        setLoadError(true);
      }
    };

    void data();
  }, [id]);

  const handleDownloadHistory = async () => {
    if (!id) return;
    try {
      setDownloadingHistory(true);
      const records: MedicalRecord[] = await dataService.getMedicalRecord(id);
      const active = records[0];

      if (!active?.id) {
        alert("No se encontró una ficha médica o historial clínico cargado para este empleado.");

        return;
      }

      const blob = await pdf(<MedicalHistoryPDF medicalRecord={active} patientCompanyName={data?.company_name} />).toBlob();
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al descargar historial clínico:", error);
      alert("Ocurrió un error al generar el historial clínico.");
    } finally {
      setDownloadingHistory(false);
    }
  };

  if (!data) {
    return (
      <Panel pageIcon={<Clients />} pageTitle="Historial de estudios">
        {loadError ? (
          <div>
            <p>El empleado no está disponible. Sus estudios deben ser habilitados por administración o secretaría.</p>
            <Link className="mt-4 inline-block underline" href="/system/empleados">Volver a empleados</Link>
          </div>
        ) : <p>Cargando...</p>}
      </Panel>
    );
  }

  return (
    <Panel
      pageIcon={<Clients />}
      pageTitle={`Historial de estudios - ${data.first_name} ${data.last_name}`}
    >
      <div className="flex h-full min-h-[300px] flex-col justify-between gap-6">
        <div className="flex-1">
          <Link className="mb-4 flex items-center gap-1 font-bold" href="/system/empleados">
            <ArrowLeft />
            Volver
          </Link>

          {!studies.length ? (
            <p className="my-6 text-center font-semibold">No hay estudios registrados aún.</p>
          ) : (
            <section className="my-5 flex flex-col gap-5">
              {studies.map((study) => (
                <EstudiosCard key={study.id} studies={study} />
              ))}
            </section>
          )}
        </div>

        {/* Botón de descargar historial clínico abajo a la izquierda */}
        <div className="flex justify-end pt-2">
          <button
            className="bg-blue flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={downloadingHistory}
            type="button"
            onClick={() => void handleDownloadHistory()}
          >
            <FileText className="size-4" />
            {downloadingHistory ? "Generando historial..." : "Descargar historial clínico"}
          </button>
        </div>
      </div>
    </Panel>
  );
}
