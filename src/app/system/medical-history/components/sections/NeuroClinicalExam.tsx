import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {MedicalRecordNeuroClinicalExam} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordNeuroClinicalExam | null;
  registerSection: (handler: SectionHandler<MedicalRecordNeuroClinicalExam>) => () => void;
}

// Helper function to convert string booleans to actual booleans
const normalizeBooleanFields = (
  data: MedicalRecordNeuroClinicalExam | null,
): MedicalRecordNeuroClinicalExam | null => {
  if (!data) return null;

  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    desorientado: toBool(data.desorientado),
    motilidad_alterada: toBool(data.motilidad_alterada),
    sensibilidad_alterada: toBool(data.sensibilidad_alterada),
    reflejos_alterados: toBool(data.reflejos_alterados),
    apraxia: toBool(data.apraxia),
    ataxia: toBool(data.ataxia),
  };
};

export const NeuroClinicalExamSection = React.memo(({defaultValues, registerSection}: Props) => {
  const normalizedDefaults = normalizeBooleanFields(defaultValues);

  const form = useForm<MedicalRecordNeuroClinicalExam>({
    defaultValues: normalizedDefaults ?? ({} as MedicalRecordNeuroClinicalExam),
    mode: "onBlur",
  });

  const {getValues, trigger, register, control} = form;

  useEffect(() => {
    const unregister = registerSection({
      getValues: () => getValues(),
      validate: async () => trigger(),
    });

    return unregister;
  }, [registerSection, getValues, trigger]);

  return (
    <AccordionItem value="item-20">
      <AccordionTrigger>Evaluación Clínica Neurológica</AccordionTrigger>
      <AccordionContent>
        <div className="relative">
          <img alt="Logo" className="absolute top-0 right-0" src="/logo.png" width={60} />
          <div className="flex flex-col gap-3 text-lg">
            {/* Header */}
            <div className="mt-20 flex items-center">
              <div className="flex-1" />
              <div className="flex gap-3">
                <p className="w-6 text-center font-semibold">Si</p>
                <p className="w-6 text-center font-semibold">No</p>
              </div>
            </div>

            {/* Desorientado tiempo y espacio */}
            <div className="flex items-center">
              <p className="flex-1">Desorientado tiempo y espacio</p>
              <Controller
                control={control}
                name="desorientado"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(true)}
                    />
                    <input
                      checked={!value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(false)}
                    />
                  </div>
                )}
              />
            </div>

            {/* Motilidad alterada */}
            <div className="flex items-center">
              <p className="flex-1">Motilidad alterada</p>
              <Controller
                control={control}
                name="motilidad_alterada"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(true)}
                    />
                    <input
                      checked={!value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(false)}
                    />
                  </div>
                )}
              />
            </div>

            {/* Sensibilidad alterada */}
            <div className="flex items-center">
              <p className="flex-1">Sensibilidad alterada</p>
              <Controller
                control={control}
                name="sensibilidad_alterada"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(true)}
                    />
                    <input
                      checked={!value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(false)}
                    />
                  </div>
                )}
              />
            </div>

            {/* Reflejos alterados */}
            <div className="flex items-center">
              <p className="flex-1">Reflejos alterados</p>
              <Controller
                control={control}
                name="reflejos_alterados"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(true)}
                    />
                    <input
                      checked={!value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(false)}
                    />
                  </div>
                )}
              />
            </div>

            {/* Apraxia */}
            <div className="flex items-center">
              <p className="flex-1">Apraxia</p>
              <Controller
                control={control}
                name="apraxia"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(true)}
                    />
                    <input
                      checked={!value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(false)}
                    />
                  </div>
                )}
              />
            </div>

            {/* Ataxia */}
            <div className="flex items-center">
              <p className="flex-1">Ataxia</p>
              <Controller
                control={control}
                name="ataxia"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(true)}
                    />
                    <input
                      checked={!value}
                      className="h-6 w-6 cursor-pointer"
                      type="radio"
                      onChange={() => onChange(false)}
                    />
                  </div>
                )}
              />
            </div>

            <div className="mt-6 overflow-x-auto">
              <h3 className="mb-2 font-semibold">Cuestionario STOP-BANG</h3>
              <div className="min-w-[560px] rounded border">
                {([
                  ["stop_bang_snoring","¿Ronca fuerte?"],
                  ["stop_bang_tiredness","¿Se siente cansado o somnoliento durante el día?"],
                  ["stop_bang_observed_apnea","¿Alguien observó que deja de respirar mientras duerme?"],
                  ["stop_bang_hypertension","¿Tiene hipertensión arterial?"],
                  ["stop_bang_bmi_over_35","¿Índice de masa corporal mayor a 35?"],
                  ["stop_bang_age_over_50","¿Tiene más de 50 años?"],
                  ["stop_bang_neck_circumference","¿Circunferencia del cuello mayor al umbral del cuestionario?"],
                  ["stop_bang_male","¿Sexo masculino?"],
                ] as const).map(([field,label]) => <div key={field} className="grid grid-cols-[1fr_80px_80px] items-center border-b p-2 text-sm">
                  <span>{label}</span><label className="text-center"><input type="radio" value="true" {...register(field)} /> Sí</label><label className="text-center"><input type="radio" value="false" {...register(field)} /> No</label>
                </div>)}
              </div>
              <p className="mt-1 text-xs text-gray-600">3 o más respuestas afirmativas: riesgo elevado.</p>
            </div>
            <div className="mt-5 overflow-x-auto">
              <h3 className="mb-2 font-semibold">Trastorno del sueño</h3>
              <div className="min-w-[560px] rounded border">
                {([
                  ["sleep_disorder_snoring","Ronquido"],
                  ["sleep_disorder_smoking","Tabaquismo"],
                  ["sleep_disorder_hta","HTA"],
                  ["sleep_disorder_obesity","Obesidad tipo II o más"],
                  ["sleep_disorder_short_neck","Cuello corto"],
                  ["sleep_disorder_mallampati_3_4","Mallampati (3 o 4)"],
                  ["sleep_disorder_stop_bang","Cuestionario STOP-BANG positivo"],
                ] as const).map(([field,label]) => <div key={field} className="grid grid-cols-[1fr_80px_80px] items-center border-b p-2 text-sm">
                  <span>{label}</span><label className="text-center"><input type="radio" value="true" {...register(field)} /> Sí</label><label className="text-center"><input type="radio" value="false" {...register(field)} /> No</label>
                </div>)}
              </div>
            </div>
            {/* Observaciones */}
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-base font-semibold">Observaciones:</span>
              <textarea
                {...register("observations")}
                className="h-24 w-full resize-none border border-gray-500 p-2"
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

NeuroClinicalExamSection.displayName = "NeuroClinicalExamSection";
