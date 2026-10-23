import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {MedicalRecordRecomendations} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordRecomendations | null;
  registerSection: (handler: SectionHandler<MedicalRecordRecomendations>) => () => void;
}

const normalizeBooleanFields = (
  data: MedicalRecordRecomendations | null,
): MedicalRecordRecomendations | null => {
  if (!data) return null;

  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    no_apto_definitivo: toBool(data.no_apto_definitivo),
    apto: toBool(data.apto),
    apto_preexistencia_condiciona: toBool(data.apto_preexistencia_condiciona),
    no_apto_temporal: toBool(data.no_apto_temporal),
    apto_preexistencia_no_condiciona: toBool(data.apto_preexistencia_no_condiciona),
  };
};

export const RecomendationsSection = React.memo(({defaultValues, registerSection}: Props) => {
  const normalizedDefaults = normalizeBooleanFields(defaultValues);

  const form = useForm<MedicalRecordRecomendations>({
    defaultValues: normalizedDefaults ?? ({} as MedicalRecordRecomendations),
    mode: "onBlur",
  });

  const {getValues, trigger, register, control, setValue} = form;

  useEffect(() => {
    const unregister = registerSection({
      getValues: () => getValues(),
      validate: async () => trigger(),
    });

    return unregister;
  }, [registerSection, getValues, trigger]);

  const handleSelection = (selectedField: keyof MedicalRecordRecomendations) => {
    const fields: (keyof MedicalRecordRecomendations)[] = [
      "apto",
      "apto_preexistencia_no_condiciona",
      "no_apto_definitivo",
      "apto_preexistencia_condiciona",
      "no_apto_temporal",
    ];

    fields.forEach((field) => {
      if (field === selectedField) {
        setValue(field as any, true, {shouldValidate: true, shouldDirty: true});
      } else {
        setValue(field as any, false, {shouldValidate: true, shouldDirty: true});
      }
    });
  };

  return (
    <AccordionItem value="item-23">
      <AccordionTrigger>Conclusiones y recomendaciones</AccordionTrigger>
      <AccordionContent>
        <div className="relative">
          <img alt="Logo" className="absolute top-0 right-0" src="/logo.png" width={60} />
          <div className="flex flex-col gap-3 text-lg">
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
              {/* Apto */}
              <Controller
                control={control}
                name="apto"
                render={({field: {value}}) => (
                  <div className="flex items-center gap-2">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      id="rec-apto"
                      type="radio"
                      onChange={() => handleSelection("apto")}
                    />
                    <label className="text-base" htmlFor="rec-apto">
                      Apto
                    </label>
                  </div>
                )}
              />

              {/* Apto con preexistencia no condiciona */}
              <Controller
                control={control}
                name="apto_preexistencia_no_condiciona"
                render={({field: {value}}) => (
                  <div className="flex items-center gap-2">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      id="rec-apto-sin-condicion"
                      type="radio"
                      onChange={() => handleSelection("apto_preexistencia_no_condiciona")}
                    />
                    <label className="text-base" htmlFor="rec-apto-sin-condicion">
                      Apto con preexistencia que no condiciona su tarea laboral
                    </label>
                  </div>
                )}
              />

              {/* No apto definitivo */}
              <Controller
                control={control}
                name="no_apto_definitivo"
                render={({field: {value}}) => (
                  <div className="flex items-center gap-2">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      id="rec-no-apto-definitivo"
                      type="radio"
                      onChange={() => handleSelection("no_apto_definitivo")}
                    />
                    <label className="text-base" htmlFor="rec-no-apto-definitivo">
                      No apto definitivo
                    </label>
                  </div>
                )}
              />

              {/* Apto con preexistencia condiciona */}
              <Controller
                control={control}
                name="apto_preexistencia_condiciona"
                render={({field: {value}}) => (
                  <div className="flex items-center gap-2">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      id="rec-apto-con-condicion"
                      type="radio"
                      onChange={() => handleSelection("apto_preexistencia_condiciona")}
                    />
                    <label className="text-base" htmlFor="rec-apto-con-condicion">
                      Apto con preexistencia que condiciona su tarea laboral
                    </label>
                  </div>
                )}
              />

              {/* No apto temporal */}
              <Controller
                control={control}
                name="no_apto_temporal"
                render={({field: {value}}) => (
                  <div className="flex items-center gap-2">
                    <input
                      checked={value}
                      className="h-6 w-6 cursor-pointer"
                      id="rec-no-apto-temporal"
                      type="radio"
                      onChange={() => handleSelection("no_apto_temporal")}
                    />
                    <label className="text-base" htmlFor="rec-no-apto-temporal">
                      No apto temporal
                    </label>
                  </div>
                )}
              />
            </div>

            <label className="mt-3 flex items-center gap-2"><input type="checkbox" {...register("retenido")} /><span className="text-base">Retenido</span></label>

            {/* Duración */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-base">Duración</span>
              <input
                {...register("duracion")}
                className="w-full border border-gray-500 p-1 md:w-[200px]"
                type="text"
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

RecomendationsSection.displayName = "RecomendationsSection";
