export const CLINICAL_MEASUREMENTS = {
  talla: {label: "Talla", unit: "cm"},
  peso: {label: "Peso", unit: "kg"},
  saturacion: {label: "Saturación", unit: "%"},
  imc: {label: "IMC", unit: ""},
  ta_min: {label: "TA mínima", unit: "mmHg"},
  ta_max: {label: "TA máxima", unit: "mmHg"},
} as const;

export type ClinicalMeasurement = keyof typeof CLINICAL_MEASUREMENTS;

export function parseClinicalMeasurement(field: ClinicalMeasurement, value: unknown): number | null {
  if (value == null || typeof value === "string" && !value.trim()) return null;
  const unit = CLINICAL_MEASUREMENTS[field].unit;
  const input = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  const match = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*${unit ? `(?:${unit})?` : ""}$`, "i").exec(input);
  const numeric = match ? Number(match[1].replace(",", ".")) : NaN;
  if (!Number.isFinite(numeric) || field === "imc" && (match?.[1].split(/[.,]/)[1]?.length ?? 0) > 2) {
    throw new Error(`${CLINICAL_MEASUREMENTS[field].label}: ingresá un número${field === "imc" ? " entero o con hasta dos decimales" : ` en ${unit}`}.`);
  }
  return numeric;
}

export function formatClinicalMeasurement(field: ClinicalMeasurement, value: unknown): string {
  if (value == null || value === "") return "";
  try {
    const numeric = parseClinicalMeasurement(field, value);
    return numeric == null ? "" : `${numeric}${CLINICAL_MEASUREMENTS[field].unit ? ` ${CLINICAL_MEASUREMENTS[field].unit}` : ""}`;
  } catch {
    // Preserve a legacy answer visibly instead of silently discarding it.
    return String(value);
  }
}
