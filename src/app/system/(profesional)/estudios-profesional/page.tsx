"use client";
import Link from "next/link";
import {useEffect, useState, useRef} from "react";

import {UserPatient, UserCompany, StudiesCategory} from "@/types";

import {ArrowLeft, Estudies} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";

import Panel from "../../components/Panel";

const LEGACY_STUDY_TYPES = [
  ["Electrocardiograma", "Electrocardiograma"],
  ["Electroencefalograma", "Electroencefalograma"],
  ["Espirometria", "Espirometría"],
  ["Ergometria", "Ergometría"],
  ["Radiografia", "Radiografía"],
  ["Ecografia", "Ecografía"],
  ["Psicotecnico", "Psicotécnico"],
  ["Audiometria", "Audiometría"],
  ["analisis-clinico", "Análisis clínico de laboratorio"],
  ["Consentimiento informado", "Consentimiento informado (PDF)"],
] as const;

export default function page() {
  const [view, setView] = useState<"selection" | "companies" | "patients">("selection");
  const [patients, setPatients] = useState<UserPatient[]>([]);
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [studyCategories, setStudyCategories] = useState<StudiesCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Modal State
  const [selectedPatientForStudy, setSelectedPatientForStudy] = useState<UserPatient | null>(null);
  const [fileName, setFileName] = useState<string>("Sin archivos seleccionados");
  const [studyType, setStudyType] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, companiesRes] = await Promise.all([
          dataService.getPatients(),
          dataService.getCompanie(),
        ]);

        console.log("Patients fetched:", patientsRes);
        console.log("Companies fetched:", companiesRes);
        setPatients(patientsRes);
        setCompanies(companiesRes);
        try {
          setStudyCategories(await dataService.getCategories());
        } catch (categoryError) {
          console.error("Error fetching study categories:", categoryError);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const handleParticularClick = () => {
    setSelectedCompanyId(null);
    setView("patients");
  };

  const handleEmpresaClick = () => {
    setView("companies");
  };

  const handleCompanyClick = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setView("patients");
  };

  const handlePatientClick = (patient: UserPatient) => {
    setSelectedPatientForStudy(patient);
  };

  const closeModal = () => {
    setSelectedPatientForStudy(null);
    setFileName("Sin archivos seleccionados");
    setStudyType("");
    setDate("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleBack = () => {
    if (view === "patients" && selectedCompanyId) {
      setView("companies");
      setSelectedCompanyId(null);
    } else {
      setView("selection");
      setSelectedCompanyId(null);
    }
  };

  const consentStudyType = "Consentimiento informado";

  const handleChangeStudyType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStudyType = e.target.value;

    setStudyType(nextStudyType);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPatientForStudy) {
      console.error("No patient selected");

      return;
    }

    if (!studyType) {
      alert("Selecciona el tipo de estudio");
      return;
    }

    const f = new FormData();
    const file = fileRef.current?.files?.[0];

    if (!file) {
      alert(
        studyType === consentStudyType
          ? "Selecciona el PDF del consentimiento informado"
          : "Selecciona el archivo del estudio",
      );
      return;
    }

    if (studyType === consentStudyType && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("El consentimiento informado debe ser un archivo PDF");
      return;
    }

    f.append("study_files", file);
    f.append("study_type", studyType);
    f.append("status", studyType === consentStudyType ? "Disponible" : "pending");

    try {
      const res = await dataService.postStudie(selectedPatientForStudy.id, f);

      console.log(res);
      alert("Estudio cargado correctamente");
      closeModal();
    } catch (error) {
      console.error("Error uploading study:", error);
      const response = (error as {response?: {data?: {detail?: unknown}}})?.response;
      alert(
        typeof response?.data?.detail === "string"
          ? response.data.detail
          : "Error al cargar el estudio",
      );
    }
  };

  const getFilteredPatients = () => {
    if (view !== "patients") return [];
    if (selectedCompanyId) {
      return patients.filter((p) => p.company_id === selectedCompanyId);
    }

    return patients.filter((p) => !p.company_id);
  };

  const filteredPatients = getFilteredPatients();
  const categoryNames = new Set(
    studyCategories.map((category) => category.name.trim().toLowerCase()),
  );
  const studyTypeOptions = [
    ...studyCategories.map((category) => ({value: category.name, label: category.name})),
    ...LEGACY_STUDY_TYPES.filter(
      ([value]) => !categoryNames.has(value.trim().toLowerCase()),
    ).map(([value, label]) => ({value, label})),
  ];

  if (loading) {
    return (
      <Panel pageIcon={<Estudies />} pageTitle="Carga de estudios">
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600" />
        </div>
      </Panel>
    );
  }

  return (
    <Panel pageIcon={<Estudies />} pageTitle="Carga de estudios">
      <div className="mb-4">
        {view !== "selection" && (
          <button className="flex cursor-pointer items-center gap-1 font-bold" onClick={handleBack}>
            <ArrowLeft />
            Volver
          </button>
        )}
      </div>

      {view === "selection" && (
        <>
          <h1 className="my-5 text-center text-xl font-bold">¿Que tipo de paciente es?</h1>
          <section className="flex items-center justify-around gap-2">
            <div
              className="border-blue flex size-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 text-black hover:bg-blue-200"
              role="button"
              tabIndex={0}
              onClick={handleParticularClick}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleParticularClick();
              }}
            >
              <p className="text-center text-lg font-semibold">Particular</p>
            </div>
            <div
              className="border-blue flex size-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 text-black hover:bg-blue-200"
              role="button"
              tabIndex={0}
              onClick={handleEmpresaClick}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEmpresaClick();
              }}
            >
              <p className="text-center text-lg font-semibold">Empresa</p>
            </div>
          </section>
        </>
      )}

      {view === "companies" && (
        <>
          <h1 className="my-3 text-center text-xl font-bold">Empresas</h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className="border-blue cursor-pointer rounded-lg border p-6 shadow-md hover:bg-blue-100"
                role="button"
                tabIndex={0}
                onClick={() => handleCompanyClick(company.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCompanyClick(company.id);
                }}
              >
                <h3 className="text-lg font-bold">{company.name}</h3>
                <p className="text-sm text-gray-600">Responsable: {company.responsable_name}</p>
              </div>
            ))}

            {companies.length === 0 && (
              <p className="col-span-3 text-center">No se encontraron empresas.</p>
            )}
          </div>
        </>
      )}

      {view === "patients" && (
        <>
          <h2 className="mb-4 text-center text-xl font-bold">
            {selectedCompanyId ? "Empleados de la empresa" : "Pacientes Particulares"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="border-blue cursor-pointer rounded-lg border p-6 shadow-md hover:bg-blue-100"
                role="button"
                tabIndex={0}
                onClick={() => handlePatientClick(patient)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePatientClick(patient);
                }}
              >
                <h3 className="text-lg font-bold">
                  {patient.first_name} {patient.last_name}
                </h3>
                <p className="text-sm text-gray-600">DNI: {patient.dni}</p>
                <p className="text-sm text-gray-600">OS: {patient.social_security || "-"}</p>
              </div>
            ))}
            {filteredPatients.length === 0 && (
              <p className="col-span-3 text-center">No hay pacientes para mostrar.</p>
            )}
          </div>
        </>
      )}

      {selectedPatientForStudy && (
        <section className="bg-primary fixed top-1/2 left-1/2 z-50 max-h-[95vh] w-[80%] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl shadow-2xl">
          <div className="flex w-full flex-col items-center justify-center gap-6 bg-[#f4f6f8] px-6 py-10">
            <img alt="Logo" className="w-28" src="/logo.png" />
            <h2 className="text-xl font-bold text-gray-800">
              Cargar estudio para {selectedPatientForStudy.first_name}{" "}
              {selectedPatientForStudy.last_name}
            </h2>
            <form className="w-full max-w-3xl space-y-4" onSubmit={handleSubmit}>
              {/* Fecha */}
              <div className="relative">
                <input
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Select */}
              <div className="relative">
                <select
                  required
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  value={studyType}
                  onChange={handleChangeStudyType}
                >
                  <option disabled className="text-gray-400" value="">
                    Estudio realizado
                  </option>
                  {studyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                  ▾
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-800" htmlFor="study-pdf">
                  {studyType === consentStudyType
                    ? "Subir consentimiento informado (PDF)"
                    : "Subir archivo del estudio"}
                </label>
                <input
                  ref={fileRef}
                  accept={studyType === consentStudyType ? ".pdf,application/pdf" : "application/pdf,image/*"}
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900"
                  id="study-pdf"
                  name="study-pdf"
                  required
                  type="file"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (
                      studyType === consentStudyType &&
                      selectedFile &&
                      !selectedFile.name.toLowerCase().endsWith(".pdf")
                    ) {
                      e.target.value = "";
                      setFileName("Sin archivos seleccionados");
                      alert("El consentimiento informado debe ser un archivo PDF");
                      return;
                    }
                    setFileName(selectedFile ? selectedFile.name : "Sin archivos seleccionados");
                  }}
                />
                <p className="text-sm text-gray-500">{fileName}</p>
              </div>

              {/* Botones */}
              <div className="space-y-3 pt-2">
                <button
                  className="w-full cursor-pointer rounded-xl bg-sky-500 py-3 font-semibold text-white shadow-sm transition hover:bg-sky-600 active:scale-[0.99]"
                  type="submit"
                >
                  Subir
                </button>

                <button
                  className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-900 transition hover:bg-gray-50"
                  type="button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </Panel>
  );
}
