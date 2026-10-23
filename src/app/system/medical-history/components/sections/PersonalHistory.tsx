import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {MedicalRecordPersonalHistory} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordPersonalHistory | null;
  registerSection: (handler: SectionHandler<MedicalRecordPersonalHistory>) => () => void;
}

// Helper function to convert string booleans to actual booleans
const normalizeBooleanFields = (
  data: MedicalRecordPersonalHistory | null,
): MedicalRecordPersonalHistory | null => {
  if (!data) return null;

  // The API sometimes returns booleans as strings ("true"/"false")
  // We need to normalize them to actual boolean values
  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    internations: toBool(data.internations),
    covid: toBool(data.covid),
    fha: toBool(data.fha),
    dengue: toBool(data.dengue),
  };
};

export const PersonalHistorySection = React.memo(({defaultValues, registerSection}: Props) => {
  const normalizedDefaults = normalizeBooleanFields(defaultValues);

  const form = useForm<MedicalRecordPersonalHistory>({
    defaultValues: normalizedDefaults ?? ({} as MedicalRecordPersonalHistory),
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
    <AccordionItem value="item-12">
      <AccordionTrigger>Antecedentes personales</AccordionTrigger>
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

            {/* Internaciones */}
            <div className="flex flex-wrap items-center">
              <p className="w-[150px] shrink-0 md:w-[200px]">Internaciones</p>
              <Controller
                control={control}
                name="internations"
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
              <div className="mt-2 flex items-center gap-2 md:mt-0 md:ml-6">
                <span className="text-sm">En caso de si, indique, ¿por qué?</span>
                <input
                  {...register("internations_motive")}
                  className="w-full border border-gray-500 p-1 md:w-[300px]"
                  type="text"
                />
              </div>
            </div>

            {/* Covid-19 */}
            <div className="flex items-center">
              <p className="flex-1">Covid-19</p>
              <Controller
                control={control}
                name="covid"
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

            {/* FHA */}
            <div className="flex items-center">
              <p className="flex-1">FHA</p>
              <Controller
                control={control}
                name="fha"
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

            {/* Dengue */}
            <div className="flex items-center">
              <p className="flex-1">Dengue</p>
              <Controller
                control={control}
                name="dengue"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-3">
                    <input checked={value} className="h-6 w-6 cursor-pointer" type="radio" onChange={() => onChange(true)} />
                    <input checked={!value} className="h-6 w-6 cursor-pointer" type="radio" onChange={() => onChange(false)} />
                  </div>
                )}
              />
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <div className="border-b border-gray-200 pb-3">
                <div className="flex items-center">
                  <p className="flex-1">Medicamentos</p>
                  <Controller control={control} name="medications" render={({field: {onChange, value}}) => (
                    <div className="flex gap-3">
                      <input aria-label="Medicamentos: sí" checked={value === true} className="h-6 w-6 cursor-pointer" type="radio" onChange={() => onChange(true)} />
                      <input aria-label="Medicamentos: no" checked={value === false} className="h-6 w-6 cursor-pointer" type="radio" onChange={() => onChange(false)} />
                    </div>
                  )} />
                </div>
                <input className="mt-2 w-full border border-gray-500 p-1" placeholder="¿Cuáles medicamentos?" {...register("medications_details")} />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <div className="flex items-center">
                  <p className="flex-1">Malformaciones</p>
                  <Controller control={control} name="malformations" render={({field: {onChange, value}}) => (
                    <div className="flex gap-3">
                      <input aria-label="Malformaciones: sí" checked={value === true} className="h-6 w-6 cursor-pointer" type="radio" onChange={() => onChange(true)} />
                      <input aria-label="Malformaciones: no" checked={value === false} className="h-6 w-6 cursor-pointer" type="radio" onChange={() => onChange(false)} />
                    </div>
                  )} />
                </div>
                <input className="mt-2 w-full border border-gray-500 p-1" placeholder="¿Cuáles malformaciones?" {...register("malformations_details")} />
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

PersonalHistorySection.displayName = "PersonalHistorySection";
