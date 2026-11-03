"use client";
import {useEffect, useState} from "react";
import {pdf} from "@react-pdf/renderer";
import {FileText} from "lucide-react";

import {Studies, MedicalRecord, UserPatient} from "@/types";

import {Clients} from "@/components/ui/Icons";
import {useAuth} from "@/contexts/AuthContext";
import UnifiedStudiesDownload from "@/app/system/components/UnifiedStudiesDownload";
import {dataService} from "@/services/dataService";

import {MedicalHistoryPDF} from "../../medical-history/components/MedicalHistoryPDF";
import Panel from "../../components/Panel";

import EstudiosCard from "./EstudiosCard";

export default function EstudiosPacientesPage() {
  const {profile} = useAuth();
  const [studies, setStudies] = useState<Studies[]>([]);
  const [patient, setPatient] = useState<UserPatient | null>(null);
  const patient_id = profile?.patient_id;
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingHistory, setDownloadingHistory] = useState(false);

  useEffect(() => {
    if (patient_id) {
      const getStudies = async () => {
        try {
          const response = await dataService.getStudiesByPatientId(patient_id);

          setStudies(response);
          void dataService.getPatientById(patient_id).then(setPatient).catch(() => setPatient(null));
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching studies:", error);
          setIsLoading(false);
        }
      };

      void getStudies();
    }
  }, [patient_id]);

  const handleDownloadHistory = async () => {
    if (!patient_id) return;
    try {
      setDownloadingHistory(true);
      const records: MedicalRecord[] = await dataService.getMedicalRecord(patient_id);
      const active = records[0];

      if (!active?.id) {
        alert("No se encontró una ficha médica o historial clínico cargado.");

        return;
      }

      const blob = await pdf(<MedicalHistoryPDF medicalRecord={active} />).toBlob();
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al descargar historial clínico:", error);
      alert("Ocurrió un error al generar el historial clínico.");
    } finally {
      setDownloadingHistory(false);
    }
  };

  return (
    <Panel pageIcon={<Clients />} pageTitle="Mis estudios">
      <div className="flex h-full min-h-[300px] flex-col justify-between gap-6">
        <div className="flex-1">
          {isLoading ? (
            <p className="my-auto text-center font-semibold">Cargando estudios...</p>
          ) : studies.length === 0 ? (
            <p className="my-auto text-center font-semibold">No tienes estudios aún.</p>
          ) : (
            <section className="flex max-h-82 flex-col gap-5 overflow-y-scroll md:px-10">
              {studies.map((study: Studies) => (
                <EstudiosCard key={study.id} studies={study} />
              ))}
            </section>
          )}
        </div>

        {patient && <UnifiedStudiesDownload patient={patient} studies={studies} />}
        {/* Botón de descargar historial clínico abajo a la izquierda */}
        <div className="flex justify-end pt-2">
          <button
            className="bg-blue flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={downloadingHistory}
            type="button"
            onClick={() => void handleDownloadHistory()}
          >
            <FileText className="size-4" />
            {downloadingHistory ? "Generando historial..." : "Descargar mi historial clínico"}
          </button>
        </div>
      </div>
    </Panel>
  );
}
