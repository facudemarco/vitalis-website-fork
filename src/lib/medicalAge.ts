export function parseMedicalAge(value: unknown): string | null {
  if (value == null || typeof value === "string" && !value.trim()) return null;
  const match = typeof value === "string"
    ? /^([1-9][0-9]?|1[0-4][0-9]|150)(?:\s*años?)?$/i.exec(value.trim())
    : null;
  if (!match) throw new Error("Ingresá una edad entre 1 y 150, por ejemplo: 28 años.");
  // Keep VARCHAR(3) compatible: years are the fixed unit, not part of storage.
  return match[1];
}

export function formatMedicalAge(value: unknown): string {
  try {
    const age = parseMedicalAge(value);
    return age ? `${age} ${age === "1" ? "año" : "años"}` : "";
  } catch {
    return value == null ? "" : String(value);
  }
}
