"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import type {Roles} from "@/types";

import {
  Clients,
  Estudies,
  Logout,
  Pacientes,
  Profesionals,
  Support,
  Users,
  UserSVG,
} from "@/components/ui/Icons";
import {useAuth} from "@/contexts/AuthContext";
import {dataService} from "@/services/dataService";

import FullPanelSkeleton from "./FullPanelSkeleton";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const navByRole: Record<Roles, NavItem[]> = {
  admin: [
    {label: "Clientes", href: "/system/clientes", icon: <Clients />},
    {label: "Registrar", href: "/system/registro-manual", icon: <Users />},
    {label: "Usuarios", href: "/system/usuarios", icon: <Users />},
    {label: "Profesionales", href: "/system/profesionales", icon: <Profesionals />},
    {label: "Estudios", href: "/system/estudios", icon: <Estudies />},
    {label: "Soporte", href: "/system/soporte", icon: <Support />},
  ],
  secretary: [
    {label: "Clientes", href: "/system/clientes", icon: <Clients />},
    {label: "Registrar", href: "/system/registro-manual", icon: <Users />},
    {label: "Soporte", href: "/system/soporte", icon: <Support />},
  ],
  company: [
    {label: "Empleados", href: "/system/empleados", icon: <Clients />},
    {label: "Mis datos", href: "/system/mis-datos-empresa", icon: <Users />},
    {label: "Soporte", href: "/system/soporte-empresa", icon: <Support />},
  ],
  patient: [
    {label: "Mis estudios", href: "/system/estudios-pacientes", icon: <Clients />},
    {label: "Mis datos", href: "/system/mis-datos-pacientes", icon: <Users />},
    {label: "Soporte", href: "/system/soporte-pacientes", icon: <Support />},
  ],
  professional: [
    {label: "Pacientes", href: "/system/pacientes-profesional", icon: <Pacientes />},
    {label: "Estudios", href: "/system/estudios-profesional", icon: <Estudies />},
    {label: "Mis datos", href: "/system/mis-datos-profesional", icon: <Users />},
  ],
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle: string; // "Clientes", "Agregar usuario", "Mis datos", etc.
  pageIcon?: React.ReactNode; // iconito izquierda del título
}

// Función helper para obtener el label del usuario
function getUserLabel(user: NonNullable<ReturnType<typeof useAuth>["user"]>): string {
  if (user.role === "admin") {
    // Admin
    return `${user.first_name} ${user.last_name} - Administrador`;
  }
  if (user.role === "secretary") {
    // Secretary
    return `${user.first_name} ${user.last_name} - Secretaria`;
  }
  if (user.role === "company") {
    // Company
    // return `${user.name }- Empresa`;
    const [name, setName] = useState<string>("");

    useEffect(() => {
      const data = async () => {
        try {
          const res = await dataService.getCompanie();
          const company = res[0];

          setName(company.name);
        } catch (error) {
          console.error(error);
        }
      };

      void data();
    }, []);

    if (name === "") {
      return "Cargando...";
    }

    return `${name} - Empresa`;
  }
  if (user.role === "professional") {
    // Professional
    // return `${user.first_name} ${user.last_name} - Profesional - ${user.speciality}`;
    return `${user.first_name} ${user.last_name} - Profesional`;
  }

  // Patient
  return `${user.first_name} ${user.last_name} - Paciente`;
}

export default function Panel({children, pageTitle, pageIcon}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {user, logout} = useAuth();

  if (!user) {
    return <FullPanelSkeleton />;
  }

  const userLabel = getUserLabel(user);
  const navItems = navByRole[user.role];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f2f2f2] px-0 py-0 md:px-4 md:py-32">
      {/* Logo flotante superior */}
      <div className="relative w-full max-w-6xl">
        {/* Logo en móvil - centrado arriba */}
        <div className="flex justify-center bg-[#f2f2f2] pt-8 pb-4 md:hidden">
          <img
            alt="Vitalis"
            className="size-20 rounded-full border-4 border-[#F2F4F7] bg-[#F2F4F7]"
            src="/logo.png"
          />
        </div>

        {/* Logo desktop - flotante */}
        <div className="absolute -top-10 left-1/2 z-20 hidden -translate-x-1/2 md:block">
          <img
            alt="Vitalis"
            className="size-24 rounded-full border-10 border-[#F2F4F7] bg-[#F2F4F7]"
            src="/logo.png"
          />
        </div>

        {/* Card principal */}
        <section className="flex w-full flex-col overflow-hidden rounded-none bg-white shadow-sm md:mt-6 md:flex-row md:rounded-3xl">
          {/* Sidebar / Top Navigation */}
          <aside className="flex w-full flex-col bg-[#64BDEB] md:w-64 md:rounded-l-3xl md:py-8">
            {/* Navegación horizontal en móvil */}
            <nav className="mx-2 flex w-full flex-row items-center justify-center gap-1 px-4 py-4 md:mt-4 md:flex-col md:items-start md:justify-start md:gap-2 md:px-0">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    className={`flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm transition-all md:w-full md:justify-start md:px-6 ${
                      isActive
                        ? "bg-white text-black md:rounded-l-full md:rounded-r-none"
                        : "text-white hover:bg-white/15"
                    }`}
                    href={item.href}
                  >
                    {item.icon}
                    <span className="hidden text-lg md:block">{item.label}</span>
                  </Link>
                );
              })}

              {/* Botón logout en móvil (icono) */}
              <button
                className="flex cursor-pointer items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm text-white transition-all hover:bg-white/15 md:hidden"
                onClick={() => void handleLogout()}
              >
                <Logout />
              </button>
            </nav>

            {/* Botón logout solo desktop */}
            <div className="mt-auto hidden flex-col gap-2 px-6 pt-8 text-sm text-white md:flex">
              <button
                className="flex cursor-pointer gap-2 text-left hover:underline"
                onClick={() => void handleLogout()}
              >
                <Logout />
                <p>Cerrar sesión</p>
              </button>
            </div>
          </aside>

          {/* Contenido */}
          <section className="flex-1 bg-[#F2F4F7] px-4 py-6 md:rounded-3xl md:px-10 md:py-8">
            <header className="mb-4 flex flex-col gap-3 md:mb-0 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5">
                  {pageIcon ?? <span className="h-4 w-4 rounded-sm border border-black" />}
                </div>
                <h1 className="text-center text-sm font-semibold text-black lg:text-lg">
                  {pageTitle}
                </h1>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-black md:text-sm">
                <span className="truncate">{userLabel}</span>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[15px]">
                  <UserSVG />
                </span>
              </div>
            </header>
            {/* Slot de contenido */}
            <div className="h-full rounded-2xl p-2 md:p-6">{children}</div>
          </section>
        </section>
      </div>
    </main>
  );
}
