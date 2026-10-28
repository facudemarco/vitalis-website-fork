const medicalRecordFieldLabels: Record<string, string> = {
  sons: "Cantidad de hijos",
  education_level: "Estudios",
  sector: "Sector",
  phone: "Teléfono",
  age: "Edad",
  talla: "Talla (cm)",
  peso: "Peso (kg)",
  saturacion: "Saturación (%)",
  imc: "IMC",
  ta_min: "TA mínima (mmHg)",
  ta_max: "TA máxima (mmHg)",
};

const getMedicalRecordFieldLabel = (field: unknown) => {
  const key = String(field ?? "").split(".").at(-1) ?? "";
  const humanizedKey = key.replaceAll("_", " ").replace(/\\b\\w/g, (letter) => letter.toUpperCase());
  return medicalRecordFieldLabels[key] ?? (humanizedKey || "dato ingresado");
};

const getMedicalRecordValidationMessage = (item: {
  loc?: Array<string | number>;
  type?: string;
}) => {
  const path = item.loc?.filter((part) => !["body", "data"].includes(String(part))) ?? [];
  const label = getMedicalRecordFieldLabel(path.at(-1));
  const field = String(path.at(-1) ?? "");

  if (field === "age") return "Edad: ingresá una edad entre 1 y 150, por ejemplo: 28 años.";

  if (item.type === "int_parsing" || item.type === "int_from_float") {
    return field === "sons"
      ? "Ingresá la cantidad de hijos como un número entero (por ejemplo, 2)."
      : `El campo “${label}” debe ser un número entero.`;
  }
  if (item.type === "missing") return `Completá el campo “${label}”.`;
  if (item.type === "float_parsing" || item.type === "float_type") {
    return `Ingresá un número válido en el campo “${label}”.`;
  }
  if (item.type === "bool_parsing") {
    return `Revisá la opción seleccionada en “${label}”.`;
  }
  return `Revisá el valor ingresado en “${label}”.`;
};

export const getMedicalRecordErrorMessage = (error: unknown) => {
  const status = (error as {response?: {status?: number}})?.response?.status;
  const detail = (error as {response?: {data?: {detail?: unknown}}})?.response?.data?.detail;

  if (status === 401) return "Tu sesión venció. Volvé a iniciar sesión en otra pestaña y reintentá guardar aquí. Los datos ingresados se conservaron.";
  if (status === 403) return "Tu usuario no tiene permiso para guardar esta ficha. Contactá a administración. Los datos ingresados se conservaron.";
  if (status && status >= 500) {
    const code = detail && typeof detail === "object" ? (detail as {code?: string}).code : undefined;
    return code === "medical_record_schema_outdated"
      ? "La base de datos necesita una actualización para guardar la ficha. Contactá a administración. Los datos ingresados se conservaron; no vuelvas a completarlos."
      : "El servidor no pudo guardar la ficha. Reintentá y, si continúa, contactá a administración. Los datos ingresados se conservaron.";
  }
  if (!status) return "No se pudo conectar con el servidor. Revisá la conexión y reintentá. Los datos ingresados se conservaron.";

  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const fields = (detail as {fields?: Array<{label?: string; field?: string; message?: string}>}).fields;
    if (Array.isArray(fields) && fields.length > 0) {
      const labels = fields.map((item) => item.message || item.label || getMedicalRecordFieldLabel(item.field));
      return `Revisá estos campos: ${labels.join(", ")}. Los datos ingresados se conservaron.`;
    }
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .filter((item): item is {loc?: Array<string | number>; type?: string} => Boolean(item))
      .map(getMedicalRecordValidationMessage);

    if (messages.length > 0) {
      return `No se pudo guardar la ficha: ${messages.join(" ")} Los datos ingresados se conservaron.`;
    }
  }

  return "No se pudo guardar la ficha médica. Revisá los campos e intentá nuevamente. Los datos ingresados se conservaron.";
};
