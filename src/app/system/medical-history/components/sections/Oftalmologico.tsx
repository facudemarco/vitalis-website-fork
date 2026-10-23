import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {MedicalRecordOftalmologicoExam, MedicalRecordOphthalmology} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";
import {OphthalmologySection} from "./Ophthalmology";

interface Props {
  defaultValues: MedicalRecordOftalmologicoExam | null;
  registerSection: (handler: SectionHandler<MedicalRecordOftalmologicoExam>) => () => void;
  ophthalmologyValues: MedicalRecordOphthalmology | null;
  registerOphthalmology: (handler: SectionHandler<MedicalRecordOphthalmology>) => () => void;
}

// Helper function to convert string booleans to actual booleans
const normalizeBooleanFields = (
  data: MedicalRecordOftalmologicoExam | null,
): MedicalRecordOftalmologicoExam | null => {
  if (!data) return null;

  // The API sometimes returns booleans as strings ("true"/"false")
  // We need to normalize them to actual boolean values
  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    eyes_alterations: toBool(data.eyes_alterations),
    discromatopsia: toBool(data.discromatopsia),
  };
};

export const OftalmologicoExamSection = React.memo(({defaultValues, registerSection, ophthalmologyValues, registerOphthalmology}: Props) => {
  const normalizedDefaults = normalizeBooleanFields(defaultValues);

  const form = useForm<MedicalRecordOftalmologicoExam>({
    defaultValues: normalizedDefaults ?? ({} as MedicalRecordOftalmologicoExam),
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
    <AccordionItem value="item-10">
      <AccordionTrigger>Examen Oftalmológico</AccordionTrigger>
      <AccordionContent>
        <div className="relative">
          <img alt="Logo" className="absolute top-0 right-0" src="/logo.png" width={60} />
          <div className="flex flex-col gap-4 text-lg">
            {/* Agudeza Visual */}
            <div>
              <p className="font-semibold">Agudeza Visual</p>

              {/* Cercana */}
              <p className="mt-3 italic">Cercana</p>
              <div className="mt-2 flex gap-8">
                <div className="flex items-center gap-2">
                  <span>S/C | OD</span>
                  <input
                    {...register("sc_od_nearby", {valueAsNumber: true})}
                    className="w-full border border-gray-500 p-1 md:w-[120px]"
                    type="text"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>S/C | OI</span>
                  <input
                    {...register("sc_oi_nearby", {valueAsNumber: true})}
                    className="w-full border border-gray-500 p-1 md:w-[120px]"
                    type="text"
                  />
                </div>
              </div>
              <div className="mt-2 flex gap-8">
                <div className="flex items-center gap-2">
                  <span>C/C | OD</span>
                  <input
                    {...register("cc_od_nearby", {valueAsNumber: true})}
                    className="w-full border border-gray-500 p-1 md:w-[120px]"
                    type="text"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>C/C | OI</span>
                  <input
                    {...register("cc_oi_nearby", {valueAsNumber: true})}
                    className="w-full border border-gray-500 p-1 md:w-[120px]"
                    type="text"
                  />
                </div>
              </div>

              {/* Lejana */}
              <p className="mt-4 italic">Lejana</p>
              <div className="mt-2 flex gap-8">
                <div className="flex items-center gap-2">
                  <span>S/C | OD</span>
                  <input
                    {...register("sc_od_distant", {valueAsNumber: true})}
                    className="w-full border border-gray-500 p-1 md:w-[120px]"
                    type="text"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>S/C | OI</span>
                  <input
                    {...register("sc_oi_distant", {valueAsNumber: true})}
                    className="w-full border border-gray-500 p-1 md:w-[120px]"
                    type="text"
                  />
                </div>
              </div>
              <div className="mt-2 flex gap-8">
                <div className="flex items-center gap-2">
                  <span>C/C | OD</span>
                  <input
                    {...register("cc_od_distant", {valueAsNumber: true})}
                    className="w-full border border-gray-500 p-1 md:w-[120px]"
                    type="text"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>C/C | OI</span>
                  <input
                    {...register("cc_oi_distant", {valueAsNumber: true})}
                    className="w-full border border-gray-500 p-1 md:w-[120px]"
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* Header Si No con spacing reducido */}
            <div className="mt-4 flex items-center">
              <div className="flex-1" />
              <div className="flex gap-3">
                <p className="w-6 text-center font-semibold">Si</p>
                <p className="w-6 text-center font-semibold">No</p>
              </div>
            </div>

            {/* Alteraciones oculares */}
            <div className="flex items-center">
              <p className="flex-1">Alteraciones oculares</p>
              <Controller
                control={control}
                name="eyes_alterations"
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

            {/* Discromatopsia */}
            <div className="flex items-center">
              <p className="flex-1">Discromatopsia</p>
              <Controller
                control={control}
                name="discromatopsia"
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
      <OphthalmologySection defaultValues={ophthalmologyValues} registerSection={registerOphthalmology} embedded />
      </AccordionContent>
    </AccordionItem>
  );
});

OftalmologicoExamSection.displayName = "OftalmologicoExamSection";
