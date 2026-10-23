import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {MedicalRecordPreviousProblems} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordPreviousProblems | null;
  registerSection: (handler: SectionHandler<MedicalRecordPreviousProblems>) => () => void;
}

// Helper function to convert string booleans to actual booleans
const normalizeBooleanFields = (
  data: MedicalRecordPreviousProblems | null,
): MedicalRecordPreviousProblems | null => {
  if (!data) return null;

  // The API sometimes returns booleans as strings ("true"/"false")
  // We need to normalize them to actual boolean values
  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    // Column 1 fields
    head_pain: toBool(data.head_pain),
    seizures: toBool(data.seizures),
    dizziness_or_fainting: toBool(data.dizziness_or_fainting),
    excesive_nervious: toBool(data.excesive_nervious),
    memory_loss: toBool(data.memory_loss),
    eyes_problems: toBool(data.eyes_problems),
    ear_problems: toBool(data.ear_problems),
    mouth_problems: toBool(data.mouth_problems),
    skin_diseases: toBool(data.skin_diseases),
    allergies: toBool(data.allergies),
    sinusitis: toBool(data.sinusitis),
    asma: toBool(data.asma),
    long_cough: toBool(data.long_cough),
    tuberculosis: toBool(data.tuberculosis),
    chest_pain: toBool(data.chest_pain),
    insufficient_air: toBool(data.insufficient_air),
    palpitations: toBool(data.palpitations),
    high_or_low_pressure: toBool(data.high_or_low_pressure),
    // others: toBool(data.others), // 'others' is a string in types, keep it as is
    digestive_problems: toBool(data.digestive_problems),
    // Column 2 fields
    hepatitis: toBool(data.hepatitis),
    hernias: toBool(data.hernias),
    hemorroides: toBool(data.hemorroides),
    difficulty_pee: toBool(data.difficulty_pee),
    amputations: toBool(data.amputations),
    bone_breaks: toBool(data.bone_breaks),
    neck_pain: toBool(data.neck_pain),
    back_or_waist_pain: toBool(data.back_or_waist_pain),
    shoulders_elbows_wrists_pain: toBool(data.shoulders_elbows_wrists_pain),
    hips_knees_ankles_pain: toBool(data.hips_knees_ankles_pain),
    plane_feet: toBool(data.plane_feet),
    varices: toBool(data.varices),
    diabetes: toBool(data.diabetes),
    fiebre_reumatica: toBool(data.fiebre_reumatica),
    chagas: toBool(data.chagas),
    sexual_transmition_diseases: toBool(data.sexual_transmition_diseases),
    cancer: toBool(data.cancer),
    medication_actually: toBool(data.medication_actually),
  };
};

export const PreviousProblems = React.memo(({defaultValues, registerSection}: Props) => {
  const normalizedDefaultValues = normalizeBooleanFields(defaultValues);
  const form = useForm<MedicalRecordPreviousProblems>({
    defaultValues: normalizedDefaultValues ?? ({} as MedicalRecordPreviousProblems),
    mode: "onBlur",
  });

  const {getValues, trigger, register, control} = form;

  useEffect(() => {
    const unregister = registerSection({
      getValues: () => {
        const values = getValues();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
        const {others_boolean: _ob, ...rest} = values as any; // Remove others_boolean (column doesn't exist in DB)

        return rest as MedicalRecordPreviousProblems;
      },
      validate: async () => trigger(),
    });

    return unregister;
  }, [registerSection, getValues, trigger]);

  return (
    <AccordionItem value="item-5">
      <AccordionTrigger>¿Usted ha tenido alguno de los siguientes problemas?</AccordionTrigger>
      <AccordionContent>
        <div className="relative">
          <img alt="Logo" className="absolute top-0 right-0" src="/logo.png" width={60} />
          <div className="flex flex-col gap-10 text-lg md:flex-row">
            {/* Columna Izquierda */}
            <div className="flex flex-1 flex-col gap-3">
              {/* Header */}
              <div className="mt-20 flex items-center justify-end">
                <div className="flex gap-6">
                  <p className="w-6 text-center font-semibold">Si</p>
                  <p className="w-6 text-center font-semibold">No</p>
                </div>
              </div>

              {/* Dolores de cabeza frecuente */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Dolores de cabeza frecuente</p>
                <Controller
                  control={control}
                  name="head_pain"
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
              </div>

              {/* Convulsiones */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Convulsiones</p>
                <Controller
                  control={control}
                  name="seizures"
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
              </div>

              {/* Mareos o desmayos */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Mareos o desmayos</p>
                <Controller
                  control={control}
                  name="dizziness_or_fainting"
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
              </div>

              {/* Pérdida de memoria */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Pérdida de memoria</p>
                <Controller
                  control={control}
                  name="memory_loss"
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
              </div>

              {/* Problemas en los ojos o en la vista */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Problemas en los ojos o en la vista</p>
                <Controller
                  control={control}
                  name="eyes_problems"
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
              </div>

              {/* Problemas en los oídos o en la audición */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Problemas en los oídos o en la audición</p>
                <Controller
                  control={control}
                  name="ear_problems"
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
              </div>

              {/* Problemas en la boca/dientes */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Problemas en la boca/dientes</p>
                <Controller
                  control={control}
                  name="mouth_problems"
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
              </div>

              {/* Enfermedades de la piel */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Enfermedades de la piel</p>
                <Controller
                  control={control}
                  name="skin_diseases"
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
              </div>

              {/* Alergias */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Alergias</p>
                <Controller
                  control={control}
                  name="allergies"
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
              </div>

              {/* Sinusitis */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Sinusitis</p>
                <Controller
                  control={control}
                  name="sinusitis"
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
              </div>

              {/* Asma */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Asma</p>
                <Controller
                  control={control}
                  name="asma"
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
              </div>

              {/* Tos prolongada o sangre al escupir */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Tos prolongada o sangre al escupir</p>
                <Controller
                  control={control}
                  name="long_cough"
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
              </div>

              {/* Tuberculosis */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Tuberculosis</p>
                <Controller
                  control={control}
                  name="tuberculosis"
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
              </div>

              {/* Dolores de pecho */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Dolores de pecho</p>
                <Controller
                  control={control}
                  name="chest_pain"
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
              </div>

              {/* Falta de aire */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Falta de aire</p>
                <Controller
                  control={control}
                  name="insufficient_air"
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
              </div>

              {/* Palpitaciones */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Palpitaciones</p>
                <Controller
                  control={control}
                  name="palpitations"
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
              </div>

              {/* Presión alta o baja */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Presión alta o baja</p>
                <Controller
                  control={control}
                  name="high_or_low_pressure"
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
              </div>

              {/* Problemas digestivos */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Problemas digestivos</p>
                <Controller
                  control={control}
                  name="digestive_problems"
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
              </div>

              {/* Otros */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p>Otros</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">¿Cual?</span>
                  <input
                    {...register("others")}
                    className="w-full border border-gray-500 p-1 md:w-[200px]"
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="mt-20 flex flex-1 flex-col gap-3">
              {/* Header */}
              <div className="flex items-center justify-end">
                <div className="flex gap-6">
                  <p className="w-6 text-center font-semibold">Si</p>
                  <p className="w-6 text-center font-semibold">No</p>
                </div>
              </div>

              {/* Hepatitis */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Hepatitis</p>
                <Controller
                  control={control}
                  name="hepatitis"
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
              </div>

              {/* Hernias */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Hernias</p>
                <Controller
                  control={control}
                  name="hernias"
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
              </div>

              {/* Hemorroides */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Hemorroides</p>
                <Controller
                  control={control}
                  name="hemorroides"
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
              </div>

              {/* Dificultad para orinar */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Dificultad para orinar</p>
                <Controller
                  control={control}
                  name="difficulty_pee"
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
              </div>

              {/* Amputaciones */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Amputaciones</p>
                <Controller
                  control={control}
                  name="amputations"
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
              </div>

              {/* Fracturas */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Fracturas</p>
                <Controller
                  control={control}
                  name="bone_breaks"
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
              </div>

              {/* Dolores de cuello */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Dolores de cuello</p>
                <Controller
                  control={control}
                  name="neck_pain"
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
              </div>

              {/* Dolores de espalda o cintura */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Dolores de espalda o cintura</p>
                <Controller
                  control={control}
                  name="back_or_waist_pain"
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
              </div>

              {/* Dolores en hombros/codos/muñecas */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Dolores en hombros/codos/muñecas</p>
                <Controller
                  control={control}
                  name="shoulders_elbows_wrists_pain"
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
              </div>

              {/* Dolores en caderas/rodillas/tobillos */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Dolores en caderas/rodillas/tobillos</p>
                <Controller
                  control={control}
                  name="hips_knees_ankles_pain"
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
              </div>

              {/* Pies planos */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Pies planos</p>
                <Controller
                  control={control}
                  name="plane_feet"
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
              </div>

              {/* Várices */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Várices</p>
                <Controller
                  control={control}
                  name="varices"
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
              </div>

              {/* Diabetes */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Diabetes</p>
                <Controller
                  control={control}
                  name="diabetes"
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
              </div>

              {/* Fiebre reumática */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Fiebre reumática</p>
                <Controller
                  control={control}
                  name="fiebre_reumatica"
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
              </div>

              {/* Chagas */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Chagas</p>
                <Controller
                  control={control}
                  name="chagas"
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
              </div>

              {/* Enfermedades de transmisión sexual */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Enfermedades de transmisión sexual</p>
                <Controller
                  control={control}
                  name="sexual_transmition_diseases"
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
              </div>

              {/* Cáncer o tumores */}
              <div className="flex items-center justify-between">
                <p className="flex-1">Cáncer o tumores</p>
                <Controller
                  control={control}
                  name="cancer"
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
              </div>

              {/* Toma actualmente alguna medicación */}
              <div className="flex items-center justify-between gap-2">
                <p className="flex-1">Toma actualmente alguna medicación</p>
                <Controller
                  control={control}
                  name="medication_actually"
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
              </div>

              {/* ¿Cual? */}
              <div className="flex items-center gap-2">
                <span className="text-sm">¿Cual?</span>
                <input
                  {...register("medication_type")}
                  className="flex-1 border border-gray-500 p-1"
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

PreviousProblems.displayName = "PreviousProblems";
