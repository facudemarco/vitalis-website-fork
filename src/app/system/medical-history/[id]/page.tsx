"use client";
import {useState, useEffect, use, useCallback} from "react";
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
import {CuestionarioRiesgoSection} from "../components/sections/CuestionarioRiesgo";
import CanvasFirm from "../components/CanvasFirm";

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

const medicalRecordFieldLabels: Record<string, string> = {
  sons: "Cantidad de hijos",
};

const getMedicalRecordFieldLabel = (field: unknown) => {
  const key = String(field ?? "").split(".").at(-1) ?? "";
  const humanizedKey = key.replaceAll("_", " ").replace(/\\b\\w/g, (letter) => letter.toUpperCase());
  return medicalRecordFieldLabels[key] ?? (humanizedKey || "dato ingresado");
};

const getMedicalRecordValidationMessage = (item: {
  loc?: Array<string | number>;
  type?: string;
}) => {
  const path = item.loc?.filter((part) => !["body", "data"].includes(String(part))) ?? [];
  const label = getMedicalRecordFieldLabel(path.at(-1));
  const field = String(path.at(-1) ?? "");

  if (item.type === "int_parsing" || item.type === "int_from_float") {
    return field === "sons"
      ? "Ingresá la cantidad de hijos como un número entero (por ejemplo, 2)."
      : `El campo “${label}” debe ser un número entero.`;
  }
  if (item.type === "missing") return `Completá el campo “${label}”.`;
  if (item.type === "float_parsing" || item.type === "float_type") {
    return `Ingresá un número válido en el campo “${label}”.`;
  }
  if (item.type === "bool_parsing") {
    return `Revisá la opción seleccionada en “${label}”.`;
  }
  return `Revisá el valor ingresado en “${label}”.`;
};

const getMedicalRecordErrorMessage = (error: unknown) => {
  const detail = (error as {response?: {data?: {detail?: unknown}}})?.response?.data?.detail;

  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const fields = (detail as {fields?: Array<{label?: string; field?: string}>}).fields;
    if (Array.isArray(fields) && fields.length > 0) {
      const labels = fields.map((item) => item.label || getMedicalRecordFieldLabel(item.field));
      return `Revisá estos campos: ${labels.join(", ")}. Los datos ingresados se conservaron.`;
    }
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .filter((item): item is {loc?: Array<string | number>; type?: string} => Boolean(item))
      .map(getMedicalRecordValidationMessage);

    if (messages.length > 0) {
      return `No se pudo guardar la ficha: ${messages.join(" ")} Los datos ingresados se conservaron.`;
    }
  }

  return "No se pudo guardar la ficha médica. Revisá los campos e intentá nuevamente. Los datos ingresados se conservaron.";
};

export default function MedicalHistoryPage({params}: PageProps) {
  const patientId = use(params).id;
  const router = useRouter();

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

  const handlePrint = async () => {
    if (!medicalRecord) return;
    try {
      const blob = await pdf(<MedicalHistoryPDF medicalRecord={medicalRecord} />).toBlob();
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      console.error("Error printing PDF:", error);
      setError("Error generando el PDF para impresión.");
    }
  };

  // GET devuelve array -> elegimos el primero (después si querés elegimos por created_at)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [records, patients] = await Promise.all([dataService.getMedicalRecord(patientId), dataService.getPatients().catch(() => [])]);
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
        // Si falla, asumimos que no hay registro (o error de conexión), pero permitimos crear uno nuevo
        // Ojo: idealmente chequear si es 404. Por ahora ante error asumimos "nuevo".
        // O podríamos dejar el error visible si es "Network Error".
        // Para cumplir "retorne formulario vacio":
        setMedicalRecord({} as MedicalRecord);
        // setError(err instanceof Error ? err.message : "Error cargando historial");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [patientId]);

  const handleSaveAll = useCallback(async () => {
    if (!medicalRecord) return;

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

      let result: MedicalRecord;

      const dataToSend: any = {...merged};

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
        );
      }
      // After save, preserve the merged form data and update the ID from the response.
      // The create response only returns {id, detail}, not a full MedicalRecord,
      // so we must NOT replace the entire state with it.
      const newId = result.id || medicalRecord.id;

      setMedicalRecord({...merged, id: newId, patient_id: patientId} as MedicalRecord);
      setSaved(true);
      console.log("saved", result);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(getMedicalRecordErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [
    medicalRecord,
    registry,
    patientId,
    evaluatorDate,
    evaluatorSignatureBlob,
    laboralDate,
    laboralSignatureBlob,
  ]);

  if (loading)
    return (
      <div className="mt-50 flex h-full w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  if (!medicalRecord)
    return (
      <div className="mx-auto p-6">
        No hay historial para este paciente. {error ? `(${error})` : ""}
      </div>
    );

  return (
    <main className="mx-5 my-10 md:mx-30">
      <section className="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-between">
        <button
          className="mt-5 flex cursor-pointer items-center gap-1 font-bold md:mt-20"
          onClick={() => router.back()}
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

      <form className="rounded-xl bg-white">
        <p className="rounded-t-xl bg-[#5AB5E04D] px-5 py-2 font-semibold italic">
          Los campos con * son obligatorios
        </p>
        <PatientDataSection
          defaultCompanyName={patientCompanyName}
          currentImageUrl={medicalRecord.medical_record_data_img?.url ?? null}
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
          <CuestionarioRiesgoSection
            defaultValuesCuestionario={medicalRecord.medical_record_cuestionario_riesgos ?? null}
            defaultValuesDDJJ={medicalRecord.medical_record_ddjj ?? null}
            defaultValuesNeuro={medicalRecord.medical_record_neuro_medical_exam ?? null}
            defaultValuesOftalmo={medicalRecord.medical_record_oftalmologico_medical_exam ?? null}
            registerCuestionario={(handler) =>
              registry.register("medical_record_cuestionario_riesgos", handler)
            }
            registerDDJJ={(handler) => registry.register("medical_record_ddjj", handler)}
            registerNeuro={(handler) =>
              registry.register("medical_record_neuro_medical_exam", handler)
            }
            registerOftalmo={(handler) =>
              registry.register("medical_record_oftalmologico_medical_exam", handler)
            }
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
                        <CanvasFirm uploadOnSave={false} onSave={(blob) => setPatientSignatureBlob(blob)} />
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
      </form>
    </main>
  );
}
