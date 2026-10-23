import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {MedicalRecordHabits} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordHabits | null;
  registerSection: (handler: SectionHandler<MedicalRecordHabits>) => () => void;
}

// Helper function to convert string booleans to actual booleans
const normalizeBooleanFields = (data: MedicalRecordHabits | null): MedicalRecordHabits | null => {
  if (!data) return null;

  // The API sometimes returns booleans as strings ("true"/"false")
  // We need to normalize them to actual boolean values
  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    physic_activity: toBool(data.physic_activity),
    sleep_alteration: toBool(data.sleep_alteration),
    smoke: toBool(data.smoke),
    alcoholic_drinks: toBool(data.alcoholic_drinks),
    drugs: toBool(data.drugs),
    diet: toBool(data.diet),
    daily_diet: toBool(data.daily_diet),
  };
};

export const HabitsSection = React.memo(({defaultValues, registerSection}: Props) => {
  const normalizedDefaults = normalizeBooleanFields(defaultValues);

  const form = useForm<MedicalRecordHabits>({
    defaultValues: normalizedDefaults ?? ({} as MedicalRecordHabits),
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
    <AccordionItem value="item-2">
      <AccordionTrigger>Hábitos</AccordionTrigger>
      <AccordionContent>
        <div className="relative">
          <img alt="Logo" className="absolute top-0 right-0" src="/logo.png" width={60} />
          <div className="flex flex-col gap-3 text-lg">
            {/* Header */}
            <div className="flex items-center text-lg">
              <div className="w-[150px] shrink-0 md:w-[300px]" />
              <div className="flex gap-6">
                <p className="w-6 text-center font-semibold">Si</p>
                <p className="w-6 text-center font-semibold">No</p>
              </div>
            </div>

            {/* Fuma */}
            <div className="flex flex-wrap items-center text-lg">
              <p className="w-[150px] shrink-0 md:w-[300px]">Fuma</p>
              <Controller
                control={control}
                name="smoke"
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
                <span className="text-sm">¿Cuántos por día?</span>
                <input
                  {...register("smoke_quantity", {setValueAs: (v: string) => v || null})}
                  className="w-full border border-gray-500 p-1 md:w-[180px]"
                  type="text"
                />
              </div>
            </div>

            {/* Toma bebidas alcoholicas */}
            <div className="flex flex-wrap items-center text-lg">
              <p className="w-[150px] shrink-0 md:w-[300px]">Toma bebidas alcohólicas</p>
              <Controller
                control={control}
                name="alcoholic_drinks"
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
                <span className="text-sm">Cantidad</span>
                <input
                  {...register("alcoholic_drinks_quantity", {setValueAs: (v: string) => v || null})}
                  className="w-full border border-gray-500 p-1 md:w-[180px]"
                  type="text"
                />
              </div>
            </div>

            {/* Usa/ha usado drogas en abuso */}
            <div className="flex flex-wrap items-center text-lg">
              <p className="w-[150px] shrink-0 md:w-[300px]">Usa/ha usado drogas en abuso</p>
              <Controller
                control={control}
                name="drugs"
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
                <span className="text-sm">¿Cuáles?</span>
                <input
                  {...register("drugs_type")}
                  className="w-full border border-gray-500 p-1 md:w-[180px]"
                  type="text"
                />
              </div>
            </div>

            {/* Tiene alteración del sueño */}
            <div className="flex flex-wrap items-center text-lg">
              <p className="w-[150px] shrink-0 md:w-[300px]">Tiene alteración del sueño</p>
              <Controller
                control={control}
                name="sleep_alteration"
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
                <span className="text-sm">¿Cuántas horas duerme?</span>
                <input
                  {...register("sleep_hours", {setValueAs: (v: string) => v || null})}
                  className="w-full border border-gray-500 p-1 md:w-[180px]"
                  type="text"
                />
              </div>
            </div>

            {/* Hace alguna dieta */}
            <div className="flex flex-wrap items-center text-lg">
              <p className="w-[150px] shrink-0 md:w-[300px]">Hace alguna dieta</p>
              <Controller
                control={control}
                name="daily_diet"
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
                <span className="text-sm">¿De qué tipo?</span>
                <input
                  {...register("diet_type")}
                  className="w-full border border-gray-500 p-1 md:w-[180px]"
                  type="text"
                />
              </div>
            </div>

            {/* Realiza actividad física */}
            <div className="flex flex-wrap items-center text-lg">
              <p className="w-[150px] shrink-0 md:w-[300px]">Realiza actividad física</p>
              <Controller
                control={control}
                name="physic_activity"
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
                <span className="text-sm">¿Cuál?</span>
                <input
                  {...register("physic_activity_type")}
                  className="w-full border border-gray-500 p-1 md:w-[180px]"
                  type="text"
                />
              </div>
              <div className="mt-2 flex-col items-center gap-3 md:mt-0 md:ml-4">
                <Controller
                  control={control}
                  name="frequency"
                  render={({field: {onChange, value}}) => (
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-1">
                        <input
                          checked={value === "leve"}
                          type="radio"
                          value="leve"
                          onChange={() => onChange("leve")}
                        />
                        <span className="text-sm">Leve</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          checked={value === "moderada"}
                          type="radio"
                          value="moderada"
                          onChange={() => onChange("moderada")}
                        />
                        <span className="text-sm">Moderada</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          checked={value === "intensa"}
                          type="radio"
                          value="intensa"
                          onChange={() => onChange("intensa")}
                        />
                        <span className="text-sm">Intensa</span>
                      </label>
                    </div>
                  )}
                />
                <p className="text-center text-lg">Frecuencia</p>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

HabitsSection.displayName = "HabitsSection";
