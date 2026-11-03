"use client";
import Link from "next/link";
import {use, useEffect, useState} from "react";

import {Studies, UserPatient} from "@/types";

import EstudiosCard from "@/app/system/(pacientes)/estudios-pacientes/EstudiosCard";
import Panel from "@/app/system/components/Panel";
import {ArrowLeft, Clients} from "@/components/ui/Icons";
import UnifiedStudiesDownload from "@/app/system/components/UnifiedStudiesDownload";
import {dataService} from "@/services/dataService";

interface PageProps {
  params: Promise<{id: string}>;
}

export default function EstudiosPacientesPage({params}: PageProps) {
  const [data, setData] = useState<UserPatient | null>(null);
  const id = use(params).id;
  const [studies, setStudies] = useState<Studies[]>([]);

  useEffect(() => {
    const data = async () => {
      try {
        const res = await dataService.getPatientById(id);
        const studies = await dataService.getStudiesByPatientId(id);

        setData(res);
        setStudies(studies);
      } catch (error) {
        console.error(error);
      }
    };

    void data();
  }, [id]);

  if (!data) {
    return (
      <Panel pageIcon={<Clients />} pageTitle="Historial de estudios">
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600" />
        </div>
      </Panel>
    );
  }

  if (studies.length === 0) {
    return (
      <Panel pageIcon={<Clients />} pageTitle="Historial de estudios">
        <section className="flex flex-col items-start gap-3">
          <Link className="flex items-center gap-1 font-bold" href="/system/pacientes-profesional">
            <ArrowLeft />
            Volver
          </Link>
          <p>No hay estudios</p>
        </section>
      </Panel>
    );
  }

  return (
    <Panel
      pageIcon={<Clients />}
      pageTitle={`Historial de estudios - ${data.first_name} ${data.last_name}`}
    >
      <section className="my-5 flex flex-col gap-5">
        <Link className="flex items-center gap-1 font-bold" href="/system/pacientes-profesional">
          <ArrowLeft />
          Volver
        </Link>
        {studies.map((study) => (
          <EstudiosCard key={study.id} studies={study} />
        ))}
        <UnifiedStudiesDownload patient={data} studies={studies} />
      </section>
    </Panel>
  );
}
