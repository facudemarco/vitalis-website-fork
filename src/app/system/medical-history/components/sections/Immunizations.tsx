import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {MedicalRecordImmunizations} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordImmunizations | null;
  registerSection: (handler: SectionHandler<MedicalRecordImmunizations>) => () => void;
}

// Helper function to convert string booleans to actual booleans
const normalizeBooleanFields = (
  data: MedicalRecordImmunizations | null,
): MedicalRecordImmunizations | null => {
  if (!data) return null;

  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    sars_cov_2: toBool(data.sars_cov_2),
    fha: toBool(data.fha),
    triple_adultos_tetanos: toBool(data.triple_adultos_tetanos),
    hepatitis_a: toBool(data.hepatitis_a),
    hepatitis_b: toBool(data.hepatitis_b),
    dengue: toBool(data.dengue),
  };
};

export const ImmunizationsSection = React.memo(({defaultValues, registerSection}: Props) => {
  const normalizedDefaults = normalizeBooleanFields(defaultValues);

  const form = useForm<MedicalRecordImmunizations>({
    defaultValues: normalizedDefaults ?? ({} as MedicalRecordImmunizations),
    mode: "onBlur",
  });

  const {getValues, trigger, control} = form;

  useEffect(() => {
    const unregister = registerSection({
      getValues: () => getValues(),
      validate: async () => trigger(),
    });

    return unregister;
  }, [registerSection, getValues, trigger]);

  return (
    <AccordionItem value="item-21">
      <AccordionTrigger>Inmunizaciones</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6">
          <div className="grid grid-cols-[260px_120px_1fr] items-center">
            <span />
            <div className="flex justify-center gap-8">
              <span className="w-6 text-center font-semibold">Si</span>
              <span className="w-6 text-center font-semibold">No</span>
            </div>
            <span>Dosis</span>
          </div>

          {/* Sars-cov-2 */}
          <div className="grid grid-cols-[260px_120px_1fr] items-center">
            <span className="text-lg text-gray-900">Sars-cov-2</span>

            <Controller
              control={control}
              name="sars_cov_2"
              render={({field: {onChange, value}}) => (
                <div className="flex justify-center gap-8">
                  <input
                    checked={value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(true)}
                  />
                  <input
                    checked={!value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(false)}
                  />
                </div>
              )}
            />

            <div className="flex gap-6">
              <Controller
                control={control}
                name="sars_cov_2_dosis"
                render={({field: {onChange, value}}) => (
                  <>
                    {[1, 2, 3, 4].map((num) => (
                      <label key={num} className="flex items-center gap-2">
                        <input
                          checked={value === num}
                          className="radio h-4 w-4 cursor-pointer"
                          type="radio"
                          onChange={() => onChange(num)}
                        />{" "}
                        {num}
                      </label>
                    ))}
                  </>
                )}
              />
            </div>
          </div>

          {/* FHA */}
          <div className="grid grid-cols-[260px_120px_1fr] items-center">
            <span className="text-lg text-gray-900">FHA</span>
            <Controller
              control={control}
              name="fha"
              render={({field: {onChange, value}}) => (
                <div className="flex justify-center gap-8">
                  <input
                    checked={value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(true)}
                  />
                  <input
                    checked={!value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(false)}
                  />
                </div>
              )}
            />
            <span />
          </div>

          {/* DENGUE */}
          <div className="grid grid-cols-[260px_120px_1fr] items-center">
            <span className="text-lg text-gray-900">Dengue</span>
            <Controller
              control={control}
              name="dengue"
              render={({field: {onChange, value}}) => (
                <div className="flex justify-center gap-8">
                  <input
                    checked={value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(true)}
                  />
                  <input
                    checked={!value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(false)}
                  />
                </div>
              )}
            />
            <span />
          </div>

          {/* Triple adultos (tétanos) */}
          <div className="grid grid-cols-[260px_120px_1fr] items-center">
            <span className="text-lg text-gray-900">Triple adultos (tétanos)</span>
            <Controller
              control={control}
              name="triple_adultos_tetanos"
              render={({field: {onChange, value}}) => (
                <div className="flex justify-center gap-8">
                  <input
                    checked={value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(true)}
                  />
                  <input
                    checked={!value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(false)}
                  />
                </div>
              )}
            />
            <span />
          </div>

          {/* Hepatitis A */}
          <div className="grid grid-cols-[260px_120px_1fr] items-center">
            <span className="text-lg text-gray-900">Hepatitis A</span>
            <Controller
              control={control}
              name="hepatitis_a"
              render={({field: {onChange, value}}) => (
                <div className="flex justify-center gap-8">
                  <input
                    checked={value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(true)}
                  />
                  <input
                    checked={!value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(false)}
                  />
                </div>
              )}
            />
            <span />
          </div>

          {/* Hepatitis B */}
          <div className="grid grid-cols-[260px_120px_1fr] items-center">
            <span className="text-lg text-gray-900">Hepatitis B</span>
            <Controller
              control={control}
              name="hepatitis_b"
              render={({field: {onChange, value}}) => (
                <div className="flex justify-center gap-8">
                  <input
                    checked={value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(true)}
                  />
                  <input
                    checked={!value}
                    className="radio"
                    type="radio"
                    onChange={() => onChange(false)}
                  />
                </div>
              )}
            />
            <span />
          </div>
          {(["fiebre_amarilla","meningitis"] as const).map((field) => <div key={field} className="grid grid-cols-[260px_120px_1fr] items-center py-2">
            <span className="text-lg">{field === "fiebre_amarilla" ? "Fiebre amarilla" : "Meningitis"}</span>
            <Controller control={control} name={field} render={({field: {onChange,value}}) => <div className="flex justify-center gap-8">
              <label className="flex items-center gap-1"><input checked={value === true} className="radio" type="radio" onChange={() => onChange(true)} />Sí</label>
              <label className="flex items-center gap-1"><input checked={value === false} className="radio" type="radio" onChange={() => onChange(false)} />No</label>
            </div>} />
            <span />
          </div>)}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

ImmunizationsSection.displayName = "ImmunizationsSection";
