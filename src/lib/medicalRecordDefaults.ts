import type {MedicalRecord} from "@/types";

// Only fields whose existing form selects No for an empty value belong here.
// Unanswered diagnoses, family survival, conclusions and normal/abnormal choices stay unset.
export const DEFAULT_NO_FIELDS: Partial<Record<keyof MedicalRecord, readonly string[]>> = {
  "medical_record_bucodental_exam": [
    "protesis",
    "caries",
    "encias_alteradas",
    "dentadura_parcial"
  ],
  "medical_record_cardiovascular_exam": [
    "ritmo_irregular",
    "ruidos_alterados",
    "extrasistoles",
    "soplos",
    "pulsos_perifericos_ausentes",
    "varices"
  ],
  "medical_record_ddjj": [
    "last_year_mareos_vertigo_desmayos",
    "pico_presion_arterial",
    "golpe_severo_craneo",
    "trastornos_depresivos_fobias",
    "inseguridad_trabajos_altura",
    "epilepsias_convulsiones",
    "medicacion_neurologica",
    "hipoglucemia",
    "caidas",
    "inseguridad_conduccion"
  ],
  "medical_record_family_history": [
    "mental_illnesses",
    "diabetes",
    "cardiovascular_illnesses",
    "kidney_problems",
    "reumatism",
    "digestive_problems",
    "asma",
    "cancer",
    "tuberculosis"
  ],
  "medical_record_genitourinario_exam": [
    "women_alteraciones_mamarias",
    "women_alteraciones_ginecologicas",
    "women_fum",
    "women_dolores_menstruales",
    "women_flujos_alterados",
    "women_anticonceptivos",
    "women_parto_normal",
    "women_abortos",
    "women_cesarea",
    "men_alteraciones_mamarias",
    "men_alteraciones_testiculares"
  ],
  "medical_record_habits": [
    "smoke",
    "alcoholic_drinks",
    "drugs",
    "sleep_alteration",
    "daily_diet",
    "physic_activity"
  ],
  "medical_record_immunizations": [
    "sars_cov_2",
    "fha",
    "dengue",
    "triple_adultos_tetanos",
    "hepatitis_a",
    "hepatitis_b"
  ],
  "medical_record_laboral_contacts": [
    "dusty_environment",
    "noisy_environment",
    "animal_products",
    "chemicals_products",
    "ionizing_radiation",
    "other_contamination"
  ],
  "medical_record_laboral_exam": [
    "physical",
    "chemical",
    "biological",
    "ergonomic",
    "others"
  ],
  "medical_record_neuro_clinical_exam": [
    "desorientado",
    "motilidad_alterada",
    "sensibilidad_alterada",
    "reflejos_alterados",
    "apraxia",
    "ataxia"
  ],
  "medical_record_oftalmologico_exam": [
    "eyes_alterations",
    "discromatopsia"
  ],
  "medical_record_orl_exam": [
    "faringe_pathology",
    "amigdalas_pathology",
    "voice_alterations",
    "rinitis",
    "audition_disorders",
    "adenopatias"
  ],
  "medical_record_osteoarticular_exam": [
    "column_movilidad_alterada",
    "column_puntos_dolorosos",
    "column_escoliosis",
    "column_cifosis",
    "column_lordosis",
    "dolor_articular",
    "limitacion_movimientos",
    "tono_trofismo",
    "amputaciones",
    "movilidad_hombro_alterado",
    "movilidad_codo_alterado",
    "movilidad_muñeca_alterado",
    "movilidad_mano_alterado",
    "movilidad_rodilla_alterado",
    "movilidad_pie_alterado"
  ],
  "medical_record_personal_history": [
    "internations",
    "covid",
    "fha",
    "dengue"
  ],
  "medical_record_previous_problems": [
    "head_pain",
    "seizures",
    "dizziness_or_fainting",
    "memory_loss",
    "eyes_problems",
    "ear_problems",
    "mouth_problems",
    "skin_diseases",
    "allergies",
    "sinusitis",
    "asma",
    "long_cough",
    "tuberculosis",
    "chest_pain",
    "insufficient_air",
    "palpitations",
    "high_or_low_pressure",
    "digestive_problems",
    "hepatitis",
    "hernias",
    "hemorroides",
    "difficulty_pee",
    "amputations",
    "bone_breaks",
    "neck_pain",
    "back_or_waist_pain",
    "shoulders_elbows_wrists_pain",
    "hips_knees_ankles_pain",
    "plane_feet",
    "varices",
    "diabetes",
    "fiebre_reumatica",
    "chagas",
    "sexual_transmition_diseases",
    "cancer",
    "medication_actually"
  ],
  "medical_record_psychiatric_clinical_exam": [
    "alteraciones_conducta",
    "nerviosismo_excesivo",
    "depresion_psicomotriz",
    "timidez_excesiva"
  ],
  "medical_record_respiratorio_exam": [
    "deformaciones_toracicas",
    "rales",
    "roncus",
    "murmullo_vesicular",
    "adenopatias",
    "proceso_agudo"
  ],
  "medical_record_skin_exam": [
    "skin_alteration",
    "piercing",
    "tattoo",
    "cicatrices"
  ],
  "medical_record_surgerys": [
    "apendice",
    "amigdala",
    "hernia",
    "varices",
    "vesicula",
    "columna",
    "testiculos"
  ]
};

export const toMedicalBoolean = (value: unknown): boolean | undefined => {
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  if (value === false || value === 0 || value === "0" || value === "false") return false;
  return undefined;
};

export function normalizeMedicalRecordDefaults(
  record: MedicalRecord,
  includeAbsentSections = false,
): MedicalRecord {
  const result = {...record};
  for (const [key, fields] of Object.entries(DEFAULT_NO_FIELDS)) {
    const sectionKey = key as keyof MedicalRecord;
    const original = record[sectionKey];
    if (!original && !includeAbsentSections) continue;
    const section: Record<string, unknown> = {...(original as unknown as Record<string, unknown> ?? {})};
    for (const field of fields) {
      const value = section[field];
      const normalized = toMedicalBoolean(value);
      // Do not turn an unrecognized non-empty answer into a negative clinical answer.
      if (normalized !== undefined) section[field] = normalized;
      else if (value == null || value === "") section[field] = false;
    }
    (result as unknown as Record<string, unknown>)[key] = section;
  }
  return result;
}
