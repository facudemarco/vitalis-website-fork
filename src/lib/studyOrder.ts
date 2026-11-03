import type {Studies} from "@/types";

export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
}

const priorityGroups = [
  ["laboratorio", "analisis clinico", "analisis clinicos", "analisis clinico de laboratorio"],
  ["radiografia", "radiografias"],
  ["electrocardiograma", "electrocardiogramas", "ecg"],
  ["electroencefalograma", "electroencefalogramas", "eeg"],
  ["audiometria", "audiometrias"],
  ["psicotecnico", "psicotecnicos"],
];

export function studyPriority(name: string) {
  const normalized = normalizeSearch(name).replace(/[-_]+/g, " ");
  const index = priorityGroups.findIndex((aliases) => aliases.includes(normalized));
  return index < 0 ? priorityGroups.length : index;
}

export function orderPatientStudies(studies: Studies[]): Studies[] {
  const chronological = studies.map((study) => {
    const timestamp = Date.parse(study.created_at ?? "");
    return {study, timestamp: Number.isFinite(timestamp) ? timestamp : Infinity};
  }).sort((a, b) => a.timestamp - b.timestamp);
  const groups = new Map<string, {priority: number; studies: Studies[]}>();
  for (const {study} of chronological) {
    const priority = studyPriority(study.study_type);
    const key = priority < priorityGroups.length
      ? `priority:${priority}`
      : `type:${normalizeSearch(study.study_type)}`;
    const group = groups.get(key);
    if (group) group.studies.push(study);
    else groups.set(key, {priority, studies: [study]});
  }
  return [...groups.values()].sort((a, b) => a.priority - b.priority).flatMap((group) => group.studies);
}
