"use client";
import Link from "next/link";
import {useEffect, useState} from "react";

import {UserPatient} from "@/types";

import {Pacientes} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";

import Panel from "../../components/Panel";

export default function PacientesProfesional() {
  const [patients, setPatients] = useState<UserPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");

  const filteredPatients = patients.filter((patient) =>
    patient.first_name.toLowerCase().includes(searchName.toLowerCase()),
  );

  useEffect(() => {
    const data = async () => {
      try {
        const res = await dataService.getPatients();

        setPatients(res);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    void data();
  }, []);

  const getStudyDetail = (studyType?: string) => {
    if (!studyType) return "Sin estudio asignado";
    const trimmed = studyType.trim().toLowerCase();

    if (trimmed === "estudio1" || trimmed === "basico de ley" || trimmed === "básico de ley") {
      return "Básico de ley (Consentimiento informado + ECG + Radiografía de Tórax frente, Exámen Clínico)";
    }
    if (
      trimmed === "estudio2" ||
      trimmed === "básico + eeg + audiometría + psicotécnico + rx" ||
      trimmed === "basico + eeg + audiometria + psicotecnico + rx"
    ) {
      return "Básico de ley + EEG + Audiometria+ Psicotécnico + Radiografía de CLS frente y perfil";
    }
    if (
      trimmed === "estudio3" ||
      trimmed === "básico + eeg + audiometría + psicotécnico + rx + drogas" ||
      trimmed === "basico + eeg + audiometria + psicotecnico + rx + drogas"
    ) {
      return "Básico de ley + EEG+ Audiometría+ Psicotécnico + Radiografía de CLS frente y perfil + Drogas de abuso con Benzodiacepinas y derivados";
    }
    if (
      trimmed === "estudio4" ||
      trimmed === "básico + eeg + audiometría + psicotécnico + rx + drogas (m/c)" ||
      trimmed === "basico + eeg + audiometria + psicotecnico + rx + drogas (m/c)"
    ) {
      return "Básico de ley + EEG + Audiometria + Psicotecnico + Radiografía de CLS y CC frente y perfil + Drogas de abuso (Marihuana y Cocaina)";
    }
    if (
      trimmed === "estudio5" ||
      trimmed ===
        "básico + eeg + audiometría + psicotécnico + rx + drogas + test cereal + espiro" ||
      trimmed === "basico + eeg + audiometria + psicotecnico + rx + drogas + test cereal + espiro"
    ) {
      return "Básico de ley + EEG+ Audiometria + Psicotécnico + Radiografía de CLS frente y perfil + Drogas de abuso con benzodiacepinas y derivados+ Test del cereal + Espirometría";
    }

    return studyType;
  };

  if (loading) {
    return (
      <Panel pageIcon={<Pacientes />} pageTitle="Pacientes">
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600" />
        </div>
      </Panel>
    );
  }

  if (patients.length === 0) {
    return (
      <Panel pageIcon={<Pacientes />} pageTitle="Pacientes">
        <p>No hay pacientes</p>
      </Panel>
    );
  }

  return (
    <Panel pageIcon={<Pacientes />} pageTitle="Pacientes">
      <h1 className="font-semibold">Filtrar por nombre</h1>
      <input
        className="my-5 w-full rounded-md border border-[#4A4A4A] px-3 py-2"
        placeholder="Buscar"
        type="text"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
      />
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#3A3A3A] text-white">
            <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Nombre</th>
            <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Apellido</th>
            <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">DNI</th>
            <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Tipo</th>
            <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Empresa</th>
            <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Fecha de nacimiento</th>
            <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Obra social</th>
            <th className="border-r border-[#4A4A4A] px-3 py-2 text-center text-wrap">
              Historial de resultados
            </th>
            <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Estudio</th>

            <th className="px-3 py-2 text-center">Ficha médica</th>
          </tr>
        </thead>

        <tbody>
          {filteredPatients.map((row, idx) => (
            <tr key={idx} className="border-t border-[#4A4A4A] bg-[#333333] text-white">
              <td className="border-r border-[#4A4A4A] px-3 py-2">{row.first_name || "-"}</td>
              <td className="border-r border-[#4A4A4A] px-3 py-2">{row.last_name || "-"}</td>
              <td className="border-r border-[#4A4A4A] px-3 py-2">{row.dni || "-"}</td>
              <td className="border-r border-[#4A4A4A] px-3 py-2">
                {row.company_id ? "Empresa" : "Particular"}
              </td>
              <td className="border-r border-[#4A4A4A] px-3 py-2">
                {row.company_id ? row.company_name || "Empresa sin nombre" : "No aplica"}
              </td>
              <td className="border-r border-[#4A4A4A] px-3 py-2">{row.date_of_birth || "-"}</td>
              <td className="border-r border-[#4A4A4A] px-3 py-2">{row.social_security || "-"}</td>
              <td className="border-r border-[#4A4A4A] px-3 py-2 text-center underline">
                <Link href={`/system/pacientes-profesional/${row.id}`}>Ver</Link>
              </td>
              <td
                className="cursor-help px-3 py-2 underline decoration-dotted"
                title={getStudyDetail(row.study_type)}
              >
                {row.study_type ?? "-"}
              </td>

              <td className="px-3 py-2 text-center underline">
                <Link href={`/system/medical-history/${row.id}`}>Acceder</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
