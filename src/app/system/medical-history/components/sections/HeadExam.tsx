import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {MedicalRecordHeadExam} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordHeadExam | null;
  registerSection: (handler: SectionHandler<MedicalRecordHeadExam>) => () => void;
}

// Helper function to convert string booleans to actual booleans
const normalizeBooleanFields = (
  data: MedicalRecordHeadExam | null,
): MedicalRecordHeadExam | null => {
  if (!data) return null;

  // The API sometimes returns booleans as strings ("true"/"false")
  // We need to normalize them to actual boolean values
  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    alteration_movility: toBool(data.alteration_movility),
    latidos_carotideos_alterados: toBool(data.latidos_carotideos_alterados),
    tumoraciones_tiroideas: toBool(data.tumoraciones_tiroideas),
    adenopatias: toBool(data.adenopatias),
  };
};

export const HeadExamSection = React.memo(({defaultValues, registerSection}: Props) => {
  const normalizedDefaults = normalizeBooleanFields(defaultValues);

  const form = useForm<MedicalRecordHeadExam>({
    defaultValues: normalizedDefaults ?? ({} as MedicalRecordHeadExam),
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
    <AccordionItem value="item-14">
      <AccordionTrigger>Examen Cabeza o Cuello</AccordionTrigger>
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

            {/* Movilidad alterada */}
            <div className="flex items-center">
              <p className="flex-1">Movilidad alterada</p>
              <Controller
                control={control}
                name="alteration_movility"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input
                      checked={value === true}
                      className="h-6 w-6 cursor-pointer"
                      onChange={() => onChange(true)}
                      type="radio"
                    />
                    <input
                      checked={value === false}
                      className="h-6 w-6 cursor-pointer"
                      onChange={() => onChange(false)}
                      type="radio"
                    />
                  </div>
                )}
              />
            </div>

            {/* Latidos carotídeos alterados */}
            <div className="flex items-center">
              <p className="flex-1">Latidos carotídeos alterados</p>
              <Controller
                control={control}
                name="latidos_carotideos_alterados"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input
                      checked={value === true}
                      className="h-6 w-6 cursor-pointer"
                      onChange={() => onChange(true)}
                      type="radio"
                    />
                    <input
                      checked={value === false}
                      className="h-6 w-6 cursor-pointer"
                      onChange={() => onChange(false)}
                      type="radio"
                    />
                  </div>
                )}
              />
            </div>

            {/* Tumoraciones tiroideas */}
            <div className="flex items-center">
              <p className="flex-1">Tumoraciones tiroideas</p>
              <Controller
                control={control}
                name="tumoraciones_tiroideas"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input
                      checked={value === true}
                      className="h-6 w-6 cursor-pointer"
                      onChange={() => onChange(true)}
                      type="radio"
                    />
                    <input
                      checked={value === false}
                      className="h-6 w-6 cursor-pointer"
                      onChange={() => onChange(false)}
                      type="radio"
                    />
                  </div>
                )}
              />
            </div>

            {/* Adenopatías */}
            <div className="flex items-center">
              <p className="flex-1">Adenopatías</p>
              <Controller
                control={control}
                name="adenopatias"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input
                      checked={value === true}
                      className="h-6 w-6 cursor-pointer"
                      onChange={() => onChange(true)}
                      type="radio"
                    />
                    <input
                      checked={value === false}
                      className="h-6 w-6 cursor-pointer"
                      onChange={() => onChange(false)}
                      type="radio"
                    />
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_10rem] items-center gap-3 border-b py-2">
              <label className="text-base font-medium" htmlFor="mallampati">Mallampati</label>
              <select id="mallampati" className="w-full rounded border border-gray-500 p-2" {...register("mallampati")}>
                <option value="">Seleccionar</option>
                {["1", "2", "3", "4"].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
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

HeadExamSection.displayName = "HeadExamSection";
