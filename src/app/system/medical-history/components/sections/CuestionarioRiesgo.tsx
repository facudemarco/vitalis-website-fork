import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";

import {
  MedicalRecordCuestionarioRiesgos,
  MedicalRecordDDJJ,
  MedicalRecordNeuroMedicalExam,
  MedicalRecordOftalmologicoMedicalExam,
} from "@/types";

import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

import {SectionHandler} from "../../useFormRegistry";

// Helper function to convert string booleans to actual booleans
const normalizeBooleanFields = (data: MedicalRecordDDJJ | null): MedicalRecordDDJJ | null => {
  if (!data) return null;

  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    last_year_mareos_vertigo_desmayos: toBool(data.last_year_mareos_vertigo_desmayos),
    pico_presion_arterial: toBool(data.pico_presion_arterial),
    golpe_severo_craneo: toBool(data.golpe_severo_craneo),
    trastornos_depresivos_fobias: toBool(data.trastornos_depresivos_fobias),
    inseguridad_trabajos_altura: toBool(data.inseguridad_trabajos_altura),
    epilepsias_convulsiones: toBool(data.epilepsias_convulsiones),
    medicacion_neurologica: toBool(data.medicacion_neurologica),
    hipoglucemia: toBool(data.hipoglucemia),
    caidas: toBool(data.caidas),
    inseguridad_conduccion: toBool(data.inseguridad_conduccion),
  };
};

const normalizeNeuroFields = (
  data: MedicalRecordNeuroMedicalExam | null,
): MedicalRecordNeuroMedicalExam | null => {
  if (!data) return null;

  const toBool = (value: any): boolean => value === "true" || value === true;

  return {
    ...data,
    test_dedo_nariz_normal: toBool(data.test_dedo_nariz_normal),
    test_dedo_nariz_anormal: toBool(data.test_dedo_nariz_anormal),
    test_romberg_normal: toBool(data.test_romberg_normal),
    test_romberg_anormal: toBool(data.test_romberg_anormal),
    test_seguimiento_ocular_normal: toBool(data.test_seguimiento_ocular_normal),
    test_seguimiento_ocular_anormal: toBool(data.test_seguimiento_ocular_anormal),
    exam_miembro_sup_normal: toBool(data.exam_miembro_sup_normal),
    exam_miembro_sup_anormal: toBool(data.exam_miembro_sup_anormal),
    exam_miembro_inf_normal: toBool(data.exam_miembro_inf_normal),
    exam_miembro_inf_anormal: toBool(data.exam_miembro_inf_anormal),
  };
};

interface Props {
  defaultValuesCuestionario: MedicalRecordCuestionarioRiesgos | null;
  defaultValuesDDJJ: MedicalRecordDDJJ | null;
  defaultValuesNeuro: MedicalRecordNeuroMedicalExam | null;
  defaultValuesOftalmo: MedicalRecordOftalmologicoMedicalExam | null;
  registerCuestionario: (handler: SectionHandler<MedicalRecordCuestionarioRiesgos>) => () => void;
  registerDDJJ: (handler: SectionHandler<MedicalRecordDDJJ>) => () => void;
  registerNeuro: (handler: SectionHandler<MedicalRecordNeuroMedicalExam>) => () => void;
  registerOftalmo: (handler: SectionHandler<MedicalRecordOftalmologicoMedicalExam>) => () => void;
}

export const CuestionarioRiesgoSection = React.memo(
  ({
    defaultValuesCuestionario,
    defaultValuesDDJJ,
    defaultValuesNeuro,
    defaultValuesOftalmo,
    registerCuestionario,
    registerDDJJ,
    registerNeuro,
    registerOftalmo,
  }: Props) => {
    // Form for Cuestionario Riesgos
    const cuestionarioForm = useForm<MedicalRecordCuestionarioRiesgos>({
      defaultValues: defaultValuesCuestionario ?? ({} as MedicalRecordCuestionarioRiesgos),
      mode: "onBlur",
    });

    const {
      getValues: getCuestionarioValues,
      trigger: triggerCuestionario,
      register: registerCuestionarioField,
    } = cuestionarioForm;

    // Form for DDJJ
    const normalizedDDJJ = normalizeBooleanFields(defaultValuesDDJJ);

    const ddjjForm = useForm<MedicalRecordDDJJ>({
      defaultValues: normalizedDDJJ ?? ({} as MedicalRecordDDJJ),
      mode: "onBlur",
    });

    const {
      getValues: getDDJJValues,
      trigger: triggerDDJJ,
      register: registerDDJJField,
      control: ddjjControl,
    } = ddjjForm;

    useEffect(() => {
      const unregisterCuestionario = registerCuestionario({
        getValues: () => getCuestionarioValues(),
        validate: async () => triggerCuestionario(),
      });

      return unregisterCuestionario;
    }, [registerCuestionario, getCuestionarioValues, triggerCuestionario]);

    useEffect(() => {
      const unregisterDDJJ = registerDDJJ({
        getValues: () => getDDJJValues(),
        validate: async () => triggerDDJJ(),
      });

      return unregisterDDJJ;
    }, [registerDDJJ, getDDJJValues, triggerDDJJ]);

    // Form for Neuro Medical Exam
    const normalizedNeuro = normalizeNeuroFields(defaultValuesNeuro);

    const neuroForm = useForm<MedicalRecordNeuroMedicalExam>({
      defaultValues: normalizedNeuro ?? ({} as MedicalRecordNeuroMedicalExam),
      mode: "onBlur",
    });

    const {
      getValues: getNeuroValues,
      trigger: triggerNeuro,
      register: registerNeuroField,
      control: neuroControl,
    } = neuroForm;

    useEffect(() => {
      const unregisterNeuro = registerNeuro({
        getValues: () => getNeuroValues(),
        validate: async () => triggerNeuro(),
      });

      return unregisterNeuro;
    }, [registerNeuro, getNeuroValues, triggerNeuro]);

    // Form for Oftalmologico Medical Exam
    const oftalmoForm = useForm<MedicalRecordOftalmologicoMedicalExam>({
      defaultValues: defaultValuesOftalmo ?? ({} as MedicalRecordOftalmologicoMedicalExam),
      mode: "onBlur",
    });

    const {
      getValues: getOftalmoValues,
      trigger: triggerOftalmo,
      register: registerOftalmoField,
    } = oftalmoForm;

    useEffect(() => {
      const unregisterOftalmo = registerOftalmo({
        getValues: () => getOftalmoValues(),
        validate: async () => triggerOftalmo(),
      });

      return unregisterOftalmo;
    }, [registerOftalmo, getOftalmoValues, triggerOftalmo]);

    return (
      <AccordionItem value="item-cuestionario-riesgo">
        <AccordionTrigger>Declaraciones y exámenes complementarios</AccordionTrigger>
        <AccordionContent>
          <div className="relative">
            <img alt="Logo" className="absolute top-0 right-0" src="/logo.png" width={60} />

            {/* ── Sección 2: Declaración Jurada ── */}
            <div>
              <p className="mb-2 text-lg font-semibold">
                Marque la opción correcta; Declaración Jurada para completar por el trabajador
              </p>
              <p className="mb-4 text-base italic">Tiene o tuvo en el último año</p>

              <div className="flex gap-8">
                {/* Columna Izquierda */}
                <div className="flex-1">
                  <div className="flex flex-col gap-3 text-lg">
                    {/* Header */}
                    <div className="flex items-center">
                      <div className="flex-1" />
                      <div className="flex gap-3">
                        <p className="w-6 text-center text-base font-semibold">Si</p>
                        <p className="w-6 text-center text-base font-semibold">No</p>
                      </div>
                    </div>

                    {/* ¿Mareos, vértigos o desmayos? */}
                    <div className="flex items-center">
                      <p className="flex-1 text-base">¿Mareos, vértigos o desmayos?</p>
                      <Controller
                        control={ddjjControl}
                        name="last_year_mareos_vertigo_desmayos"
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

                    {/* ¿Pico de presión arterial? */}
                    <div className="flex items-center">
                      <p className="flex-1 text-base">¿Pico de presión arterial?</p>
                      <Controller
                        control={ddjjControl}
                        name="pico_presion_arterial"
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

                    {/* ¿Golpe severo en el cráneo? */}
                    <div className="flex items-center">
                      <p className="flex-1 text-base">¿Golpe severo en el cráneo?</p>
                      <Controller
                        control={ddjjControl}
                        name="golpe_severo_craneo"
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

                    {/* ¿Trastornos depresivos o fobias? */}
                    <div className="flex items-center">
                      <p className="flex-1 text-base">¿Trastornos depresivos o fobias?</p>
                      <Controller
                        control={ddjjControl}
                        name="trastornos_depresivos_fobias"
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

                    {/* ¿Inseguridad trabajos en altura? */}
                    <div className="flex items-center">
                      <p className="flex-1 text-base">
                        ¿Conoce alguna razón para considerar inseguro para usted o para terceros,
                        que usted realice trabajos en altura y/o trabajos en espacios confinados?
                      </p>
                      <Controller
                        control={ddjjControl}
                        name="inseguridad_trabajos_altura"
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
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="flex-1">
                  <div className="flex flex-col gap-3 text-lg">
                    {/* Header */}
                    <div className="flex items-center">
                      <div className="flex-1" />
                      <div className="flex gap-3">
                        <p className="w-6 text-center text-base font-semibold">Si</p>
                        <p className="w-6 text-center text-base font-semibold">No</p>
                      </div>
                    </div>

                    {/* ¿Epilepsias y/o convulsiones? */}
                    <div className="flex items-center">
                      <p className="flex-1 text-base">¿Epilepsias y/o convulsiones?</p>
                      <Controller
                        control={ddjjControl}
                        name="epilepsias_convulsiones"
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

                    {/* ¿Medicación neurológica? */}
                    <div className="flex items-center">
                      <p className="flex-1 text-base">
                        ¿Toma alguna medicación neurológica o medicamentos que produzcan
                        somnolencia?
                      </p>
                      <Controller
                        control={ddjjControl}
                        name="medicacion_neurologica"
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

                    {/* ¿Hipoglucemia? */}
                    <div className="flex items-center">
                      <p className="flex-1 text-base">
                        ¿Hipoglucemia (descanso sintomático del azúcar)?
                      </p>
                      <Controller
                        control={ddjjControl}
                        name="hipoglucemia"
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

                    {/* ¿Caídas desde altura? */}
                    <div className="flex items-center">
                      <p className="flex-1 text-base">¿Caídas desde altura?</p>
                      <Controller
                        control={ddjjControl}
                        name="caidas"
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

                    {/* ¿Inseguridad conducción? */}
                    <div className="flex items-center">
                      <p className="flex-1 text-base">
                        ¿Conoce alguna razón para considerar inseguro para usted o para terceros,
                        que usted realice conducción de vehículos?
                      </p>
                      <Controller
                        control={ddjjControl}
                        name="inseguridad_conduccion"
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
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="mt-4 flex flex-col gap-2">
                <span className="text-base font-semibold">
                  Observaciones a completar por el médico (realizar las especificaciones por cada
                  ítem con respuesta afirmativa):
                </span>
                <textarea
                  {...registerDDJJField("observations")}
                  className="h-24 w-full resize-none border border-gray-500 p-2"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            {/* ── Sección 3: Examen Neurológico ── */}
            <div>
              <p className="mb-2 text-lg font-semibold">
                Para completar por el médico; Examen Neurológico
              </p>
              <p className="mb-4 text-base italic">Tiene o tuvo en el último año</p>

              <div className="flex flex-col gap-3 text-lg">
                {/* Header */}
                <div className="flex items-center">
                  <div className="flex-1" />
                  <div className="flex gap-4">
                    <p className="w-16 text-center text-base font-semibold">Normal</p>
                    <p className="w-16 text-center text-base font-semibold">Anormal</p>
                    <p className="w-[200px] text-center text-base font-semibold">Describir</p>
                  </div>
                </div>

                {/* Prueba dedo - nariz */}
                <div className="flex items-center">
                  <p className="flex-1 text-base">Prueba dedo - nariz</p>
                  <div className="flex gap-4">
                    <Controller
                      control={neuroControl}
                      name="test_dedo_nariz_normal"
                      render={({field: {onChange, value}}) => (
                        <div className="flex w-16 justify-center">
                          <input
                            checked={value}
                            className="h-6 w-6 cursor-pointer"
                            type="radio"
                            onChange={() => {
                              onChange(true);
                              neuroForm.setValue("test_dedo_nariz_anormal", false);
                            }}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      control={neuroControl}
                      name="test_dedo_nariz_anormal"
                      render={({field: {onChange, value}}) => (
                        <div className="flex w-16 justify-center">
                          <input
                            checked={value}
                            className="h-6 w-6 cursor-pointer"
                            type="radio"
                            onChange={() => {
                              onChange(true);
                              neuroForm.setValue("test_dedo_nariz_normal", false);
                            }}
                          />
                        </div>
                      )}
                    />
                    <input
                      {...registerNeuroField("test_dedo_nariz_description")}
                      className="w-[200px] border border-gray-500 p-1"
                      placeholder="Describir"
                      type="text"
                    />
                  </div>
                </div>

                {/* Prueba de Romberg */}
                <div className="flex items-center">
                  <p className="flex-1 text-base">Prueba de Romberg</p>
                  <div className="flex gap-4">
                    <Controller
                      control={neuroControl}
                      name="test_romberg_normal"
                      render={({field: {onChange, value}}) => (
                        <div className="flex w-16 justify-center">
                          <input
                            checked={value}
                            className="h-6 w-6 cursor-pointer"
                            type="radio"
                            onChange={() => {
                              onChange(true);
                              neuroForm.setValue("test_romberg_anormal", false);
                            }}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      control={neuroControl}
                      name="test_romberg_anormal"
                      render={({field: {onChange, value}}) => (
                        <div className="flex w-16 justify-center">
                          <input
                            checked={value}
                            className="h-6 w-6 cursor-pointer"
                            type="radio"
                            onChange={() => {
                              onChange(true);
                              neuroForm.setValue("test_romberg_normal", false);
                            }}
                          />
                        </div>
                      )}
                    />
                    <input
                      {...registerNeuroField("test_romberg_description")}
                      className="w-[200px] border border-gray-500 p-1"
                      placeholder="Describir"
                      type="text"
                    />
                  </div>
                </div>

                {/* Prueba de seguimiento ocular */}
                <div className="flex items-center">
                  <p className="flex-1 text-base">Prueba de seguimiento ocular</p>
                  <div className="flex gap-4">
                    <Controller
                      control={neuroControl}
                      name="test_seguimiento_ocular_normal"
                      render={({field: {onChange, value}}) => (
                        <div className="flex w-16 justify-center">
                          <input
                            checked={value}
                            className="h-6 w-6 cursor-pointer"
                            type="radio"
                            onChange={() => {
                              onChange(true);
                              neuroForm.setValue("test_seguimiento_ocular_anormal", false);
                            }}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      control={neuroControl}
                      name="test_seguimiento_ocular_anormal"
                      render={({field: {onChange, value}}) => (
                        <div className="flex w-16 justify-center">
                          <input
                            checked={value}
                            className="h-6 w-6 cursor-pointer"
                            type="radio"
                            onChange={() => {
                              onChange(true);
                              neuroForm.setValue("test_seguimiento_ocular_normal", false);
                            }}
                          />
                        </div>
                      )}
                    />
                    <input
                      {...registerNeuroField("test_seguimiento_ocular_description")}
                      className="w-[200px] border border-gray-500 p-1"
                      placeholder="Describir"
                      type="text"
                    />
                  </div>
                </div>

                {/* Examen de miembro Sup. (Sensitivo y Motor) */}
                <div className="flex items-center">
                  <p className="flex-1 text-base">Examen de miembro Sup. (Sensitivo y Motor)</p>
                  <div className="flex gap-4">
                    <Controller
                      control={neuroControl}
                      name="exam_miembro_sup_normal"
                      render={({field: {onChange, value}}) => (
                        <div className="flex w-16 justify-center">
                          <input
                            checked={value}
                            className="h-6 w-6 cursor-pointer"
                            type="radio"
                            onChange={() => {
                              onChange(true);
                              neuroForm.setValue("exam_miembro_sup_anormal", false);
                            }}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      control={neuroControl}
                      name="exam_miembro_sup_anormal"
                      render={({field: {onChange, value}}) => (
                        <div className="flex w-16 justify-center">
                          <input
                            checked={value}
                            className="h-6 w-6 cursor-pointer"
                            type="radio"
                            onChange={() => {
                              onChange(true);
                              neuroForm.setValue("exam_miembro_sup_normal", false);
                            }}
                          />
                        </div>
                      )}
                    />
                    <input
                      {...registerNeuroField("exam_miembro_sup_description")}
                      className="w-[200px] border border-gray-500 p-1"
                      placeholder="Describir"
                      type="text"
                    />
                  </div>
                </div>

                {/* Examen de miembro Inf. (Sensitivo y Motor) */}
                <div className="flex items-center">
                  <p className="flex-1 text-base">Examen de miembro Inf. (Sensitivo y Motor)</p>
                  <div className="flex gap-4">
                    <Controller
                      control={neuroControl}
                      name="exam_miembro_inf_normal"
                      render={({field: {onChange, value}}) => (
                        <div className="flex w-16 justify-center">
                          <input
                            checked={value}
                            className="h-6 w-6 cursor-pointer"
                            type="radio"
                            onChange={() => {
                              onChange(true);
                              neuroForm.setValue("exam_miembro_inf_anormal", false);
                            }}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      control={neuroControl}
                      name="exam_miembro_inf_anormal"
                      render={({field: {onChange, value}}) => (
                        <div className="flex w-16 justify-center">
                          <input
                            checked={value}
                            className="h-6 w-6 cursor-pointer"
                            type="radio"
                            onChange={() => {
                              onChange(true);
                              neuroForm.setValue("exam_miembro_inf_normal", false);
                            }}
                          />
                        </div>
                      )}
                    />
                    <input
                      {...registerNeuroField("exam_miembro_inf_description")}
                      className="w-[200px] border border-gray-500 p-1"
                      placeholder="Describir"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            {/* ── Sección 4: Examen Oftalmológico ── */}
            <div>
              <p className="mb-2 text-lg font-semibold">Examen Oftalmológico</p>
              <p className="mb-4 text-base font-semibold">Agudeza Visual</p>

              {/* Tabla Oftalmológica */}
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr>
                      <th className="w-[200px] py-2 text-left font-semibold" />
                      <th className="px-4 py-2 text-center font-semibold">OI</th>
                      <th className="px-4 py-2 text-center font-semibold">OD</th>
                      <th className="px-4 py-2 text-center font-semibold">BINOCULAR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* A. Visual Cercana */}
                    <tr>
                      <td className="py-2">A. Visual Cercana</td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("visual_cercana_oi")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("visual_cercana_od")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("visual_cercana_binocular")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                    </tr>

                    {/* A. Visual Lejana */}
                    <tr>
                      <td className="py-2">A. Visual Lejana</td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("visual_lejana_oi")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("visual_lejana_od")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("visual_lejana_binocular")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                    </tr>

                    {/* Discriminación de colores */}
                    <tr>
                      <td className="py-2">Discriminación de colores</td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("discriminacion_colores_oi")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("discriminacion_colores_od")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("discriminacion_colores_binocular")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                    </tr>

                    {/* Campimetría */}
                    <tr>
                      <td className="py-2">Campimetría</td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("campimetria_oi")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("campimetria_od")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...registerOftalmoField("campimetria_binocular")}
                          className="w-full border border-gray-500 p-1"
                          type="text"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Dictamen */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-base font-semibold">Dictamen</span>
                <input
                  {...registerOftalmoField("dictamen")}
                  className="flex-1 border border-gray-500 p-2"
                  type="text"
                />
              </div>
            </div>


          </div>
        </AccordionContent>
      </AccordionItem>
    );
  },
);

CuestionarioRiesgoSection.displayName = "CuestionarioRiesgoSection";

