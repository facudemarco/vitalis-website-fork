import type { MedicalRecord } from "@/types";

export type DraftFile =
  "photo" | "evaluator" | "laboral" | "patient" | "responsable";
export interface MedicalDraftSnapshot {
  record: MedicalRecord;
  evaluatorDate: string;
  laboralDate: string;
  files: Record<DraftFile, Blob | null>;
}
export interface MedicalDraft {
  snapshot: MedicalDraftSnapshot;
  revision: string;
  updatedAt: number;
}
interface StoredDraft {
  id: string;
  userId: string;
  patientId: string;
  revision: string;
  updatedAt: number;
  expiresAt: number;
  iv: Uint8Array<ArrayBuffer>;
  encrypted: ArrayBuffer;
}
const DATABASE = "vitalis-protected-medical-drafts";
const TTL = 24 * 60 * 60 * 1000;
const fileNames: DraftFile[] = [
  "photo",
  "evaluator",
  "laboral",
  "patient",
  "responsable",
];
const draftId = (user: string, patient: string) =>
  JSON.stringify([user, patient]);
const aad = (user: string, patient: string) =>
  new TextEncoder().encode(`v1:${draftId(user, patient)}`);
export const medicalLogoutKey = (userId: string) =>
  `vitalis-medical-logout:${userId}`;
export function medicalLogoutEpoch(userId: string): string {
  try {
    return localStorage.getItem(medicalLogoutKey(userId)) || "";
  } catch {
    return "";
  }
}
export const medicalLogoutEvent = "medical-drafts-logout";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB || !globalThis.crypto?.subtle)
      return reject(new Error("El navegador no permite proteger el borrador."));
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("keys", { keyPath: "userId" });
      request.result
        .createObjectStore("drafts", { keyPath: "id" })
        .createIndex("userId", "userId");
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(
        new Error("Cerrá otras pestañas antiguas para habilitar el borrador."),
      );
    request.onsuccess = () => resolve(request.result);
  });
}
const result = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
const complete = (transaction: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error || new Error("No se pudo guardar el borrador."));
  });

async function keyFor(
  db: IDBDatabase,
  userId: string,
  create: boolean,
): Promise<{ key: CryptoKey; generation: string } | undefined> {
  const existing = await result(
    db.transaction("keys").objectStore("keys").get(userId),
  );
  if (existing?.key || !create) return existing;
  const generated = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  // A transaction selects one key even if two tabs create their first draft together.
  const transaction = db.transaction("keys", "readwrite");
  const done = complete(transaction);
  const store = transaction.objectStore("keys");
  const request = store.get(userId);
  let selected = { userId, key: generated, generation: crypto.randomUUID() };
  request.onsuccess = () => {
    if (request.result?.key) selected = request.result;
    else store.put(selected);
  };
  await done;
  return selected;
}

async function encode(snapshot: MedicalDraftSnapshot) {
  const files: Record<string, unknown> = {};
  for (const name of fileNames) {
    const blob = snapshot.files[name];
    if (!blob) {
      files[name] = null;
      continue;
    }
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
    files[name] = {
      data,
      type: blob.type,
      name: blob instanceof File ? blob.name : `${name}.png`,
    };
  }
  return JSON.stringify({ ...snapshot, files, version: 1 });
}
function decode(raw: string): MedicalDraftSnapshot {
  const parsed = JSON.parse(raw);
  if (
    parsed.version !== 1 ||
    !parsed.record ||
    typeof parsed.record !== "object"
  )
    throw new Error("El borrador no es compatible.");
  const files = {} as MedicalDraftSnapshot["files"];
  for (const name of fileNames) {
    const item = parsed.files?.[name];
    if (!item) {
      files[name] = null;
      continue;
    }
    const bytes = Uint8Array.from(atob(item.data.split(",")[1]), (character) =>
      character.charCodeAt(0),
    );
    files[name] = new File([bytes], item.name, { type: item.type });
  }
  return {
    record: parsed.record,
    evaluatorDate: parsed.evaluatorDate || "",
    laboralDate: parsed.laboralDate || "",
    files,
  };
}

export async function readMedicalDraft(
  userId: string,
  patientId: string,
): Promise<MedicalDraft | null> {
  const db = await openDatabase();
  try {
    const stored: StoredDraft | undefined = await result(
      db
        .transaction("drafts")
        .objectStore("drafts")
        .get(draftId(userId, patientId)),
    );
    if (!stored) return null;
    if (stored.expiresAt <= Date.now()) {
      const tx = db.transaction("drafts", "readwrite"),
        done = complete(tx);
      tx.objectStore("drafts").delete(stored.id);
      await done;
      return null;
    }
    const key = await keyFor(db, userId, false);
    if (!key) throw new Error("No se pudo abrir el borrador protegido.");
    const plain = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: stored.iv,
        additionalData: aad(userId, patientId),
      },
      key.key,
      stored.encrypted,
    );
    return {
      snapshot: decode(new TextDecoder().decode(plain)),
      revision: stored.revision,
      updatedAt: stored.updatedAt,
    };
  } finally {
    db.close();
  }
}

export async function writeMedicalDraft(
  userId: string,
  patientId: string,
  snapshot: MedicalDraftSnapshot,
  expectedRevision: string | null,
  logoutEpoch: string,
): Promise<string> {
  if (medicalLogoutEpoch(userId) !== logoutEpoch)
    throw new Error("La sesión se cerró. Volvé a ingresar para continuar.");
  const db = await openDatabase();
  try {
    const key = await keyFor(db, userId, true);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData: aad(userId, patientId) },
      key!.key,
      new TextEncoder().encode(await encode(snapshot)),
    );
    if (medicalLogoutEpoch(userId) !== logoutEpoch)
      throw new Error("La sesión se cerró. Volvé a ingresar para continuar.");
    const updatedAt = Date.now(),
      revision = crypto.randomUUID();
    const entry: StoredDraft = {
      id: draftId(userId, patientId),
      userId,
      patientId,
      revision,
      updatedAt,
      expiresAt: updatedAt + TTL,
      iv,
      encrypted,
    };
    const tx = db.transaction(["drafts", "keys"], "readwrite"),
      done = complete(tx);
    const store = tx.objectStore("drafts"),
      keyRequest = tx.objectStore("keys").get(userId);
    let conflict = false,
      loggedOut = false;
    keyRequest.onsuccess = () => {
      if (
        !keyRequest.result ||
        keyRequest.result.generation !== key!.generation
      ) {
        loggedOut = true;
        tx.abort();
        return;
      }
      const request = store.get(entry.id);
      request.onsuccess = () => {
        const previous: StoredDraft | undefined = request.result;
        if (
          previous &&
          previous.expiresAt > Date.now() &&
          previous.revision !== expectedRevision
        ) {
          conflict = true;
          tx.abort();
        } else store.put(entry);
      };
    };
    try {
      await done;
    } catch (error) {
      if (conflict)
        throw new Error(
          "Otra pestaña cambió el borrador de esta ficha. No lo sobrescribimos; mantené esta ficha abierta y guardala.",
        );
      if (loggedOut)
        throw new Error("La sesión se cerró. Volvé a ingresar para continuar.");
      throw error;
    }
    return revision;
  } finally {
    db.close();
  }
}

export async function deleteMedicalDraft(
  userId: string,
  patientId: string,
  revision: string | null,
) {
  const db = await openDatabase();
  try {
    const tx = db.transaction("drafts", "readwrite"),
      done = complete(tx);
    const store = tx.objectStore("drafts"),
      request = store.get(draftId(userId, patientId));
    let removed = false;
    request.onsuccess = () => {
      if (!request.result || request.result.revision === revision) {
        store.delete(draftId(userId, patientId));
        removed = true;
      }
    };
    await done;
    return removed;
  } finally {
    db.close();
  }
}

export async function clearUserMedicalDrafts(userId: string) {
  try {
    localStorage.setItem(medicalLogoutKey(userId), crypto.randomUUID());
  } catch {
    /* IndexedDB cleanup still runs. */
  }
  window.dispatchEvent(new CustomEvent(medicalLogoutEvent, { detail: userId }));
  const db = await openDatabase();
  try {
    const tx = db.transaction(["drafts", "keys"], "readwrite"),
      done = complete(tx);
    const cursor = tx
      .objectStore("drafts")
      .index("userId")
      .openCursor(IDBKeyRange.only(userId));
    cursor.onsuccess = () => {
      if (cursor.result) {
        cursor.result.delete();
        cursor.result.continue();
      }
    };
    tx.objectStore("keys").delete(userId);
    await done;
  } finally {
    db.close();
  }
}
