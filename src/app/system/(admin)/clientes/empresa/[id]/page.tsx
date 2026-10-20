"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";

import {UserCompany, UserPatient} from "@/types";
import {ArrowLeft, Clients} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";
import {useAuth} from "@/contexts/AuthContext";
import Panel from "@/app/system/components/Panel";

const getStudyDetail = (studyType?: string) => {
  if (!studyType) return "Sin estudio asignado";
  const trimmed = studyType.trim().toLowerCase();

  if (trimmed === "estudio1" || trimmed === "basico de ley" || trimmed === "básico de ley") {
    return "Básico de ley (Consentimiento informado + ECG + Radiografía de Tórax frente, Exámen Clínico)";
  }
  if (trimmed === "estudio2" || trimmed === "básico + eeg + audiometría + psicotécnico + rx" || trimmed === "basico + eeg + audiometria + psicotecnico + rx") {
    return "Básico de ley + EEG + Audiometria+ Psicotécnico + Radiografía de CLS frente y perfil";
  }
  if (trimmed === "estudio3" || trimmed === "básico + eeg + audiometría + psicotécnico + rx + drogas" || trimmed === "basico + eeg + audiometria + psicotecnico + rx + drogas") {
    return "Básico de ley + EEG+ Audiometría+ Psicotécnico + Radiografía de CLS frente y perfil + Drogas de abuso con Benzodiacepinas y derivados";
  }
  if (trimmed === "estudio4" || trimmed === "básico + eeg + audiometría + psicotécnico + rx + drogas (m/c)" || trimmed === "basico + eeg + audiometria + psicotecnico + rx + drogas (m/c)") {
    return "Básico de ley + EEG + Audiometria + Psicotecnico + Radiografía de CLS y CC frente y perfil + Drogas de abuso (Marihuana y Cocaina)";
  }
  if (trimmed === "estudio5" || trimmed === "básico + eeg + audiometría + psicotécnico + rx + drogas + test cereal + espiro" || trimmed === "basico + eeg + audiometria + psicotecnico + rx + drogas + test cereal + espiro") {
    return "Básico de ley + EEG+ Audiometria + Psicotécnico + Radiografía de CLS frente y perfil + Drogas de abuso con benzodiacepinas y derivados+ Test del cereal + Espirometría";
  }

  return studyType;
};

type DeletionSummary = {
  patient_name: string;
  confirmation_token: string;
  related_data?: Array<{table: string; count: number}>;
};

export default function EmpresaEmpleadosPage() {
  const params = useParams();
  const companyId = params.id as string;
  const {user} = useAuth();
  const isAdmin = user?.role === "admin";

  const [patients, setPatients] = useState<UserPatient[]>([]);
  const [company, setCompany] = useState<UserCompany | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [editingPatient, setEditingPatient] = useState<UserPatient | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, companiesData] = await Promise.all([
          dataService.getPatients(),
          dataService.getCompanie(),
        ]);

        setPatients(patientsData.filter((patient) => patient.company_id === companyId));
        const currentCompany = companiesData.find((item) => item.id === companyId);
        if (currentCompany) setCompany(currentCompany);
      } catch (error) {
        console.error("Error fetching company employees data:", error);
        setActionMessage("No se pudieron cargar los empleados de la empresa.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [companyId]);

  const handleDelete = async (patient: UserPatient) => {
    setActionMessage("");
    try {
      const summary = await dataService.getPatientDeletionSummary(patient.id) as DeletionSummary;
      const related = summary.related_data
        ?.filter((item) => item.count > 0)
        .map((item) => `• ${item.count} × ${item.table.replaceAll("_", " ")}`)
        .join("\n") || "Sin otros datos asociados.";
      const confirmed = window.confirm(
        `Vas a eliminar definitivamente al empleado "${summary.patient_name}" y su cuenta, junto con los datos asociados:\n\n${related}\n\n¿Confirmás que se borre todo?`,
      );
      if (!confirmed) return;

      await dataService.deletePatientCompany(companyId, patient.id, summary.confirmation_token);
      setPatients((current) => current.filter((item) => item.id !== patient.id));
    } catch (error: unknown) {
      const responseError = error as {response?: {status?: number}};
      setActionMessage(
        responseError.response?.status === 409
          ? "Los datos relacionados cambiaron. Volvé a revisar el detalle antes de borrar."
          : "No se pudo eliminar el empleado y sus datos relacionados.",
      );
    }
  };

  if (loading) {
    return (
      <Panel pageIcon={<Clients />} pageTitle="Empleados de Empresa">
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600" />
        </div>
      </Panel>
    );
  }

  const title = company ? `Empleados de ${company.name}` : "Empleados de Empresa";
  const query = search.toLowerCase();
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.toLowerCase();
    return (
      patient.first_name?.toLowerCase().includes(query) ||
      patient.last_name?.toLowerCase().includes(query) ||
      fullName.includes(query)
    );
  });

  return (
    <Panel pageIcon={<Clients />} pageTitle={title}>
      <div className="w-full">
        <div className="mb-5">
          <Link className="flex cursor-pointer items-center gap-1 font-bold text-black" href="/system/clientes">
            <ArrowLeft />
            Volver
          </Link>
        </div>

        <div className="mb-3">
          <input
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder-gray-400 focus:border-blue-400 focus:outline-none"
            id="empleados-search"
            placeholder="Buscar empleado por nombre o apellido..."
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {actionMessage && <p className="mb-3 text-sm text-red-700" role="alert">{actionMessage}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#3A3A3A] text-white">
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">Apellido</th>
                <th className="px-3 py-2 text-left">DNI</th>
                <th className="px-3 py-2 text-left">Fecha de nacimiento</th>
                <th className="px-3 py-2 text-left">Teléfono</th>
                <th className="px-3 py-2 text-left">Obra social</th>
                <th className="px-3 py-2 text-left">Resultados</th>
                <th className="px-3 py-2 text-left">Ficha</th>
                <th className="px-3 py-2 text-left">Tipo de estudio</th>
                {isAdmin && <th className="px-3 py-2 text-left">Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((row) => (
                <tr key={row.id} className="text-md border-t border-[#4A4A4A] bg-[#333333] text-white">
                  <td className="px-3 py-2">{row.first_name || "-"}</td>
                  <td className="px-3 py-2">{row.last_name || "-"}</td>
                  <td className="px-3 py-2">{row.dni || "-"}</td>
                  <td className="px-3 py-2">{row.date_of_birth || "-"}</td>
                  <td className="px-3 py-2">{row.phone || "-"}</td>
                  <td className="px-3 py-2">{row.social_security || "-"}</td>
                  <td className="px-3 py-2">
                    <Link className="cursor-pointer text-xs underline" href={`/system/clientes/${row.id}`}>
                      Ver estud.
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Link className="cursor-pointer text-xs underline" href={`/system/medical-history/${row.id}`}>
                      Acceder
                    </Link>
                  </td>
                  <td className="cursor-help px-3 py-2 underline decoration-dotted" title={getStudyDetail(row.study_type)}>
                    {row.study_type ?? "-"}
                  </td>
                  {isAdmin && (
                    <td className="whitespace-nowrap px-3 py-2">
                      <button
                        className="mr-3 underline"
                        type="button"
                        onClick={() => { setActionMessage(""); setEditingPatient(row); }}
                      >
                        Modificar
                      </button>
                      <button className="text-red-300 underline" type="button" onClick={() => void handleDelete(row)}>
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {filteredPatients.length === 0 && (
                <tr className="border-t border-[#4A4A4A] bg-[#333333] text-white">
                  <td className="px-3 py-4 text-center" colSpan={isAdmin ? 10 : 9}>
                    {search
                      ? `No se encontraron empleados para "${search}".`
                      : "No hay empleados registrados para esta empresa."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isAdmin && editingPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 text-black shadow-xl">
              <h2 className="mb-4 text-lg font-semibold">Modificar empleado</h2>
              <form
                className="space-y-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setSaving(true);
                  setActionMessage("");
                  const form = new FormData(event.currentTarget);
                  const updates = {
                    first_name: String(form.get("first_name") ?? ""),
                    last_name: String(form.get("last_name") ?? ""),
                    dni: String(form.get("dni") ?? ""),
                    date_of_birth: String(form.get("date_of_birth") ?? ""),
                    phone: String(form.get("phone") ?? ""),
                    address: String(form.get("address") ?? ""),
                    social_security: String(form.get("social_security") ?? ""),
                  };
                  try {
                    const updated = await dataService.updatePatient(editingPatient.id, updates);
                    setPatients((current) =>
                      current.map((patient) => patient.id === editingPatient.id ? {...patient, ...updates, ...updated} : patient),
                    );
                    setEditingPatient(null);
                  } catch {
                    setActionMessage("No se pudieron guardar los cambios del empleado.");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <label className="block text-sm">Nombre<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name="first_name" defaultValue={editingPatient.first_name ?? ""} /></label>
                <label className="block text-sm">Apellido<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name="last_name" defaultValue={editingPatient.last_name ?? ""} /></label>
                <label className="block text-sm">DNI<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name="dni" defaultValue={editingPatient.dni ?? ""} /></label>
                <label className="block text-sm">Fecha de nacimiento<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name="date_of_birth" defaultValue={editingPatient.date_of_birth ?? ""} /></label>
                <label className="block text-sm">Teléfono<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name="phone" defaultValue={editingPatient.phone ?? ""} /></label>
                <label className="block text-sm">Dirección<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name="address" defaultValue={editingPatient.address ?? ""} /></label>
                <label className="block text-sm">Obra social<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name="social_security" defaultValue={editingPatient.social_security ?? ""} /></label>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="rounded border px-4 py-2" type="button" onClick={() => setEditingPatient(null)}>Cancelar</button>
                  <button className="rounded bg-[#3F5C3B] px-4 py-2 text-white disabled:opacity-60" disabled={saving} type="submit">
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
