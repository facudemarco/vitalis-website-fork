"use client";
import Link from "next/link";
import {useEffect, useState} from "react";

import {UserProfessional} from "@/types";

import {Profesionals} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";

import Panel from "../../components/Panel";

export default function ProfessionalesAdminPage() {
  const [users, setUsers] = useState<UserProfessional[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfessionals = async () => {
    const data = await dataService.getProfessionals();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchProfessionals();
  }, []);

  const handleDelete = async (user: UserProfessional) => {
    const fullName = `${user.name ?? ""} ${user.lastname ?? ""}`.trim() || user.email;

    try {
      const summary = await dataService.getUserDeletionSummary(user.user_id);
      const relatedLabels: Record<string, string> = {
        users: "Cuenta del profesional",
        professionals: "Perfil profesional",
        medical_record: "Ficha médica",
        studies: "Estudio",
        study_files: "Archivo de estudio",
        medical_record_data_img: "Imagen de ficha",
      };
      const related = summary.related_data
        ?.filter((item: {count: number}) => item.count > 0)
        .map((item: {table: string; count: number}) => {
          const label = relatedLabels[item.table] ?? item.table.replace(/^medical_record_/, "Sección de ficha: ").replaceAll("_", " ");
          return `• ${item.count} × ${label}`;
        })
        .join("\n") || "Sin otros registros asociados.";

      const confirmed = window.confirm(
        `Vas a eliminar definitivamente al profesional "${fullName}" y sus datos relacionados:\n\n${related}\n\n¿Confirmás que se borre todo?`,
      );
      if (!confirmed) return;

      await dataService.deleteUser(user.user_id, summary.confirmation_token);
      setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
    } catch (err) {
      console.error("Error al eliminar profesional:", err);
      const status = (err as {response?: {status?: number}})?.response?.status;
      alert(status === 409
        ? "Los datos relacionados cambiaron. Volvé a revisar el detalle antes de borrar."
        : "Ocurrió un error al eliminar el profesional y sus datos relacionados. Por favor intentá nuevamente.");
    }
  };

  if (loading) {
    return (
      <Panel pageIcon={<Profesionals />} pageTitle="Profesionales">
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600" />
        </div>
      </Panel>
    );
  }

  return (
    <Panel pageIcon={<Profesionals />} pageTitle="Profesionales">
      <div className="flex flex-col items-end gap-5 overflow-x-auto">
        <Link
          className="flex w-max items-center gap-2 rounded-xl border px-3 py-1"
          href="/system/profesionales/add"
        >
          <p className="text-sm">Agregar profesional</p>
          <p className="text-xl font-bold">+</p>
        </Link>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#3A3A3A] text-white">
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Nombre completo</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">DNI</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Correo electrónico</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Teléfono</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Profesion</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((row) => (
              <tr
                key={row.professional_id}
                className="border-t border-[#4A4A4A] bg-[#333333] text-white"
              >
                <td className="border-r border-[#4A4A4A] px-3 py-2">
                  {`${row.name ?? ""} ${row.lastname ?? ""}`.trim()}
                </td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.dni}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.email}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.phone}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.speciality}</td>
                <td className="px-3 py-2">
                  <button
                    className="cursor-pointer rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                    type="button"
                    onClick={() => void handleDelete(row)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr className="border-t border-[#4A4A4A] bg-[#333333] text-white">
                <td className="px-3 py-4 text-center" colSpan={6}>
                  No hay profesionales registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
