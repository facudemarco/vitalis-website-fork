import React, {useEffect} from "react";
import {useForm} from "react-hook-form";

import {MedicalRecordClinicalExam} from "@/types";
import {CLINICAL_MEASUREMENTS, ClinicalMeasurement, parseClinicalMeasurement} from "@/lib/clinicalMeasurements";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordClinicalExam | null;
  registerSection: (handler: SectionHandler<MedicalRecordClinicalExam>) => () => void;
}

export const ClinicalExamSection = React.memo(({defaultValues, registerSection}: Props) => {
  const form = useForm<MedicalRecordClinicalExam>({
    defaultValues: defaultValues ?? ({} as MedicalRecordClinicalExam),
    mode: "onBlur",
  });

  const {getValues, trigger, register} = form;
  const inputOptions = (field: ClinicalMeasurement) => ({
    setValueAs: (value: unknown) => {
      try { return parseClinicalMeasurement(field, value); } catch { return value; }
    },
    validate: (value: unknown) => {
      try { parseClinicalMeasurement(field, value); return true; }
      catch (error) { return (error as Error).message; }
    },
  });

  useEffect(() => {
    const unregister = registerSection({
      getValues: () => getValues(),
      validate: async () => trigger(),
      getErrors: () => (Object.keys(CLINICAL_MEASUREMENTS) as ClinicalMeasurement[])
        .flatMap(field => form.getFieldState(field).error?.message ? [String(form.getFieldState(field).error?.message)] : []),
    });

    return unregister;
  }, [registerSection, getValues, trigger]);

  return (
    <AccordionItem value="item-8">
      <AccordionTrigger>Examen Clínico</AccordionTrigger>
      <AccordionContent>
        <div className="relative">
          <img alt="Logo" className="absolute top-0 right-0" src="/logo.png" width={60} />
          <div className="flex flex-col gap-3 text-lg">
            {/* Talla */}
            <div className="flex items-center gap-4">
              <span className="w-[100px] shrink-0 md:w-[150px]">Talla (cm)</span>
              <input
                {...register("talla", inputOptions("talla"))}
                aria-label="Talla"
                aria-describedby="clinical-talla-error"
                placeholder="Ej.: 175cm"
                inputMode="decimal"
                className="w-full border border-gray-500 p-2 md:w-[200px]"
                type="text"
              />
              {form.formState.errors.talla?.message && <span id="clinical-talla-error" className="text-sm text-red-600">{String(form.formState.errors.talla?.message)}</span>}
            </div>

            {/* Peso */}
            <div className="flex items-center gap-4">
              <span className="w-[100px] shrink-0 md:w-[150px]">Peso (kg)</span>
              <input
                {...register("peso", inputOptions("peso"))}
                aria-label="Peso"
                aria-describedby="clinical-peso-error"
                placeholder="Ej.: 80kg"
                inputMode="decimal"
                className="w-full border border-gray-500 p-2 md:w-[200px]"
                type="text"
              />
              {form.formState.errors.peso?.message && <span id="clinical-peso-error" className="text-sm text-red-600">{String(form.formState.errors.peso?.message)}</span>}
            </div>

            {/* Saturación */}
            <div className="flex items-center gap-4">
              <span className="w-[100px] shrink-0 md:w-[150px]">Saturación (%)</span>
              <input
                {...register("saturacion", inputOptions("saturacion"))}
                aria-label="Saturación"
                aria-describedby="clinical-saturacion-error"
                placeholder="Ej.: 99%"
                inputMode="decimal"
                className="w-full border border-gray-500 p-2 md:w-[200px]"
                type="text"
              />
              {form.formState.errors.saturacion?.message && <span id="clinical-saturacion-error" className="text-sm text-red-600">{String(form.formState.errors.saturacion?.message)}</span>}
            </div>

            {/* IMC */}
            <div className="flex items-center gap-4">
              <span className="w-[100px] shrink-0 md:w-[150px]">IMC</span>
              <input
                {...register("imc", inputOptions("imc"))}
                aria-label="IMC"
                aria-describedby="clinical-imc-error"
                placeholder="Ej.: 20.1"
                inputMode="decimal"
                className="w-full border border-gray-500 p-2 md:w-[200px]"
                type="text"
              />
              {form.formState.errors.imc?.message && <span id="clinical-imc-error" className="text-sm text-red-600">{String(form.formState.errors.imc?.message)}</span>}
            </div>

            {/* TA: mínima */}
            <div className="flex items-center gap-4">
              <span className="w-[100px] shrink-0 md:w-[150px]">TA: mínima (mmHg)</span>
              <input
                {...register("ta_min", inputOptions("ta_min"))}
                aria-label="TA: mínima"
                aria-describedby="clinical-ta_min-error"
                placeholder="Ej.: 80mmHg"
                inputMode="decimal"
                className="w-full border border-gray-500 p-2 md:w-[200px]"
                type="text"
              />
              {form.formState.errors.ta_min?.message && <span id="clinical-ta_min-error" className="text-sm text-red-600">{String(form.formState.errors.ta_min?.message)}</span>}
            </div>

            {/* TA: máxima */}
            <div className="flex items-center gap-4">
              <span className="w-[100px] shrink-0 md:w-[150px]">TA: máxima (mmHg)</span>
              <input
                {...register("ta_max", inputOptions("ta_max"))}
                aria-label="TA: máxima"
                aria-describedby="clinical-ta_max-error"
                placeholder="Ej.: 120mmHg"
                inputMode="decimal"
                className="w-full border border-gray-500 p-2 md:w-[200px]"
                type="text"
              />
              {form.formState.errors.ta_max?.message && <span id="clinical-ta_max-error" className="text-sm text-red-600">{String(form.formState.errors.ta_max?.message)}</span>}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

ClinicalExamSection.displayName = "ClinicalExamSection";
