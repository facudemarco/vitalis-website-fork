"use client";
import Link from "next/link";
import {useEffect, useState} from "react";

import {UserPatient, UserProfile} from "@/types";

import {Users} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";
import {authService} from "@/services/authService";

import Panel from "../../components/Panel";

export default function EmpleadosPage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<UserPatient[]>([]);
  const [profile, setProfile] = useState<UserProfile>();

  useEffect(() => {
    const data = async () => {
      try {
        const {profile} = await authService.getCurrentUser();

        setProfile(profile);

        const res = await dataService.getPatientsFilters();

        setEmployees(res);
        setLoading(false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void data();
  }, []);



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
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#3A3A3A] text-white">
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Nombre completo</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">DNI</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Fecha de nacimiento</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Obra social</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Puesto</th>
              <th className="border-r border-[#4A4A4A] px-3 py-2 text-center text-wrap">
                Historial de resultados
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map((row, idx) => (
              <tr key={idx} className="border-t border-[#4A4A4A] bg-[#333333] text-white">
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.first_name}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.dni}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.date_of_birth}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">{row.social_security}</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2">Empleado</td>
                <td className="border-r border-[#4A4A4A] px-3 py-2 text-center underline">
                  <Link href={`/system/empleados/${row.id}`}>Ver</Link>
                </td>
                <td className="px-3 py-2 text-center underline">
 table>
        {employees.length === 0 && <p className="mx-auto text-xl">No hay empleados cargados</p>}
      </div>
    </Panel>
  );
}
