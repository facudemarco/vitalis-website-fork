import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {MedicalRecordLaboralContacts} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordLaboralContacts | null;
  registerSection: (handler: SectionHandler<MedicalRecordLaboralContacts>) => () => void;
}

// Helper function to convert string booleans to actual booleans
const normalizeBooleanFields = (
  data: MedicalRecordLaboralContacts | null,
): MedicalRecordLaboralContacts | null => {
  if (!data) return null;

  // The API sometimes returns booleans as strings ("true"/"false")
  // We need to normalize them to actual boolean values
  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    chemicals_products: toBool(data.chemicals_products),
    animal_products: toBool(data.animal_products),
    dusty_environment: toBool(data.dusty_environment),
    ionizing_radiation: toBool(data.ionizing_radiation),
    noisy_environment: toBool(data.noisy_environment),
    other_contamination: toBool(data.other_contamination),
  };
};

export const LaboralContactsSection = React.memo(({defaultValues, registerSection}: Props) => {
  const normalizedDefaults = normalizeBooleanFields(defaultValues);

  const form = useForm<MedicalRecordLaboralContacts>({
    defaultValues: normalizedDefaults ?? ({} as MedicalRecordLaboralContacts),
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
    <AccordionItem value="item-6">
      <AccordionTrigger>Está laboralmente en contacto con:</AccordionTrigger>
      <AccordionContent>
        <div className="relative">
          <img alt="Logo" className="absolute top-0 right-0" src="/logo.png" width={60} />
          <div className="flex flex-col gap-3 text-lg">
            {/* Header */}
            <div className="flex items-center">
              <div className="w-[150px] shrink-0 md:w-[300px]" />
              <div className="flex gap-6">
                <p className="w-6 text-center font-semibold">Si</p>
                <p className="w-6 text-center font-semibold">No</p>
              </div>
            </div>

            {/* ¿Ambiente pulverulento? */}
            <div className="flex flex-wrap items-center">
              <p className="w-[150px] shrink-0 md:w-[300px]">¿Ambiente pulverulento?</p>
              <Controller
                control={control}
                name="dusty_environment"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-6">
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
              <div className="mt-2 flex items-center gap-2 md:mt-0 md:ml-10">
                <span className="text-sm">Fecha aproximada</span>
                <input
                  placeholder="Formato: 00/00/0000"
                  {...register("dusty_environment_date", {setValueAs: (v: string) => v || null})}
                  className="w-full border border-gray-500 p-1 md:w-[200px]"
                  type="text"
                />
              </div>
            </div>

            {/* ¿Ambiente ruidoso? */}
            <div className="flex flex-wrap items-center">
              <p className="w-[150px] shrink-0 md:w-[300px]">¿Ambiente ruidoso?</p>
              <Controller
                control={control}
                name="noisy_environment"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-6">
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
              <div className="mt-2 flex items-center gap-2 md:mt-0 md:ml-10">
                <span className="text-sm">Fecha aproximada</span>
                <input
                  placeholder="Formato: 00/00/0000"
                  {...register("noisy_environment_date", {setValueAs: (v: string) => v || null})}
                  className="w-full border border-gray-500 p-1 md:w-[200px]"
                  type="text"
                />
              </div>
            </div>

            {/* ¿Productos animales? */}
            <div className="flex flex-wrap items-center">
              <p className="w-[150px] shrink-0 md:w-[300px]">¿Productos animales?</p>
              <Controller
                control={control}
                name="animal_products"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-6">
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
              <div className="mt-2 flex items-center gap-2 md:mt-0 md:ml-10">
                <span className="text-sm">Fecha aproximada</span>
                <input
                  placeholder="Formato: 00/00/0000"
                  {...register("animal_products_date", {setValueAs: (v: string) => v || null})}
                  className="w-full border border-gray-500 p-1 md:w-[200px]"
                  type="text"
                />
              </div>
            </div>

            {/* ¿Productos químicos? */}
            <div className="flex flex-wrap items-center">
              <p className="w-[150px] shrink-0 md:w-[300px]">¿Productos químicos?</p>
              <Controller
                control={control}
                name="chemicals_products"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-6">
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
              <div className="mt-2 flex items-center gap-2 md:mt-0 md:ml-10">
                <span className="text-sm">Fecha aproximada</span>
                <input
                  placeholder="Formato: 00/00/0000"
                  {...register("chemicals_products_date", {setValueAs: (v: string) => v || null})}
                  className="w-full border border-gray-500 p-1 md:w-[200px]"
                  type="text"
                />
              </div>
            </div>

            {/* ¿Radiaciones ionizantes? */}
            <div className="flex flex-wrap items-center">
              <p className="w-[150px] shrink-0 md:w-[300px]">¿Radiaciones ionizantes?</p>
              <Controller
                control={control}
                name="ionizing_radiation"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-6">
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
              <div className="mt-2 flex items-center gap-2 md:mt-0 md:ml-10">
                <span className="text-sm">Fecha aproximada</span>
                <input
                  placeholder="Formato: 00/00/0000"
                  {...register("ionizing_radiation_date", {setValueAs: (v: string) => v || null})}
                  className="w-full border border-gray-500 p-1 md:w-[200px]"
                  type="text"
                />
              </div>
            </div>

            {/* ¿Otros contaminantes? */}
            <div className="flex flex-wrap items-center">
              <p className="w-[150px] shrink-0 md:w-[300px]">¿Otros contaminantes?</p>
              <Controller
                control={control}
                name="other_contamination"
                render={({field: {onChange, value}}) => (
                  <div className="flex gap-6">
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
              <div className="mt-2 flex items-center gap-2 md:mt-0 md:ml-10">
                <span className="text-sm">Fecha aproximada</span>
                <input
                  placeholder="Formato: 00/00/0000"
                  {...register("other_contamination_date", {setValueAs: (v: string) => v || null})}
                  className="w-full border border-gray-500 p-1 md:w-[200px]"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

LaboralContactsSection.displayName = "LaboralContactsSection";
