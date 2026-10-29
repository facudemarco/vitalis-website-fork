"use client";
import {useState, useEffect, use, useCallback, useRef} from "react";
import {ArrowLeft, Printer} from "lucide-react";
import {useRouter} from "next/navigation";
import {pdf} from "@react-pdf/renderer";

import {MedicalRecord} from "@/types";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {dataService} from "@/services/dataService";
import {getMedicalRecordErrorMessage} from "@/lib/medicalRecordErrors";
import {normalizeMedicalRecordDefaults} from "@/lib/medicalRecordDefaults";

import {MedicalHistoryPDF} from "../components/MedicalHistoryPDF";
import {MedicalHistoryHeader} from "../components/MedicalHistoryHeader";
import {EvaluationTypeSection} from "../components/sections/EvaluationTypeSection";
import {useFormRegistry} from "../useFormRegistry";
import {HabitsSection} from "../components/sections/HabitsSection";
import {FamilyHistory} from "../components/sections/FamilyHistory";
import {JobsHistory} from "../components/sections/JobsHistory";
import {PreviousProblems} from "../components/sections/PreviousProblems";
import {LaboralContactsSection} from "../components/sections/LaboralContacts";
import {LaboralExamSection} from "../components/sections/LaboralExam";
import {RecomendationsSection} from "../components/sections/Recomendations";
import {PatientDataSection} from "../components/sections/PatientData";
import {DerivationsSection} from "../components/sections/Derivations";
import {StudiesDoneSection} from "../components/sections/StudiesDone";
import {SurgerysSection} from "../components/sections/Surgerys";
import {PersonalHistorySection} from "../components/sections/PersonalHistory";
import {ClinicalExamSection} from "../components/sections/ClinicalExam";
import {SkinExamSection} from "../components/sections/SkinExam";
import {OftalmologicoExamSection} from "../components/sections/Oftalmologico";
import {BucodentalExamSection} from "../components/sections/BucodentalExam";
import {OrlExamSection} from "../components/sections/OrlExam";
import {HeadExamSection} from "../components/sections/HeadExam";
import {CardiovascularExamSection} from "../components/sections/CardiovascularExam";
import {RespiratorioExamSection} from "../components/sections/RespiratorioExam";
import {DigestiveExamSection} from "../components/sections/DigestiveExam";
import {GenitourinarioExamSection} from "../components/sections/GenitourinarioExam";
import {OsteoarticularExamSection} from "../components/sections/OsteoarticularExam";
import {NeuroClinicalExamSection} from "../components/sections/NeuroClinicalExam";
import {PsychiatricClinicalExamSection} from "../components/sections/PsychiatricClinicalExam";
import {ImmunizationsSection} from "../components/sections/Immunizations";
import CanvasFirm from "../components/CanvasFirm";
import {useMedicalSession} from "../useMedicalSession";
import {useMedicalDraft} from "../useMedicalDraft";
import {MedicalSessionPanel} from "../components/MedicalSessionPanel";
import type {MedicalDraftSnapshot} from "@/lib/medicalDrafts";

// const raleway = Raleway({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700", "800", "900"],
// });

// const patuaOne = Patua_One({
//   subsets: ["latin"],
//   weight: ["400"],
// });

interface PageProps {
  params: Promise<{id: string}>;
}


export default function MedicalHistoryPage({params}: PageProps) {
  const patientId = use(params).id;
  return <MedicalHistoryEditor key={patientId} patientId={patientId} />;
}

function MedicalHistoryEditor({patientId}: {patientId: string}) {
  const router = useRouter();
  const session = useMedicalSession(patientId);

  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [patientCompanyName, setPatientCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for signatures and dates
  const [evaluatorDate, setEvaluatorDate] = useState<string>("");
  const [evaluatorSignatureBlob, setEvaluatorSignatureBlob] = useState<Blob | null>(null);
  const [laboralDate, setLaboralDate] = useState<string>("");
  const [laboralSignatureBlob, setLaboralSignatureBlob] = useState<Blob | null>(null);
  const [dataImgFile, setDataImgFile] = useState<File | null>(null);
  const [patientSignatureBlob, setPatientSignatureBlob] = useState<Blob | null>(null);
  const [medicoResponsableSignatureBlob, setMedicoResponsableSignatureBlob] = useState<Blob | null>(
    null,
  );
  const [editEvaluatorSig, setEditEvaluatorSig] = useState(false);
  const [editLaboralSig, setEditLaboralSig] = useState(false);
  const [editPatientSig, setEditPatientSig] = useState(false);

  const registry = useFormRegistry<MedicalRecord>();
  const recordRef = useRef(medicalRecord); recordRef.current = medicalRecord;
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [restoredImages, setRestoredImages] = useState<Record<string, string>>({});
  const imageURLs = useRef<string[]>([]);
  const lastDraftSnapshot = useRef<MedicalDraftSnapshot | null>(null);
  useEffect(() => () => imageURLs.current.forEach(url => URL.revokeObjectURL(url)), []);
  const draft = useMedicalDraft(session.userId, patientId, session.ready && !loading && !!medicalRecord, session.generation, () => {
    const entries = registry.getAll();
    const record = {...(!entries.length && lastDraftSnapshot.current ? lastDraftSnapshot.current.record : recordRef.current)} as MedicalRecord;
    for (const [key, handler] of entries) (record as any)[key] = handler.getValues();
    const captured = {record, evaluatorDate, laboralDate, files: {
      photo: dataImgFile, evaluator: evaluatorSignatureBlob, laboral: laboralSignatureBlob,
      patient: patientSignatureBlob, responsable: medicoResponsableSignatureBlob,
    }};
    lastDraftSnapshot.current = captured;
    return captured;
  });
  const restoreDraft = () => {
    const recovered = draft.recover();
    if (!recovered) return;
    const previews: Record<string, string> = {};
    for (const [name, blob] of Object.entries(recovered.files)) {
      if (blob) { const url = URL.createObjectURL(blob); imageURLs.current.push(url); previews[name] = url; }
    }
    setRestoredImages(previews);
    setMedicalRecord({...recovered.record, id: medicalRecord?.id || "", patient_id: patientId});
    setEvaluatorDate(recovered.evaluatorDate); setLaboralDate(recovered.laboralDate);
    setDataImgFile(recovered.files.photo as File | null);
    setEvaluatorSignatureBlob(recovered.files.evaluator); setLaboralSignatureBlob(recovered.files.laboral);
    setPatientSignatureBlob(recovered.files.patient); setMedicoResponsableSignatureBlob(recovered.files.responsable);
    setEditEvaluatorSig(Boolean(recovered.files.evaluator)); setEditLaboralSig(Boolean(recovered.files.laboral)); setEditPatientSig(Boolean(recovered.files.patient));
  };

  const handlePrint = async () => {
    if (!medicalRecord) return;
    try {
      const snapshot = {...medicalRecord};
      for (const [key, handler] of registry.getAll()) {
        (snapshot as unknown as Record<string, unknown>)[key] = handler.getValues();
      }
      const blob = await pdf(<MedicalHistoryPDF medicalRecord={normalizeMedicalRecordDefaults(snapshot)} patientCompanyName={patientCompanyName} />).toBlob();
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      console.error("Error printing PDF:", error);
      setError("Error generando el PDF para impresión.");
    }
  };

  // GET devuelve array -> elegimos el primero (después si querés elegimos por created_at)
  useEffect(() => {
    if (!session.ready || recordRef.current) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [records, patients] = await Promise.all([dataService.getMedicalRecord(patientId), dataService.getPatients().catch(() => [])]);
        if (cancelled) return;
        const patient = patients.find((item) => item.id === patientId || item.user_id === patientId);
        setPatientCompanyName(patient?.company_name || (patient?.company_id ? "Empresa" : "Particular"));
        const active = records[0] || ({} as MedicalRecord);

        setMedicalRecord(active);

        // Initialize dates if they exist
        const evalCreatedAt =
          (active as unknown as {medical_record_evaluator_signatures?: {created_at?: string}})
            .medical_record_evaluator_signatures?.created_at ??
          active.medical_record_signatures?.created_at;
        const finalEvalDate = evalCreatedAt
          ? evalCreatedAt.substring(0, 10)
          : active.fecha_medico_evaluador
            ? active.fecha_medico_evaluador.substring(0, 10)
            : "";

        if (finalEvalDate) {
          setEvaluatorDate(finalEvalDate);
        }

        const labCreatedAt = active.medical_record_laboral_signatures?.created_at;
        const finalLabDate = labCreatedAt
          ? labCreatedAt.substring(0, 10)
          : active.fecha_medico_laboral
            ? active.fecha_medico_laboral.substring(0, 10)
            : "";

        if (finalLabDate) {
          setLaboralDate(finalLabDate);
        }
      } catch (_err) {
        if (cancelled) return;
        setError("No se pudo cargar la ficha. Reintentá sin completar una ficha vacía sobre este error.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [patientId, session.ready, session.generation, loadAttempt]);

  const handleSaveAll = useCallback(async () => {
    if (!medicalRecord) return;

    let succeeded = false;
    try {
      setSaving(true);
      setError(null);
      setSaved(false);

      const entries = registry.getAll();
      const merged: MedicalRecord = {...medicalRecord};

      // Snapshot every mounted section before validation or network requests so a failed save can be retried.
      for (const [key, handler] of entries) {
        (merged as any)[key] = handler.getValues();
      }
      setMedicalRecord(merged);

      const missingFields = new Set<string>();
      let formIsValid = true;

      for (const [, handler] of entries) {
        if (handler.validate && !(await handler.validate())) {
          formIsValid = false;
          handler.getErrors?.().forEach((field) => missingFields.add(field));
        }
      }

      if (!formIsValid) {
        const fieldList = Array.from(missingFields);
        setError(
          fieldList.length
            ? `Revisá estos campos: ${fieldList.join(", ")}. Los datos ingresados se conservaron.`
            : "Revisá los campos obligatorios indicados. Los datos ingresados se conservaron.",
        );
        return;
      }

      await draft.flush();
      await session.ensureCurrent();
      let result: MedicalRecord;

      const dataToSend: any = normalizeMedicalRecordDefaults(merged);

      // Sanitize data to remove top-level fields that are handled separately or shouldn't be in the JSON data
      delete dataToSend.id;
      delete dataToSend.patient_id;
      delete dataToSend.fecha_medico_evaluador;
      delete dataToSend.fecha_medico_laboral;
      delete dataToSend.firma_medico_evaluador;
      delete dataToSend.firma_medico_laboral;

      delete dataToSend.medical_record_data_img;
      delete dataToSend.medical_record_signatures;
      delete dataToSend.medical_record_laboral_signatures;
      delete dataToSend.firma_paciente;
      delete dataToSend.firma_responsable;

      if (medicalRecord.id) {
        // UPDATE
        result = await dataService.updateMedicalRecord(
          medicalRecord.id,
          patientId,
          dataToSend as unknown as Partial<MedicalRecord>,
          dataImgFile ?? undefined,
          evaluatorSignatureBlob,
          evaluatorDate || null,
          laboralSignatureBlob,
          laboralDate || null,
          patientSignatureBlob,
          medicoResponsableSignatureBlob,
          session.userId || undefined,
        );
      } else {
        // CREATE
        // merge necesita tener la estructura correcta para el backend
        result = await dataService.createMedicalRecord(
          patientId,
          dataToSend as unknown as Partial<MedicalRecord>,
          dataImgFile ?? undefined,
          undefined,
          evaluatorSignatureBlob,
          evaluatorDate || null,
          laboralSignatureBlob,
          laboralDate || null,
          patientSignatureBlob,
          medicoResponsableSignatureBlob,
          session.userId || undefined,
        );
      }
      // After save, preserve the merged form data and update the ID from the response.
      // The create response only returns {id, detail}, not a full MedicalRecord,
      // so we must NOT replace the entire state with it.
      const newId = result.id || medicalRecord.id;

      setMedicalRecord({...merged, id: newId, patient_id: patientId} as MedicalRecord);
      await draft.markSaved();
      setSaved(true);
      succeeded = true;
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(getMedicalRecordErrorMessage(err));
    } finally {
      if (!succeeded) setSaving(false);
    }
  }, [
    medicalRecord,
    registry,
    patientId,
    evaluatorDate,
    evaluatorSignatureBlob,
    laboralDate,
    laboralSignatureBlob,
    patientSignatureBlob, medicoResponsableSignatureBlob, session, draft,
  ]);

  if (!session.ready) return <main className="mx-auto max-w-3xl p-6"><MedicalSessionPanel session={session} /></main>;
  if (loading || draft.checking) return <div className="p-8 text-center">Cargando ficha y borrador protegido…</div>;
  if (!medicalRecord) return <main className="mx-auto max-w-3xl p-6"><MedicalSessionPanel session={session} /><p role="alert">{error}</p><button type="button" onClick={() => setLoadAttempt(value => value + 1)}>Reintentar carga</button></main>;
  if (draft.candidate) return <main className="mx-auto max-w-3xl space-y-4 p-6">
    <MedicalSessionPanel session={session} />
    <h1 className="text-xl font-bold">Hay un borrador sin guardar de esta ficha</h1>
    <p>Última copia en este navegador: {new Date(draft.candidate.updatedAt).toLocaleString("es-AR")}. Recuperalo para continuar o descartalo para ver la ficha guardada en el servidor.</p>
    {draft.error && <p role="alert">{draft.error}</p>}
    <button className="mr-4 rounded border bg-white p-3" type="button" onClick={restoreDraft}>Recuperar borrador</button>
    <button className="rounded border bg-white p-3" type="button" onClick={() => void draft.discard()}>Descartar borrador</button>
  </main>;

  return (
    <main className="mx-5 my-10 md:mx-30">
      <MedicalSessionPanel session={session} />
      {draft.error && <p role="alert" className="my-3 text-red-700">{draft.error}</p>}
      {draft.dirty && <p className="my-3 text-sm" role="status">{draft.savedAt ? `Borrador protegido en este navegador: ${new Date(draft.savedAt).toLocaleTimeString("es-AR")}. Usá Guardar para incorporarlo a la ficha.` : "Hay cambios sin guardar. Preparando borrador protegido…"}</p>}
      <section className="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-between">
        <button
          className="mt-5 flex cursor-pointer items-center gap-1 font-bold md:mt-20"
          onClick={async () => { if (!draft.dirty || window.confirm("Hay cambios sin guardar en la ficha. ¿Querés salir?")) { await draft.flush(); router.back(); } }}
        >
          <ArrowLeft />
          Volver al Portal
        </button>
        <MedicalHistoryHeader error={error} saved={saved} saving={saving} onSave={handleSaveAll} />
        <div className="text-md mt-2 flex h-full flex-col items-end justify-between gap-2 font-medium md:mt-20">
          <button
            className="flex cursor-pointer items-center gap-2 font-bold"
            onClick={() => void handlePrint()}
          >
            <Printer className="text-blue" />
            <p className="text-blue">Imprimir</p>
          </button>
        </div>
      </section>

      <form className="rounded-xl bg-white" onSubmit={event => {event.preventDefault(); void handleSaveAll();}}
        onInputCapture={() => draft.markChanged()} onChangeCapture={() => draft.markChanged()}
        onPointerUpCapture={event => {if (event.target instanceof HTMLCanvasElement) draft.markChanged();}}>
        <fieldset disabled={saving} className="min-w-0" style={{pointerEvents: saving ? "none" : undefined}}>
        <p className="rounded-t-xl bg-[#5AB5E04D] px-5 py-2 font-semibold italic">
          Los campos con * son obligatorios
        </p>
        <PatientDataSection
          defaultCompanyName={patientCompanyName}
          currentImageUrl={restoredImages.photo || medicalRecord.medical_record_data_img?.url || null}
          defaultValues={medicalRecord.medical_record_data ?? null}
          registerSection={(handler) => registry.register("medical_record_data", handler)}
          onImageChange={(file) => setDataImgFile(file)}
        />
        <Accordion collapsible type="single">
          <EvaluationTypeSection
            defaultValues={medicalRecord.medical_record_evaluation_type ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_evaluation_type", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <HabitsSection
            defaultValues={medicalRecord.medical_record_habits ?? null}
            registerSection={(handler) => registry.register("medical_record_habits", handler)}
          />
        </Accordion>
        <Accordion collapsible type="single">
          <FamilyHistory
            defaultValues={medicalRecord.medical_record_family_history ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_family_history", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <JobsHistory
            defaultValues={medicalRecord.medical_record_laboral_history ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_laboral_history", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <PreviousProblems
            defaultValues={medicalRecord.medical_record_previous_problems ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_previous_problems", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <LaboralContactsSection
            defaultValues={medicalRecord.medical_record_laboral_contacts ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_laboral_contacts", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <SurgerysSection
            defaultValues={medicalRecord.medical_record_surgerys ?? null}
            registerSection={(handler) => registry.register("medical_record_surgerys", handler)}
          />
        </Accordion>
        <Accordion collapsible type="single">
          <PersonalHistorySection
            defaultValues={medicalRecord.medical_record_personal_history ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_personal_history", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <ClinicalExamSection
            defaultValues={medicalRecord.medical_record_clinical_exam ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_clinical_exam", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <SkinExamSection
            defaultValues={medicalRecord.medical_record_skin_exam ?? null}
            registerSection={(handler) => registry.register("medical_record_skin_exam", handler)}
          />
        </Accordion>
        <Accordion collapsible type="single">
          <OftalmologicoExamSection
            defaultValues={medicalRecord.medical_record_oftalmologico_exam ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_oftalmologico_exam", handler)
            }
            ophthalmologyValues={medicalRecord.medical_record_ophthalmology ?? null}
            registerOphthalmology={(handler) =>
              registry.register("medical_record_ophthalmology", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <BucodentalExamSection
            defaultValues={medicalRecord.medical_record_bucodental_exam ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_bucodental_exam", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <OrlExamSection
            defaultValues={medicalRecord.medical_record_orl_exam ?? null}
            registerSection={(handler) => registry.register("medical_record_orl_exam", handler)}
          />
        </Accordion>
        <Accordion collapsible type="single">
          <HeadExamSection
            defaultValues={medicalRecord.medical_record_head_exam ?? null}
            registerSection={(handler) => registry.register("medical_record_head_exam", handler)}
          />
        </Accordion>
        <Accordion collapsible type="single">
          <CardiovascularExamSection
            defaultValues={medicalRecord.medical_record_cardiovascular_exam ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_cardiovascular_exam", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <RespiratorioExamSection
            defaultValues={medicalRecord.medical_record_respiratorio_exam ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_respiratorio_exam", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <DigestiveExamSection
            defaultValues={medicalRecord.medical_record_digestive_exam ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_digestive_exam", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <GenitourinarioExamSection
            defaultValues={medicalRecord.medical_record_genitourinario_exam ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_genitourinario_exam", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <OsteoarticularExamSection
            defaultValues={medicalRecord.medical_record_osteoarticular_exam ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_osteoarticular_exam", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <NeuroClinicalExamSection
            defaultValues={medicalRecord.medical_record_neuro_clinical_exam ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_neuro_clinical_exam", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <PsychiatricClinicalExamSection
            defaultValues={medicalRecord.medical_record_psychiatric_clinical_exam ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_psychiatric_clinical_exam", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <ImmunizationsSection
            defaultValues={medicalRecord.medical_record_immunizations ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_immunizations", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <LaboralExamSection
            defaultValues={medicalRecord.medical_record_laboral_exam ?? null}
            registerSection={(handler) => registry.register("medical_record_laboral_exam", handler)}
          />
        </Accordion>
        <Accordion collapsible type="single">
          <RecomendationsSection
            defaultValues={medicalRecord.medical_record_recomendations ?? null}
            registerSection={(handler) =>
              registry.register("medical_record_recomendations", handler)
            }
          />
        </Accordion>
        <Accordion collapsible type="single">
          <DerivationsSection
            defaultValues={medicalRecord.medical_record_derivations ?? null}
            registerSection={(handler) => registry.register("medical_record_derivations", handler)}
          />
        </Accordion>
        <Accordion collapsible type="single">
          <StudiesDoneSection
            defaultValues={medicalRecord.medical_record_studies ?? null}
            registerSection={(handler) => registry.register("medical_record_studies", handler)}
          />
        </Accordion>
        <Accordion collapsible type="single">
          <AccordionItem value="item-final">
            <AccordionTrigger>Firma Digital y Matrícula *</AccordionTrigger>
            <AccordionContent>
              <div className="relative">
                <img alt="Logo" className="absolute top-0 right-0" src="/logo.png" width={60} />
                <div className="space-y-8">
                  {/* Médico Evaluador */}
                  <div className="space-y-4">
                    <p className="text-lg font-semibold">Médico Evaluador</p>

                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <label className="text-base" htmlFor="fecha-evaluador">
                        Fecha
                      </label>
                      <input
                        className="border border-gray-500 px-5 py-2"
                        id="fecha-evaluador"
                        type="date"
                        value={evaluatorDate}
                        onChange={(e) => setEvaluatorDate(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                      <label className="text-base whitespace-nowrap" htmlFor="firma-evaluador">
                        Firma
                      </label>
                      {(!medicalRecord.medical_record_signatures?.url &&
                        !medicalRecord.firma_medico_evaluador) ||
                      editEvaluatorSig ? (
                        <div className="flex flex-col items-center gap-2">
                          <CanvasFirm
                            uploadOnSave={false}
                            initialBlob={evaluatorSignatureBlob}
                            onDraftChange={blob => { setEvaluatorSignatureBlob(blob); draft.markChanged(); }}
                            onSave={(blob) => setEvaluatorSignatureBlob(blob)}
                          />
                          {(medicalRecord.medical_record_signatures?.url ||
                            medicalRecord.firma_medico_evaluador) && (
                            <button
                              className="text-sm text-red-500 hover:underline"
                              type="button"
                              onClick={() => {
                                setEditEvaluatorSig(false);
                                setEvaluatorSignatureBlob(null);
                              }}
                            >
                              Cancelar cambio
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            alt="Firma Médico Evaluador"
                            className="max-h-32 border border-gray-200"
                            src={
                              medicalRecord.medical_record_signatures?.url ??
                              medicalRecord.firma_medico_evaluador ??
                              undefined
                            }
                          />
                          <button
                            className="text-sm text-blue-500 hover:underline"
                            type="button"
                            onClick={() => setEditEvaluatorSig(true)}
                          >
                            Cambiar firma
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Médico Laboral */}
                  <div className="space-y-4">
                    <p className="text-lg font-semibold">Médico Laboral</p>

                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <label className="text-base" htmlFor="fecha-laboral">
                        Fecha
                      </label>
                      <input
                        className="border border-gray-500 px-5 py-2"
                        id="fecha-laboral"
                        type="date"
                        value={laboralDate}
                        onChange={(e) => setLaboralDate(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                      <label className="text-base whitespace-nowrap" htmlFor="firma-laboral">
                        Firma
                      </label>
                      {(!medicalRecord.medical_record_laboral_signatures?.url &&
                        !medicalRecord.firma_medico_laboral) ||
                      editLaboralSig ? (
                        <div className="flex flex-col items-center gap-2">
                          <CanvasFirm
                            uploadOnSave={false}
                            initialBlob={laboralSignatureBlob}
                            onDraftChange={blob => { setLaboralSignatureBlob(blob); draft.markChanged(); }}
                            onSave={(blob) => setLaboralSignatureBlob(blob)}
                          />
                          {(medicalRecord.medical_record_laboral_signatures?.url ||
                            medicalRecord.firma_medico_laboral) && (
                            <button
                              className="text-sm text-red-500 hover:underline"
                              type="button"
                              onClick={() => {
                                setEditLaboralSig(false);
                                setLaboralSignatureBlob(null);
                              }}
                            >
                              Cancelar cambio
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            alt="Firma Médico Laboral"
                            className="max-h-32 border border-gray-200"
                            src={
                              medicalRecord.medical_record_laboral_signatures?.url ??
                              medicalRecord.firma_medico_laboral ??
                              undefined
                            }
                          />
                          <button
                            className="text-sm text-blue-500 hover:underline"
                            type="button"
                            onClick={() => setEditLaboralSig(true)}
                          >
                            Cambiar firma
                          </button>
                        </div>
                      )}
                    </div>
<div className="space-y-4">
                    <p className="text-lg font-semibold">Firma del trabajador</p>
                    {(!medicalRecord.medical_record_patient_signatures?.url || editPatientSig) ? (
                      <div className="flex flex-col items-center gap-2">
                        <CanvasFirm uploadOnSave={false} initialBlob={patientSignatureBlob} onDraftChange={blob => { setPatientSignatureBlob(blob); draft.markChanged(); }} onSave={(blob) => setPatientSignatureBlob(blob)} />
                        {medicalRecord.medical_record_patient_signatures?.url && <button className="text-sm text-red-500 hover:underline" type="button" onClick={() => { setEditPatientSig(false); setPatientSignatureBlob(null); }}>Cancelar cambio</button>}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <img alt="Firma del trabajador" className="max-h-32 border border-gray-200" src={medicalRecord.medical_record_patient_signatures.url} />
                        <button className="text-sm text-blue-500 hover:underline" type="button" onClick={() => setEditPatientSig(true)}>Cambiar firma</button>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex justify-center py-8">
          <button
            className="bg-orange my-5 cursor-pointer rounded-md border border-black px-10 py-2 text-lg font-bold disabled:opacity-50"
            disabled={saving}
            type="button"
            onClick={() => void handleSaveAll()}
          >
            Guardar
          </button>
        </div>
        </fieldset>
      </form>
    </main>
  );
}
