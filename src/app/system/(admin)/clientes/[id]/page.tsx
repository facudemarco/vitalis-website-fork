"use client";

import Link from "next/link";
import {use, useEffect, useRef, useState} from "react";

import {Studies, UserPatient} from "@/types";

import {dataService} from "@/services/dataService";
import EstudiosCard from "@/app/system/(pacientes)/estudios-pacientes/EstudiosCard";
import Panel from "@/app/system/components/Panel";
import {ArrowLeft, Clients} from "@/components/ui/Icons";

interface PageProps {
  params: Promise<{id: string}>;
}

export function ClientesEstudiosPage({params}: PageProps) {
  const [studies, setStudies] = useState<Studies[]>([]);
  const patient_id = use(params).id;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (patient_id) {
      const getStudies = async () => {
        try {
          const response = await dataService.getStudiesByPatientId(patient_id);

          setStudies(response);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching studies:", error);
          setIsLoading(false);
        }
      };

      void getStudies();
    }
  }, [patient_id]);

  return (
    <Panel pageIcon={<Clients />} pageTitle="Estudios - Paciente">
      {isLoading ? (
        <p className="my-auto text-center font-semibold">Cargando estudios...</p>
      ) : studies.length === 0 ? (
        <p className="my-auto text-center font-semibold">No tienes estudios aún.</p>
      ) : (
        <section className="flex max-h-82 flex-col gap-5 overflow-y-scroll md:px-10">
          {studies.map((study: Studies) => (
            <EstudiosCard key={study.id} studies={study} />
          ))}
        </section>
      )}
    </Panel>
  );
}

export default function EstudiosPacientesPage({params}: PageProps) {
  const [data, setData] = useState<UserPatient | null>(null);
  const id = use(params).id;
  const [studies, setStudies] = useState<Studies[]>([]);
  const [uploadingConsent, setUploadingConsent] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [consentFile, setConsentFile] = useState<File | null>(null);
  const consentFileInput = useRef<HTMLInputElement | null>(null);
  const [heightFile, setHeightFile] = useState<File | null>(null);
  const [uploadingHeight, setUploadingHeight] = useState(false);
  const [heightError, setHeightError] = useState<string | null>(null);
  const [heightSuccess, setHeightSuccess] = useState(false);
  const heightFileInput = useRef<HTMLInputElement | null>(null);

  const existingConsent = studies.find(
    (study) => study.study_type?.trim().toLocaleLowerCase() === "consentimiento informado",
  );
  const hasConsentPdf = Boolean(existingConsent?.files?.length);
  const hasLegacyConsentWithoutPdf = Boolean(existingConsent && !existingConsent.files?.length);
  const heightStudyType = "Cuestionario para trabajadores en altura, conducción de vehículos y trabajos en espacios confinados";
  const existingHeightStudy = studies.find((study) => study.study_type?.trim().toLocaleLowerCase() === heightStudyType.toLocaleLowerCase());
  const hasHeightPdf = Boolean(existingHeightStudy?.files?.length);
  const hasLegacyHeightWithoutPdf = Boolean(existingHeightStudy && !existingHeightStudy.files?.length);

  useEffect(() => {
    const data = async () => {
      try {
        const res = await dataService.getPatientById(id);
        const studies = await dataService.getStudiesByPatientId(id);

        setData(res);
        setStudies(studies);
      } catch (error) {
        console.error(error);
      }
    };

    void data();
  }, [id]);

  const registerConsent = async () => {
    if (!consentFile) {
      setUploadError("Adjuntá el PDF del consentimiento informado.");
      return;
    }
    if (!consentFile.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("El consentimiento informado debe ser un archivo PDF.");
      return;
    }

    setUploadingConsent(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("study_type", "Consentimiento informado");
      formData.append("status", "Disponible");
      formData.append("study_files", consentFile);
      await dataService.postStudie(id, formData);
      setStudies(await dataService.getStudiesByPatientId(id));
      setConsentFile(null);
      if (consentFileInput.current) consentFileInput.current.value = "";
      setUploadSuccess(true);
    } catch (error) {
      console.error("Error registrando consentimiento informado:", error);
      const response = (error as {response?: {data?: {detail?: unknown}}})?.response;
      setUploadError(
        typeof response?.data?.detail === "string"
          ? response.data.detail
          : "No se pudo registrar el consentimiento informado.",
      );
    } finally {
      setUploadingConsent(false);
    }
  };

  const registerHeightStudy = async () => {
    if (!heightFile) { setHeightError("Adjuntá el PDF completado del cuestionario."); return; }
    if (!heightFile.name.toLowerCase().endsWith(".pdf")) { setHeightError("El cuestionario debe adjuntarse en formato PDF."); return; }
    setUploadingHeight(true); setHeightError(null); setHeightSuccess(false);
    try {
      const formData = new FormData();
      formData.append("study_type", heightStudyType);
      formData.append("status", "Disponible");
      formData.append("study_files", heightFile);
      await dataService.postStudie(id, formData);
      setStudies(await dataService.getStudiesByPatientId(id));
      setHeightFile(null);
      if (heightFileInput.current) heightFileInput.current.value = "";
      setHeightSuccess(true);
    } catch (error) {
      const response = (error as {response?: {data?: {detail?: unknown}}})?.response;
      setHeightError(typeof response?.data?.detail === "string" ? response.data.detail : "No se pudo cargar el cuestionario.");
    } finally { setUploadingHeight(false); }
  };

  const heightUploadControl = (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-gray-200 p-3">
      <p className="font-semibold">Cuestionario de altura</p>
      {hasHeightPdf ? <p className="text-sm font-medium text-green-700">El cuestionario ya está registrado para este paciente.</p> : <>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {hasLegacyHeightWithoutPdf ? "Adjuntar PDF al estudio existente" : "Subir cuestionario completado (PDF)"}
          <input ref={heightFileInput} accept=".pdf,application/pdf" className="rounded-lg border border-gray-300 bg-white p-2" disabled={uploadingHeight} type="file" onChange={(event) => setHeightFile(event.target.files?.[0] || null)} />
        </label>
        <button className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={uploadingHeight || !heightFile} type="button" onClick={() => void registerHeightStudy()}>
          {uploadingHeight ? "Subiendo..." : "Subir cuestionario"}
        </button>
      </>}
      {heightError && <p className="text-sm text-red-700">{heightError}</p>}
      {heightSuccess && <p className="text-sm text-green-700">Cuestionario disponible.</p>}
    </div>
  );

  const consentUploadControl = (
    <div className="flex flex-col items-start gap-2">
      {hasConsentPdf ? (
        <p className="text-sm font-medium text-green-700">
          El consentimiento informado ya está registrado para este paciente.
        </p>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {hasLegacyConsentWithoutPdf
              ? "Adjuntar PDF al consentimiento informado existente"
              : "Consentimiento informado (PDF)"}
            <input
              ref={consentFileInput}
              accept=".pdf,application/pdf"
              className="rounded-lg border border-gray-300 bg-white p-2"
              disabled={uploadingConsent}
              type="file"
              onChange={(event) => setConsentFile(event.target.files?.[0] || null)}
            />
          </label>
          <button
            className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
            disabled={uploadingConsent || !consentFile}
            type="button"
            onClick={() => void registerConsent()}
          >
            {uploadingConsent
              ? "Subiendo..."
              : hasLegacyConsentWithoutPdf
                ? "Adjuntar PDF"
                : "Subir consentimiento informado"}
          </button>
        </>
      )}
      {uploadError && <p className="text-sm text-red-700">{uploadError}</p>}
      {uploadSuccess && (
        <p className="text-sm text-green-700">Consentimiento informado disponible.</p>
      )}
    </div>
  );

  if (!data) {
    return (
      <Panel pageIcon={<Clients />} pageTitle="Historial de estudios">
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600" />
        </div>
      </Panel>
    );
  }

  if (studies.length === 0) {
    return (
      <Panel pageIcon={<Clients />} pageTitle="Historial de estudios">
        <section className="flex flex-col items-start gap-3">
          <Link className="flex items-center gap-1 font-bold" href="/system/clientes">
            <ArrowLeft />
            Volver
          </Link>
          <p>No hay estudios</p>
          {consentUploadControl}
          {heightUploadControl}
        </section>
      </Panel>
    );
  }

  return (
    <Panel
      pageIcon={<Clients />}
      pageTitle={`Historial de estudios - ${data.first_name} ${data.last_name}`}
    >
      <section className="my-5 flex flex-col gap-5">
        {consentUploadControl}
        {heightUploadControl}
        <Link className="flex items-center gap-1 font-bold" href="/system/clientes">
          <ArrowLeft />
          Volver
        </Link>
        {studies.map((study) => (
          <EstudiosCard key={study.id} studies={study} />
        ))}
      </section>
    </Panel>
  );
}
