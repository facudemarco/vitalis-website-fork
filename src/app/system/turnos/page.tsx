"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {Calendar, ChevronLeft, ChevronRight, Clock, UserRound} from "lucide-react";

import Panel from "@/app/system/components/Panel";
import {useAuth} from "@/contexts/AuthContext";
import {dataService} from "@/services/dataService";
import type {PsychotechnicalAppointment, UserPatient} from "@/types";

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dateLabel = (value: string) => new Intl.DateTimeFormat("es-AR", {weekday: "long", day: "numeric", month: "long", year: "numeric"}).format(new Date(`${value}T12:00:00`));
const timeLabel = (value: string) => value.slice(11, 16);
const monthTitle = (value: Date) => new Intl.DateTimeFormat("es-AR", {month: "long", year: "numeric"}).format(value);
const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR");
const serviceWeekdays = [3, 5]; // Date.getDay(): domingo=0, miércoles=3, viernes=5.

function getNextServiceDate() {
  const now = new Date();
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    if (serviceWeekdays.includes(candidate.getDay()) && (offset > 0 || now.getHours() < 12)) {
      return dateKey(candidate);
    }
  }
  return dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7));
}

export default function TurnosPage() {
  const {user, profile} = useAuth();
  const [initialDate] = useState(() => getNextServiceDate());
  const [month, setMonth] = useState(() => {
    const date = new Date(`${initialDate}T12:00:00`);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [appointments, setAppointments] = useState<PsychotechnicalAppointment[]>([]);
  const [patients, setPatients] = useState<UserPatient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [booking, setBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const canBook = ["admin", "secretary", "company", "patient"].includes(user?.role ?? "");
  const canChoosePatient = user?.role === "admin" || user?.role === "secretary" || user?.role === "company";

  const monthBounds = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return {start: dateKey(first), end: dateKey(last)};
  }, [month]);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await dataService.getAppointments(monthBounds.start, monthBounds.end);
      setAppointments(result);
    } catch (err) {
      console.error("Error al cargar turnos:", err);
      setError("No se pudo cargar el calendario. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [monthBounds]);

  useEffect(() => { void loadAppointments(); }, [loadAppointments]);

  useEffect(() => {
    if (!canBook) return;
    dataService.getAppointmentPatients().then((rows) => {
      setPatients(rows);
      if (user?.role === "patient") setPatientId(rows[0]?.id ?? profile?.patient_id ?? "");
    }).catch((err) => {
      console.error("Error al cargar pacientes para turnos:", err);
      setError("No se pudieron cargar los pacientes habilitados para reservar.");
    });
  }, [canBook, profile?.patient_id, user?.role]);

  useEffect(() => {
    setSelectedTime("");
    setSlots([]);
    if (!canBook) return;
    dataService.getAvailableAppointmentSlots(selectedDate).then(setSlots).catch((err) => {
      console.error("Error al consultar disponibilidad:", err);
      setError("No se pudo consultar la disponibilidad para ese día.");
    });
  }, [canBook, selectedDate, appointments]);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({length: Math.ceil((offset + total) / 7) * 7}, (_, i) => {
      const day = i - offset + 1;
      return day > 0 && day <= total ? dateKey(new Date(month.getFullYear(), month.getMonth(), day)) : null;
    });
  }, [month]);

  const selectedAppointments = appointments.filter((appointment) => appointment.start_at.slice(0, 10) === selectedDate);
  const companies = useMemo(() => {
    const unique = new Map<string, string>();
    patients.forEach((patient) => unique.set(patient.company_id ?? "particular", patient.company_name || "Particular"));
    return Array.from(unique, ([id, name]) => ({id, name})).sort((a, b) => a.name.localeCompare(b.name, "es-AR"));
  }, [patients]);
  const filteredPatients = useMemo(() => {
    const query = normalizeSearch(patientSearch.trim());
    return patients.filter((patient) => {
      const fullName = normalizeSearch(`${patient.first_name} ${patient.last_name}`);
      const reverseName = normalizeSearch(`${patient.last_name} ${patient.first_name}`);
      const matchesName = !query || fullName.includes(query) || reverseName.includes(query);
      const matchesCompany = !companyFilter || (patient.company_id ?? "particular") === companyFilter;
      return matchesName && matchesCompany;
    });
  }, [companyFilter, patientSearch, patients]);
  const appointmentCounts = useMemo(() => appointments.reduce<Record<string, number>>((counts, appointment) => {
    if (appointment.status === "booked") {
      const day = appointment.start_at.slice(0, 10);
      counts[day] = (counts[day] ?? 0) + 1;
    }
    return counts;
  }, {}), [appointments]);

  const reserve = async () => {
    if (!patientId || !selectedTime) {
      setError("Seleccioná el paciente y un horario disponible.");
      return;
    }
    setBooking(true);
    setError("");
    setNotice("");
    try {
      await dataService.createAppointment(patientId, selectedDate, selectedTime);
      setSelectedTime("");
      setNotice("El turno quedó reservado.");
      await loadAppointments();
      setSlots(await dataService.getAvailableAppointmentSlots(selectedDate));
    } catch (err) {
      const response = (err as {response?: {data?: {detail?: string}}})?.response;
      setError(response?.data?.detail ?? "No se pudo reservar el turno. Revisá la disponibilidad e intentá de nuevo.");
    } finally {
      setBooking(false);
    }
  };

  const cancel = async (appointment: PsychotechnicalAppointment) => {
    if (!window.confirm(`¿Cancelar el turno de ${appointment.patient_name} del ${timeLabel(appointment.start_at)}?`)) return;
    try {
      await dataService.cancelAppointment(appointment.id);
      setNotice("El turno fue cancelado y el horario quedó disponible.");
      await loadAppointments();
      setSlots(await dataService.getAvailableAppointmentSlots(selectedDate));
    } catch (err) {
      const response = (err as {response?: {data?: {detail?: string}}})?.response;
      setError(response?.data?.detail ?? "No se pudo cancelar el turno.");
    }
  };

  return (
    <Panel pageIcon={<Calendar className="size-5" />} pageTitle="Calendario de turnos" wide>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div className="flex flex-col justify-between gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Exámenes psicotécnicos</h2>
            <p className="text-sm text-gray-600">Miércoles y viernes, de 6:00 a 12:30 · turnos de 30 minutos</p>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-[#F2F4F7] p-1 sm:justify-start">
            <button aria-label="Mes anterior" className="rounded-md p-2 hover:bg-white" type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft className="size-5" /></button>
            <span className="min-w-36 text-center font-semibold capitalize">{monthTitle(month)}</span>
            <button aria-label="Mes siguiente" className="rounded-md p-2 hover:bg-white" type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight className="size-5" /></button>
          </div>
        </div>

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="rounded-xl bg-white p-3 shadow-sm sm:p-5" aria-label="Calendario mensual">
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 sm:text-sm">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-gray-200">
              {days.map((day, index) => {
                const selectable = Boolean(day) && serviceWeekdays.includes(new Date(`${day}T12:00:00`).getDay());
                const selected = day === selectedDate;
                return <button key={`${day ?? "blank"}-${index}`} type="button" disabled={!day} onClick={() => day && setSelectedDate(day)} className={`relative min-h-16 border-b border-r border-gray-200 p-1 text-left sm:min-h-24 sm:p-2 ${!day ? "bg-gray-50" : "bg-white hover:bg-sky-50"} ${selectable ? "" : "text-gray-400"} ${selected ? "z-10 ring-2 ring-inset ring-sky-500" : ""}`}>
                  {day && <><span className={`inline-flex size-7 items-center justify-center rounded-full text-sm ${selected ? "bg-[#64BDEB] font-semibold text-white" : ""}`}>{Number(day.slice(-2))}</span>{selectable && <span className="mt-1 block text-[10px] leading-tight text-gray-500 sm:text-xs">Disponible</span>}{Boolean(appointmentCounts[day]) && <span className="absolute bottom-1 right-1 rounded-full bg-[#64BDEB] px-1.5 text-[10px] font-semibold text-white">{appointmentCounts[day]}</span>}</>}
                </button>;
              })}
            </div>
            <p className="mt-3 text-xs text-gray-500">Seleccioná un miércoles o viernes para consultar los turnos y la agenda del día.</p>
          </section>

          <div className="flex flex-col gap-5">
            {canBook && <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-1 font-semibold text-gray-900">Reservar turno</h3>
              <p className="mb-4 text-sm capitalize text-gray-600">{dateLabel(selectedDate)}</p>
              {canChoosePatient && <div className="mb-4 space-y-3">
                {(user?.role === "admin" || user?.role === "secretary") && <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">Buscar por nombre o apellido
                    <input className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2" placeholder="Ej.: Ana García" type="search" value={patientSearch} onChange={(event) => { setPatientSearch(event.target.value); setPatientId(""); }} />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">Empresa
                    <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2" value={companyFilter} onChange={(event) => { setCompanyFilter(event.target.value); setPatientId(""); }}>
                      <option value="">Todas las empresas</option>
                      {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                    </select>
                  </label>
                </div>}
                {user?.role === "company" && <label className="block text-sm font-medium text-gray-700">Buscar empleado por nombre o apellido
                  <input className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2" placeholder="Ej.: Ana García" type="search" value={patientSearch} onChange={(event) => { setPatientSearch(event.target.value); setPatientId(""); }} />
                </label>}
                <label className="block text-sm font-medium text-gray-700">Paciente / empleado
                  <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2" value={patientId} onChange={(event) => setPatientId(event.target.value)}>
                    <option value="">Seleccionar persona</option>
                    {filteredPatients.map((patient) => <option key={patient.id} value={patient.id}>{patient.last_name}, {patient.first_name} · DNI {patient.dni}{patient.company_name ? ` · ${patient.company_name}` : ""}</option>)}
                  </select>
                </label>
                {filteredPatients.length === 0 && <p className="text-xs text-gray-500">No hay pacientes que coincidan con esos filtros.</p>}
              </div>}
              {user?.role === "patient" && <p className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">El turno se reservará a tu nombre.</p>}
              {slots.length ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => <button key={slot} type="button" onClick={() => setSelectedTime(slot)} className={`rounded-lg border px-2 py-2 text-sm ${selectedTime === slot ? "border-[#168EAC] bg-[#168EAC] text-white" : "border-gray-300 bg-white text-gray-800 hover:border-[#168EAC]"}`}><Clock className="mr-1 inline size-3.5" />{slot}</button>)}
              </div> : <p className="rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-600">{serviceWeekdays.includes(new Date(`${selectedDate}T12:00:00`).getDay()) ? "No quedan horarios disponibles para esta fecha." : "La atención se realiza los miércoles y viernes."}</p>}
              <button type="button" disabled={booking || !patientId || !selectedTime} onClick={() => void reserve()} className="mt-4 w-full rounded-lg bg-[#168EAC] px-4 py-2.5 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{booking ? "Reservando…" : "Confirmar turno"}</button>
            </section>}

            <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
              <h3 className="font-semibold capitalize text-gray-900">Agenda · {dateLabel(selectedDate)}</h3>
              {loading ? <p className="py-5 text-sm text-gray-500">Cargando turnos…</p> : selectedAppointments.length === 0 ? <p className="py-5 text-sm text-gray-500">No hay turnos para esta fecha.</p> : <div className="mt-3 flex flex-col gap-3">
                {selectedAppointments.map((appointment) => <article key={appointment.id} className={`rounded-lg border p-3 ${appointment.status === "cancelled" ? "border-gray-200 bg-gray-50 opacity-70" : "border-sky-100 bg-sky-50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2"><UserRound className="mt-0.5 size-4 shrink-0 text-[#168EAC]" /><div><p className="font-semibold text-gray-900">{appointment.patient_name}</p><p className="text-sm text-gray-600">DNI: {appointment.dni ?? "-"}</p></div></div>
                    <span className="whitespace-nowrap rounded-full bg-white px-2 py-1 text-sm font-semibold text-gray-800">{timeLabel(appointment.start_at)}–{timeLabel(appointment.end_at)}</span>
                  </div>
                  <div className="mt-2 grid gap-1 pl-6 text-xs text-gray-600 sm:grid-cols-2"><span>Tel.: {appointment.phone || "-"}</span><span>Correo: {appointment.email || "-"}</span><span>Empresa: {appointment.company_name || "Particular"}</span></div>
                  {appointment.status === "cancelled" ? <p className="mt-2 pl-6 text-xs font-medium text-gray-500">Cancelado</p> : <button type="button" className="mt-2 pl-6 text-xs font-semibold text-red-700 underline" onClick={() => void cancel(appointment)}>Cancelar turno</button>}
                </article>)}
              </div>}
            </section>
          </div>
        </div>
      </div>
    </Panel>
  );
}
