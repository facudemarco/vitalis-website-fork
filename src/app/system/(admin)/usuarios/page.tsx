"use client";

import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";

import {UserSVG} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";
import Panel from "../../components/Panel";

type UserRole = "admin" | "company" | "professional" | "patient" | "secretary";
type ManagedUser = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  dni?: string | number | null;
  date_of_birth?: string | null;
  phone?: string | number | null;
  role: UserRole;
  is_active?: boolean;
};
type ProfileForm = Record<string, string>;

const roleLabels: Record<UserRole | "all", string> = {
  all: "Todos",
  admin: "Administradores",
  professional: "Profesionales",
  patient: "Pacientes",
  company: "Empresas",
  secretary: "Secretarias/os",
};

const roles: UserRole[] = ["admin", "professional", "patient", "company", "secretary"];

const baseFields = [
  ["first_name", "Nombre"],
  ["last_name", "Apellido"],
  ["email", "Correo electrónico"],
  ["dni", "DNI"],
  ["date_of_birth", "Fecha de nacimiento"],
  ["phone", "Teléfono"],
] as const;

const profileFields: Record<UserRole, ReadonlyArray<readonly [string, string]>> = {
  admin: [],
  secretary: [],
  patient: [
    ["address", "Dirección"],
    ["social_security", "Obra social"],
  ],
  professional: [
    ["license_number", "Matrícula"],
    ["rol", "Profesión"],
    ["speciality", "Especialidad"],
  ],
  company: [
    ["company_name", "Nombre de la empresa"],
    ["responsable_name", "Nombre del responsable"],
    ["cuit", "CUIT"],
    ["company_address", "Dirección de la empresa"],
  ],
};

function toFormValue(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function getErrorMessage(error: unknown): string {
  const apiMessage = (error as {response?: {data?: {detail?: unknown}}})?.response?.data?.detail;
  if (apiMessage === "Email is already in use") return "Ese correo ya está registrado. Elegí otro para continuar.";
  return "Ocurrió un error. Revisá los datos e intentá nuevamente.";
}

export default function SystemUsuariosPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const groups = await Promise.all(roles.map((role) => dataService.getUsersFilters(role)));
      setUsers(groups.flat() as ManagedUser[]);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      alert("No se pudieron cargar los usuarios. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const visibleUsers = useMemo(
    () =>
      (selectedRole === "all" ? users : users.filter((user) => user.role === selectedRole)).slice()
        .sort((a, b) =>
          `${a.last_name ?? ""} ${a.first_name ?? ""}`.localeCompare(
            `${b.last_name ?? ""} ${b.first_name ?? ""}`,
          ),
        ),
    [selectedRole, users],
  );

  const openEdit = async (user: ManagedUser) => {
    const form: ProfileForm = {
      first_name: toFormValue(user.first_name),
      last_name: toFormValue(user.last_name),
      email: toFormValue(user.email),
      dni: toFormValue(user.dni),
      date_of_birth: toFormValue(user.date_of_birth).slice(0, 10),
      phone: toFormValue(user.phone),
    };

    try {
      if (user.role === "patient") {
        const patients = (await dataService.getPatientsFilters()) as unknown as Array<
          Record<string, unknown>
        >;
        const patient = patients.find((item) => item.user_id === user.id);
        form.address = toFormValue(patient?.address);
        form.social_security = toFormValue(patient?.social_security);
      } else if (user.role === "professional") {
        const professionals = (await dataService.getProfessionals()) as unknown as Array<
          Record<string, unknown>
        >;
        const professional = professionals.find((item) => item.user_id === user.id);
        form.license_number = toFormValue(professional?.license_number);
        form.rol = toFormValue(professional?.rol);
        form.speciality = toFormValue(professional?.speciality);
      } else if (user.role === "company") {
        const companies = (await dataService.getCompanie()) as unknown as Array<
          Record<string, unknown>
        >;
        const company = companies.find((item) => item.owner_user_id === user.id);
        form.company_name = toFormValue(company?.name);
        form.responsable_name = toFormValue(company?.responsable_name);
        form.cuit = toFormValue(company?.cuit);
        form.company_address = toFormValue(company?.address);
      }
    } catch (error) {
      console.error("Error al cargar datos extendidos del usuario:", error);
      alert("No se pudieron cargar todos los datos del perfil. Volvé a intentarlo antes de guardar.");
      return;
    }

    setProfileForm(form);
    setEditingUser(user);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;

    setSavingProfile(true);
    try {
      const formData = new FormData();
      Object.entries(profileForm).forEach(([key, value]) => formData.append(key, value));
      await dataService.updateManagedUserProfile(editingUser.id, formData);
      setUsers((current) =>
        current.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                first_name: profileForm.first_name,
                last_name: profileForm.last_name,
                email: profileForm.email,
                dni: profileForm.dni,
                date_of_birth: profileForm.date_of_birth,
                phone: profileForm.phone,
              }
            : user,
        ),
      );
      setEditingUser(null);
      alert("Los datos del usuario se actualizaron correctamente.");
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert(getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleActive = async (user: ManagedUser) => {
    const nextState = !user.is_active;
    try {
      await dataService.updateUserStatus(user.id, nextState);
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? {...item, is_active: nextState} : item)),
      );
    } catch (error) {
      console.error("Error al actualizar el estado del usuario:", error);
      alert("No se pudo actualizar el estado del usuario.");
    }
  };

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordUser) return;
    if (newPassword.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    setSavingPassword(true);
    try {
      await dataService.resetManagedUserPassword(passwordUser.id, newPassword);
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
      alert("La contraseña se restableció correctamente.");
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      alert(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Panel pageIcon={<UserSVG />} pageTitle="Usuarios">
      <div className="flex flex-col gap-5 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(roleLabels) as Array<UserRole | "all">).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  selectedRole === role
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-neutral-500 bg-[#333333] text-white hover:bg-[#454545]"
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>
          <Link
            className="flex w-max items-center gap-2 rounded-xl border px-3 py-2 text-white"
            href="/system/usuarios/add"
          >
            <span className="text-sm">Agregar usuario</span>
            <span className="text-xl font-bold">+</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : (
          <table className="w-full min-w-[850px] text-xs">
            <thead>
              <tr className="bg-[#3A3A3A] text-white">
                <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Usuario</th>
                <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Correo electrónico</th>
                <th className="border-r border-[#4A4A4A] px-3 py-2 text-left">Tipo</th>
                <th className="border-r border-[#4A4A4A] px-3 py-2 text-center">Activo</th>
                <th className="px-3 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id} className="border-t border-[#4A4A4A] bg-[#333333] text-white">
                  <td className="border-r border-[#4A4A4A] px-3 py-2">
                    {`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "—"}
                  </td>
                  <td className="border-r border-[#4A4A4A] px-3 py-2">{user.email}</td>
                  <td className="border-r border-[#4A4A4A] px-3 py-2">{roleLabels[user.role]}</td>
                  <td className="border-r border-[#4A4A4A] px-3 py-2 text-center">
                    {user.is_active ? "Sí" : "No"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        className="rounded bg-blue-600 px-2 py-1 font-semibold hover:bg-blue-700"
                        type="button"
                        onClick={() => void openEdit(user)}
                      >
                        Modificar
                      </button>
                      <button
                        className="rounded bg-amber-600 px-2 py-1 font-semibold hover:bg-amber-700"
                        type="button"
                        onClick={() => {
                          setPasswordUser(user);
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                      >
                        Restablecer contraseña
                      </button>
                      <button
                        className={`rounded px-2 py-1 font-semibold ${
                          user.is_active
                            ? "bg-red-700 hover:bg-red-800"
                            : "bg-green-700 hover:bg-green-800"
                        }`}
                        type="button"
                        onClick={() => void toggleActive(user)}
                      >
                        {user.is_active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleUsers.length === 0 && (
                <tr className="border-t border-[#4A4A4A] bg-[#333333] text-white">
                  <td className="px-3 py-5 text-center" colSpan={5}>
                    No hay usuarios en esta categoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <form
            className="my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[#252525] p-6 text-white shadow-xl"
            onSubmit={saveProfile}
          >
            <h2 className="mb-1 text-xl font-semibold">Modificar usuario</h2>
            <p className="mb-5 text-sm text-neutral-300">
              {roleLabels[editingUser.role]} · {editingUser.email}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[...baseFields, ...profileFields[editingUser.role]].map(([field, label]) => (
                <label className="flex flex-col gap-1 text-sm" key={field}>
                  <span>{label}</span>
                  <input
                    className="rounded border border-neutral-500 bg-[#333333] px-3 py-2 text-white"
                    type={field === "date_of_birth" ? "date" : field === "email" ? "email" : "text"}
                    required={field === "email"}
                    value={profileForm[field] ?? ""}
                    onChange={(event) =>
                      setProfileForm((current) => ({...current, [field]: event.target.value}))
                    }
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded border border-neutral-400 px-4 py-2"
                type="button"
                disabled={savingProfile}
                onClick={() => setEditingUser(null)}
              >
                Cancelar
              </button>
              <button
                className="rounded bg-blue-600 px-4 py-2 font-semibold disabled:opacity-60"
                type="submit"
                disabled={savingProfile}
              >
                {savingProfile ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            className="w-full max-w-md rounded-xl bg-[#252525] p-6 text-white shadow-xl"
            onSubmit={resetPassword}
          >
            <h2 className="mb-2 text-xl font-semibold">Restablecer contraseña</h2>
            <p className="mb-5 text-sm text-neutral-300">
              Ingresá la nueva contraseña para {passwordUser.email}. No requiere verificación del
              usuario.
            </p>
            <label className="mb-4 flex flex-col gap-1 text-sm">
              <span>Nueva contraseña</span>
              <input
                className="rounded border border-neutral-500 bg-[#333333] px-3 py-2 text-white"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Repetir contraseña</span>
              <input
                className="rounded border border-neutral-500 bg-[#333333] px-3 py-2 text-white"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded border border-neutral-400 px-4 py-2"
                type="button"
                disabled={savingPassword}
                onClick={() => setPasswordUser(null)}
              >
                Cancelar
              </button>
              <button
                className="rounded bg-amber-600 px-4 py-2 font-semibold disabled:opacity-60"
                type="submit"
                disabled={savingPassword}
              >
                {savingPassword ? "Actualizando..." : "Restablecer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </Panel>
  );
}
