"use client";

import type {SectionHandler} from "../../useFormRegistry";

import React, {useEffect} from "react";
import {useForm} from "react-hook-form";

import type {MedicalRecordEvaluationType} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

interface Props {
  defaultValues: MedicalRecordEvaluationType | null;
  registerSection: (handler: SectionHandler<MedicalRecordEvaluationType>) => () => void;
}

export const EvaluationTypeSection = React.memo(({defaultValues, registerSection}: Props) => {
  const form = useForm<MedicalRecordEvaluationType>({
    defaultValues: defaultValues ?? ({} as MedicalRecordEvaluationType),
    mode: "onBlur",
  });

  const {getValues, trigger, register} = form;

  // registramos handlers para "Guardar todo"
  useEffect(() => {
    const unregister = registerSection({
      getValues: () => getValues(),
      validate: async () => trigger(),
    });

    return unregister;
  }, [registerSection, getValues, trigger]);

  return (
    <AccordionItem value="item-1">
      <AccordionTrigger>Tipo de evaluación</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-5 md:flex-row md:gap-30">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("preocupational_exam")} />
            <p className="text-lg">Examen Preocupacional</p>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("graduation_exam")} />
            <p className="text-lg">Examen de egreso</p>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("post_enf_prolonged")} />
            <p className="text-lg">Post. Enf. Prolongada</p>
          </label>
          <div className="flex items-center gap-2">
            <input
              className="border border-gray-500 p-1"
              type="checkbox"
              {...register("other_boolean")}
            />
            <p className="text-lg">Otro</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("periodic_exams")} />
            <p className="text-lg">Examen de salud ocupacional</p>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("laboral_change_position")} />
            <p className="text-lg">Cambio Puesto Laboral</p>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("sport_physical_aptitude")} />
            <p className="text-lg">Aptitud Física Deportiva</p>
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" {...register("examen_psicofisico")} /><p className="text-lg">Examen Psicofísico</p></label>
          <label className="flex items-center gap-2">
            <p className="text-lg">¿Cual?</p>
            <input
              className="w-[200px] border border-gray-500 p-1"
              type="text"
              {...register("other", {setValueAs: (v: unknown) => (typeof v === "string" ? v : "")})}
            />
          </label>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

EvaluationTypeSection.displayName = "EvaluationTypeSection";
