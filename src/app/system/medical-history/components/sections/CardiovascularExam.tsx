import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {MedicalRecordCardiovascularExam} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordCardiovascularExam | null;
  registerSection: (handler: SectionHandler<MedicalRecordCardiovascularExam>) => () => void;
}

// Helper function to convert string booleans to actual booleans
const normalizeBooleanFields = (
  data: MedicalRecordCardiovascularExam | null,
): MedicalRecordCardiovascularExam | null => {
  if (!data) return null;

  // The API sometimes returns booleans as strings ("true"/"false")
  // We need to normalize them to actual boolean values
  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    ritmo_irregular: toBool(data.ritmo_irregular),
    ruidos_alterados: toBool(data.ruidos_alterados),
    extrasistoles: toBool(data.extrasistoles),
    soplos: toBool(data.soplos),
    pulsos_perifericos_ausentes: toBool(data.pulsos_perifericos_ausentes),
    varices: toBool(data.varices),
  };
};

export const CardiovascularExamSection = React.memo(({defaultValues, registerSection}: Props) => {
  const normalizedDefaults = normalizeBooleanFields(defaultValues);

  const form = useForm<MedicalRecordCardiovascularExam>({
    defaultValues: normalizedDefaults ?? ({} as MedicalRecordCardiovascularExam),
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
    <AccordionItem value="item-15">
      <AccordionTrigger>Examen Cardiovascular</AccordionTrigger>
      <AccordionContent>
        <div className="relative">
          <img alt="Logo" className="absolute top-0 right-0" src="/logo.png" width={60} />
          <div className="flex flex-col gap-3 text-lg">
            {/* Frecuencia cardíaca */}
            <div className="flex items-center gap-2">
              <span>Frecuencia cardíaca:</span>
              <input
                {...register("freq_cardiaca", {valueAsNumber: true})}
                className="w-[150px] border border-gray-500 p-1"
                type="text"
              />
              <span className="text-sm italic">por minuto</span>
            </div>

            {/* Tensión arterial */}
            <div className="flex items-center gap-2">
              <span>Tensión arterial:</span>
              <input
                {...register("tension_arterial", {valueAsNumber: true})}
                className="w-[150px] border border-gray-500 p-1"
                type="text"
              />
              <span className="text-sm italic">mm/Hg</span>
            </div>

            {/* Header */}
            <div className="mt-4 flex items-center">
              <div className="flex-1" />
              <div className="flex gap-3">
                <p className="w-6 text-center font-semibold">Si</p>
                <p className="w-6 text-center font-semibold">No</p>
              </div>
            </div>

            {/* Ritmo cardíaco irregular */}
            <div className="flex items-center">
              <p className="flex-1">Ritmo cardíaco irregular</p>
              <Controller
                control={control}
                name="ritmo_irregular"
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

            {/* Ruidos cardíacos alterados */}
            <div className="flex items-center">
              <p className="flex-1">Ruidos cardíacos alterados</p>
              <Controller
                control={control}
                name="ruidos_alterados"
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

            {/* Extrasístoles */}
            <div className="flex items-center">
              <p className="flex-1">Extrasístoles</p>
              <Controller
                control={control}
                name="extrasistoles"
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

            {/* Soplos */}
            <div className="flex items-center">
              <p className="flex-1">Soplos</p>
              <Controller
                control={control}
                name="soplos"
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

            {/* Pulsos periféricos ausentes */}
            <div className="flex items-center">
              <p className="flex-1">Pulsos periféricos ausentes</p>
              <Controller
                control={control}
                name="pulsos_perifericos_ausentes"
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

            {/* Várices */}
            <div className="flex items-center">
              <p className="flex-1">Várices</p>
              <Controller
                control={control}
                name="varices"
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

            <div className="flex items-center">
              <p className="flex-1">HTA</p>
              <Controller
                control={control}
                name="hta"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1"><input checked={value === true} className="h-6 w-6 cursor-pointer" type="radio" onChange={() => onChange(true)} /> Sí</label>
                    <label className="flex items-center gap-1"><input checked={value === false} className="h-6 w-6 cursor-pointer" type="radio" onChange={() => onChange(false)} /> No</label>
                  </div>
                )}
              />
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

CardiovascularExamSection.displayName = "CardiovascularExamSection";
