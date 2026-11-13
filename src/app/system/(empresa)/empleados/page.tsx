"use client";
import Link from "next/link";
import {useEffect, useState} from "react";

import {UserPatient} from "@/types";
import {Users} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";

import Panel from "../../components/Panel";

const getCreatedDate = (value?: string | null) => value?.slice(0, 10) ?? "";

export default function EmpleadosPage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<UserPatient[]>([]);
  const [createdDateFilter, setCreatedDateFilter] = useState("");

  useEffect(() => {
    const data = async () => {
      try {
        const res = await dataService.getPatientsFilters();
        setEmployees(res.filter((employee) => employee.patient_status === "Completado"));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void data();
  }, []);

  const filteredEmployees = employees
    .filter((employee) => !createdDateFilter || getCreatedDate(employee.created_at) === createdDateFilter)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

  if (loading)
    return (
      <Panel pageIcon={<Users />} pageTitle="Empleados">
        <p>Cargando...</p>
      </Panel>
    );

  return (
    <Panel pageIcon={<Users />} pageTitle="Empleados">
      <div className="flex flex-col items-end gap-5 overflow-x-auto">
        <Link
          className="flex w-max items-center gap-2 rounded-xl border px-3 py-1"
          href="/system/empleados/add"
        >
          <p className="text-sm">Agregar empleado</p>
          <p className="text-xl font-bold">+</p>
        </Link>
        <label className="mb-3 flex w-full flex-col gap-1 text-sm text-gray-700 sm:w-auto">
          Fecha de alta
          <input
            aria-label="Filtrar empleados por fecha de alta"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
            type="date"
            value={createdDateFilter}
            onChange={(event) => setCreatedDateFilter(event.target.value)}
          />
        </label>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#3A3A3A] text-white">
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Nombre completo</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">DNI</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Fecha de alta</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Fecha de nacimiento</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Obra social</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Puesto</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-center text-wrap">
                Historial de resultados
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((row) => (
              <tr key={row.id} className="border-t border-[#4A4A4A] bg-[#333333] text-white">
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.first_name}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.dni}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{getCreatedDate(row.created_at) || "-"}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.date_of_birth}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.social_security}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">Empleado</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2 text-center underline">
                  <Link href={`/system/empleados/${row.id}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEmployees.length === 0 && (
          <p className="mx-auto text-xl">
            {createdDateFilter
              ? "No hay empleados dados de alta en esa fecha."
              : "No hay empleados con estudios completos disponibles."}
          </p>
        )}
      </div>
    </Panel>
  );
}
