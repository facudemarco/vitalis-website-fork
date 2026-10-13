"use client";
import {useEffect, useState} from "react";
import {useAuth} from "@/contexts/AuthContext";
import Link from "next/link";

import {UserCompany, UserPatient} from "@/types";

import {Clients} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";

import Panel from "../../components/Panel";

type Mode = "empresas" | "pacientes";

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
    trimmed === "básico + eeg + audiometría + psicotécnico + rx + drogas + test cereal + espiro" ||
    trimmed === "basico + eeg + audiometria + psicotecnico + rx + drogas + test cereal + espiro"
  ) {
    return "Básico de ley + EEG+ Audiometria + Psicotécnico + Radiografía de CLS frente y perfil + Drogas de abuso con benzodiacepinas y derivados+ Test del cereal + Espirometría";
  }

  return studyType;
};

const relatedTableLabels: Record<string, string> = {
  companies: "Empresa", patients: "Paciente/empleado", users: "Cuenta de usuario",
  medical_record: "Ficha médica", medical_record_data: "Datos personales de ficha",
  medical_record_data_img: "Imagen de ficha", studies: "Estudio", study_files: "Archivo de estudio",
  medical_record_signatures: "Firma del profesional", medical_record_laboral_signatures: "Firma laboral",
  medical_record_patient_signatures: "Firma del paciente", medical_record_medical_responsable_signatures: "Firma del responsable",
};
const relatedTableLabel = (table: string) => relatedTableLabels[table] ?? table.replace(/^medical_record_/, "Sección de ficha: ").replaceAll("_", " ");

export default function ClientesAdminPage() {
  const [mode, setMode] = useState<Mode>("empresas");
  const isEmpresas = mode === "empresas";
  const [patients, setPatients] = useState<UserPatient[]>([]);
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const {user} = useAuth();
  const isAdmin = user?.role === "admin";
  const canEdit = isAdmin || user?.role === "secretary";
  const [editingPatient, setEditingPatient] = useState<UserPatient | null>(null);
  const [editingCompany, setEditingCompany] = useState<UserCompany | null>(null);
  const [companyStatuses, setCompanyStatuses] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const getPatients = async () => {
      const patients = await dataService.getPatients();
      const companies = await dataService.getCompanie();
      const companyUsers = isAdmin ? (await dataService.getUsersFilters("company")).filter((account): account is UserCompany => account.role === "company") : [];

      setPatients(patients);
      setCompanies(companies);
      setCompanyStatuses(Object.fromEntries(companyUsers.map((company) => [company.id, company.is_active !== false])));
      setLoading(false);
    };

    void getPatients();
  }, [isAdmin]);

  // Reset search when switching tabs
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setSearch("");
  };

  const filteredCompanies = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.responsable_name?.toLowerCase().includes(q)
    );
  });

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    const fullName = `${p.first_name ?? ""} ${p.last_name ?? ""}`.toLowerCase();
    return (
      p.first_name?.toLowerCase().includes(q) ||
      p.last_name?.toLowerCase().includes(q) ||
      fullName.includes(q)
    );
  });

  if (loading) {
    return (
      <Panel pageIcon={<Clients />} pageTitle="Clientes">
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600" />
        </div>
      </Panel>
    );
  }

  return (
    <Panel pageIcon={<Clients />} pageTitle="Clientes">
      <div className="w-full">
        {/* Header verde con toggle */}
        <div className="grid grid-cols-2 text-center text-sm font-semibold">
          <button
            className={`cursor-pointer py-2 transition-all ${isEmpresas ? "bg-[#3F5C3B] text-white" : "bg-green text-blackW"}`}
            type="button"
            onClick={() => handleModeChange("empresas")}
          >
            Empresas
          </button>
          <button
            className={`cursor-pointer py-2 transition-all ${!isEmpresas ? "bg-[#3F5C3B] text-white" : "bg-[#A3DFA3] text-black"}`}
            type="button"
            onClick={() => handleModeChange("pacientes")}
          >
            Pacientes
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="my-3 px-1">
          <input
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder-gray-400 focus:border-blue-400 focus:outline-none"
            id="clientes-search"
            placeholder={isEmpresas ? "Buscar por nombre de empresa o responsable..." : "Buscar por nombre o apellido..."}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {isEmpresas ? (
                <tr className="my-2 bg-[#3A3A3A] text-white">
                  <th className="px-3 py-2 text-left">Nombre empresa</th>
                  <th className="px-3 py-2 text-left">Nombre responsable</th>
                  <th className="px-3 py-2 text-left">CUIT</th>
                  <th className="px-3 py-2 text-left">Correo electrónico</th>
                  <th className="px-3 py-2 text-left">Teléfono</th>
                  <th className="px-3 py-2 text-left">Empleados</th>
                  {canEdit && <th className="px-3 py-2 text-left">Acciones</th>}
                </tr>
              ) : (
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
                  {canEdit && <th className="px-3 py-2 text-left">Acciones</th>}
                </tr>
              )}
            </thead>

            <tbody>
              {isEmpresas
                ? filteredCompanies.map((row, idx) => (
                    <tr key={idx} className="border-t border-[#4A4A4A] bg-[#333333] text-white">
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row.responsable_name}</td>
                      <td className="px-3 py-2">{row.cuit}</td>
                      <td className="px-3 py-2">{row.email}</td>
                      <td className="px-3 py-2">{row.phone}</td>
                      <td className="px-3 py-2">
                        <Link
                          className="cursor-pointer text-center text-xs underline"
                          href={`/system/clientes/empresa/${row.id}`}
                        >
                          Ver
                        </Link>
                      </td>
                      {canEdit && <td className="px-3 py-2 whitespace-nowrap">
                        <button className="mr-3 underline" type="button" onClick={() => { setActionMessage(""); setEditingCompany(row); }}>Modificar</button>
                        {isAdmin && row.owner_user_id && <button className="underline" type="button" onClick={async () => {
                          const ownerUserId = row.owner_user_id;
                          if (!ownerUserId) return;
                          const nextStatus = companyStatuses[ownerUserId] === false;
                          try {
                            await dataService.updateUserStatus(ownerUserId, nextStatus);
                            setCompanyStatuses((current) => ({...current, [ownerUserId]: nextStatus}));
                          } catch {
                            setActionMessage("No se pudo actualizar el estado de la empresa.");
                          }
                        }}>{companyStatuses[row.owner_user_id ?? ""] === false ? "Activar" : "Desactivar"}</button>}
                        {isAdmin && <button className="ml-3 text-red-300 underline" type="button" onClick={async () => {
                          try {
                            const summary = await dataService.getCompanyDeletionSummary(row.id);
                            const employees = summary.employees?.length ? summary.employees.map((employee: {name: string}) => `• ${employee.name}`).join("\n") : "No tiene empleados asociados.";
                            const related = summary.related_data?.filter((item: {count: number}) => item.count > 0).map((item: {table: string; count: number}) => `• ${item.count} × ${relatedTableLabel(item.table)}`).join("\n") || "Sin otros registros asociados.";
                            const confirmed = window.confirm(`Vas a eliminar definitivamente la empresa "${summary.company_name}" y todos sus datos.\n\nTambién se eliminarán ${summary.employee_count} empleados:\n${employees}\n\nDatos relacionados:\n${related}\n\n¿Confirmás que se borre todo?`);
                            if (!confirmed) return;
                            await dataService.deleteCompany(row.id, summary.confirmation_token);
                            setCompanies((current) => current.filter((company) => company.id !== row.id));
                            setPatients((current) => current.filter((patient) => patient.company_id !== row.id));
                          } catch (error: unknown) { const changed = (error as {response?: {status?: number}})?.response?.status === 409; setActionMessage(changed ? "Los datos relacionados cambiaron. Volvé a intentar para revisar el nuevo detalle antes de borrar." : "No se pudo eliminar la empresa y sus datos relacionados."); }
                        }}>Eliminar</button>}
                      </td>}
                    </tr>
                  ))
                : filteredPatients.map((row, idx) => (
                    <tr
                      key={idx}
                      className="text-md border-t border-[#4A4A4A] bg-[#333333] text-white"
                    >
                      <td className="px-3 py-2">{row.first_name || "-"}</td>
                      <td className="px-3 py-2">{row.last_name || "-"}</td>
                      <td className="px-3 py-2">{row.dni || "-"}</td>
                      <td className="px-3 py-2">{row.date_of_birth || "-"}</td>
                      <td className="px-3 py-2">{row.phone || "-"}</td>
                      <td className="px-3 py-2">{row.social_security || "-"}</td>
                      <td className="px-3 py-2">
                        <Link
                          className="cursor-pointer text-xs underline"
                          href={`/system/clientes/${row.id}`}
                        >
                          Ver estud.
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          className="cursor-pointer text-xs underline"
                          href={`/system/medical-history/${row.id}`}
                        >
                          Acceder
                        </Link>
                      </td>
                      <td
                        className="cursor-help px-3 py-2 underline decoration-dotted"
                        title={getStudyDetail(row.study_type)}
                      >
                        {row.study_type ?? "-"}
                      </td>
                      {canEdit && <td className="px-3 py-2 whitespace-nowrap">
                        <button className="mr-3 underline" type="button" onClick={() => { setActionMessage(""); setEditingPatient(row); }}>Modificar</button>
                        {isAdmin && <button className="underline" type="button" onClick={async () => {
                          const nextStatus = row.is_active === false;
                          try { await dataService.updateUserStatus(row.user_id, nextStatus); setPatients((current) => current.map((patient) => patient.id === row.id ? {...patient, is_active: nextStatus} : patient)); }
                          catch { setActionMessage("No se pudo actualizar el estado del paciente."); }
                        }}>{row.is_active === false ? "Activar" : "Desactivar"}</button>}
                        {isAdmin && <button className="ml-3 text-red-300 underline" type="button" onClick={async () => {
                          try {
                            const summary = await dataService.getPatientDeletionSummary(row.id);
                            const related = summary.related_data?.filter((item: {count: number}) => item.count > 0).map((item: {table: string; count: number}) => `• ${item.count} × ${relatedTableLabel(item.table)}`).join("\n") || "Sin otros registros asociados.";
                            const confirmed = window.confirm(`Vas a eliminar definitivamente al paciente "${summary.patient_name}" y su cuenta, junto con todos los datos asociados:\n\n${related}\n\n¿Confirmás que se borre todo?`);
                            if (!confirmed) return;
                            await dataService.deletePatient(row.id, summary.confirmation_token);
                            setPatients((current) => current.filter((patient) => patient.id !== row.id));
                          } catch (error: unknown) { const changed = (error as {response?: {status?: number}})?.response?.status === 409; setActionMessage(changed ? "Los datos relacionados cambiaron. Volvé a intentar para revisar el nuevo detalle antes de borrar." : "No se pudo eliminar el paciente y sus datos relacionados."); }
                        }}>Eliminar</button>}
                      </td>}
                    </tr>
                  ))}

              {isEmpresas && filteredCompanies.length === 0 && (
                <tr className="border-t border-[#4A4A4A] bg-[#333333] text-white">
                  <td className="px-3 py-4 text-center" colSpan={canEdit ? 7 : 6}>
                    No se encontraron empresas{search ? ` para "${search}"` : ""}.
                  </td>
                </tr>
              )}
              {!isEmpresas && filteredPatients.length === 0 && (
                <tr className="border-t border-[#4A4A4A] bg-[#333333] text-white">
                  <td className="px-3 py-4 text-center" colSpan={canEdit ? 10 : 9}>
                    No se encontraron pacientes{search ? ` para "${search}"` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      {actionMessage && <p className="mt-3 text-sm text-red-700">{actionMessage}</p>}

      {(editingPatient || editingCompany) && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 text-black shadow-xl">
          <h2 className="mb-4 text-lg font-semibold">{editingPatient ? "Modificar paciente" : "Modificar empresa"}</h2>
          {editingPatient && <form className="space-y-3" onSubmit={async (event) => {
            event.preventDefault(); setSaving(true); setActionMessage("");
            const form = new FormData(event.currentTarget);
            try {
              await dataService.updatePatient(editingPatient.id, {
                first_name: String(form.get("first_name") ?? ""), last_name: String(form.get("last_name") ?? ""),
                dni: String(form.get("dni") ?? ""), date_of_birth: String(form.get("date_of_birth") ?? ""),
                phone: String(form.get("phone") ?? ""), address: String(form.get("address") ?? ""), social_security: String(form.get("social_security") ?? ""),
              });
              setPatients((current) => current.map((patient) => patient.id === editingPatient.id ? {...patient,
                first_name: String(form.get("first_name") ?? ""), last_name: String(form.get("last_name") ?? ""),
                dni: String(form.get("dni") ?? ""), date_of_birth: String(form.get("date_of_birth") ?? ""),
                phone: String(form.get("phone") ?? ""), address: String(form.get("address") ?? ""), social_security: String(form.get("social_security") ?? ""),
              } : patient)); setEditingPatient(null);
            } catch { setActionMessage("No se pudieron guardar los cambios del paciente."); }
            finally { setSaving(false); }
          }}>
            {[ ["first_name", "Nombre", editingPatient.first_name], ["last_name", "Apellido", editingPatient.last_name], ["dni", "DNI", editingPatient.dni], ["date_of_birth", "Fecha de nacimiento", editingPatient.date_of_birth], ["phone", "Teléfono", editingPatient.phone], ["address", "Dirección", editingPatient.address], ["social_security", "Obra social", editingPatient.social_security] ].map(([name, label, value]) => <label key={String(name)} className="block text-sm">{label}<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name={String(name)} type="text" defaultValue={String(value ?? "")} /></label>)}
            <div className="flex justify-end gap-2 pt-2"><button className="rounded border px-4 py-2" type="button" onClick={() => setEditingPatient(null)}>Cancelar</button><button className="rounded bg-[#3F5C3B] px-4 py-2 text-white disabled:opacity-60" disabled={saving} type="submit">{saving ? "Guardando..." : "Guardar"}</button></div>
          </form>}
          {editingCompany && <form className="space-y-3" onSubmit={async (event) => {
            event.preventDefault(); setSaving(true); setActionMessage("");
            const form = new FormData(event.currentTarget);
            try {
              if (!editingCompany.owner_user_id) throw new Error("Falta el usuario propietario de la empresa");
              await dataService.updateCompanyProfile(editingCompany.owner_user_id, form);
              setCompanies((current) => current.map((company) => company.id === editingCompany.id ? {...company,
                name: String(form.get("name") ?? ""), responsable_name: String(form.get("responsable_name") ?? ""),
                cuit: String(form.get("cuit") ?? ""), email: String(form.get("email") ?? ""),
                phone: String(form.get("phone") ?? ""), company_address: String(form.get("company_address") ?? ""), address: String(form.get("company_address") ?? ""),
              } : company)); setEditingCompany(null);
            } catch { setActionMessage("No se pudieron guardar los cambios de la empresa."); }
            finally { setSaving(false); }
          }}>
            {[ ["name", "Nombre de la empresa", editingCompany.name], ["responsable_name", "Responsable", editingCompany.responsable_name], ["cuit", "CUIT", editingCompany.cuit], ["email", "Correo electrónico", editingCompany.email], ["phone", "Teléfono", editingCompany.phone], ["company_address", "Domicilio", editingCompany.company_address || editingCompany.address] ].map(([name, label, value]) => <label key={String(name)} className="block text-sm">{label}<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name={String(name)} type="text" defaultValue={String(value ?? "")} /></label>)}
            <div className="flex justify-end gap-2 pt-2"><button className="rounded border px-4 py-2" type="button" onClick={() => setEditingCompany(null)}>Cancelar</button><button className="rounded bg-[#3F5C3B] px-4 py-2 text-white disabled:opacity-60" disabled={saving} type="submit">{saving ? "Guardando..." : "Guardar"}</button></div>
          </form>}
          {actionMessage && <p className="mt-3 text-sm text-red-700">{actionMessage}</p>}
        </div>
      </div>}
      </div>
    </Panel>
  );
}
