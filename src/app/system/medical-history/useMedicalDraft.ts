import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteMedicalDraft,
  readMedicalDraft,
  writeMedicalDraft,
  medicalLogoutEpoch,
  medicalLogoutKey,
  medicalLogoutEvent,
  type MedicalDraft,
  type MedicalDraftSnapshot,
} from "@/lib/medicalDrafts";

export function useMedicalDraft(
  userId: string | null,
  patientId: string,
  enabled: boolean,
  authGeneration: number,
  getSnapshot: () => MedicalDraftSnapshot,
) {
  const snapshot = useRef(getSnapshot);
  snapshot.current = getSnapshot;
  const [checking, setChecking] = useState(true);
  const [candidate, setCandidate] = useState<MedicalDraft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dirtyRef = useRef(false),
    revision = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef<Promise<void> | null>(null);
  const flushRef = useRef<() => Promise<void>>(async () => {});
  const active = useRef(true),
    last = useRef("");
  const blobIds = useRef(new WeakMap<Blob, number>()),
    sequence = useRef(0);
  const logoutEpoch = useRef(""),
    locked = useRef(false);
  useEffect(() => {
    if (!userId) return;
    const wasLocked = locked.current;
    logoutEpoch.current = medicalLogoutEpoch(userId);
    locked.current = false;
    if (wasLocked) {
      revision.current = null;
      last.current = "";
      setSavedAt(null);
      setError(null);
      if (dirtyRef.current)
        timer.current = setTimeout(() => {
          void flushRef.current();
        }, 600);
    }
    const lock = () => {
      locked.current = true;
      if (timer.current) clearTimeout(timer.current);
      setError(
        "La sesión se cerró y se eliminó el borrador local. Los cambios siguen en esta pantalla; volvé a ingresar para guardarlos.",
      );
    };
    const storage = (event: StorageEvent) => {
      if (event.key === medicalLogoutKey(userId)) lock();
    };
    const local = (event: Event) => {
      if ((event as CustomEvent).detail === userId) lock();
    };
    window.addEventListener("storage", storage);
    window.addEventListener(medicalLogoutEvent, local);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener(medicalLogoutEvent, local);
    };
  }, [userId, authGeneration]);

  useEffect(() => {
    if (!enabled || !userId) return;
    let cancelled = false;
    setChecking(true);
    readMedicalDraft(userId, patientId)
      .then((draft) => {
        if (cancelled) return;
        revision.current = draft?.revision || null;
        setCandidate(draft);
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "No pudimos abrir el borrador protegido. Mantené esta ficha abierta hasta guardarla.",
          );
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, userId, patientId]);

  const flush = useCallback(async (): Promise<void> => {
    if (
      !enabled ||
      !userId ||
      checking ||
      candidate ||
      !dirtyRef.current ||
      locked.current
    )
      return;
    const current = snapshot.current();
    if (running.current) {
      await running.current;
      return flushRef.current();
    }
    const fileIds = Object.values(current.files).map((blob) => {
      if (!blob) return null;
      if (!blobIds.current.has(blob))
        blobIds.current.set(blob, ++sequence.current);
      return blobIds.current.get(blob);
    });
    const fingerprint = JSON.stringify([
      current.record,
      current.evaluatorDate,
      current.laboralDate,
      fileIds,
    ]);
    if (last.current === fingerprint) return;
    const task = (async () => {
      try {
        revision.current = await writeMedicalDraft(
          userId,
          patientId,
          current,
          revision.current,
          logoutEpoch.current,
        );
        last.current = fingerprint;
        if (active.current) {
          setSavedAt(Date.now());
          setError(null);
        }
      } catch (failure) {
        if (active.current)
          setError(
            failure instanceof Error && failure.message.includes("Otra pestaña")
              ? failure.message
              : "No pudimos guardar el borrador en este navegador. Mantené la ficha abierta y usá Guardar.",
          );
      }
    })();
    running.current = task;
    await task;
    running.current = null;
  }, [enabled, userId, patientId, checking, candidate]);
  flushRef.current = flush;

  const markChanged = useCallback(() => {
    dirtyRef.current = true;
    setDirty(true);
    queueMicrotask(() => {
      if (active.current) snapshot.current();
    });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void flushRef.current();
    }, 600);
  }, []);

  useEffect(() => {
    active.current = true;
    const unload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      void flushRef.current();
      event.preventDefault();
      event.returnValue = "";
    };
    const leaving = () => {
      void flushRef.current();
    };
    const link = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a[href]"))
        leaving();
    };
    window.addEventListener("beforeunload", unload);
    window.addEventListener("pagehide", leaving);
    window.addEventListener("popstate", leaving);
    document.addEventListener("click", link, true);
    return () => {
      active.current = false;
      if (timer.current) clearTimeout(timer.current);
      void flushRef.current();
      window.removeEventListener("beforeunload", unload);
      window.removeEventListener("pagehide", leaving);
      window.removeEventListener("popstate", leaving);
      document.removeEventListener("click", link, true);
    };
  }, []);

  const recover = () => {
    const stored = candidate?.snapshot;
    setCandidate(null);
    markChanged();
    return stored;
  };
  const discard = async () => {
    if (!userId) return;
    try {
      if (!(await deleteMedicalDraft(userId, patientId, revision.current))) {
        setCandidate(await readMedicalDraft(userId, patientId));
        setError(
          "El borrador cambió en otra pestaña. Revisá la versión más reciente.",
        );
        return;
      }
      revision.current = null;
      setCandidate(null);
      setSavedAt(null);
      setError(null);
    } catch {
      setError(
        "No se pudo descartar el borrador. Reintentá sin cerrar esta pantalla.",
      );
    }
  };
  const markSaved = async () => {
    dirtyRef.current = false;
    if (timer.current) clearTimeout(timer.current);
    await running.current;
    if (userId) {
      try {
        await deleteMedicalDraft(userId, patientId, revision.current);
      } catch {
        setError(
          "La ficha se guardó, pero no pudimos limpiar el borrador local.",
        );
      }
    }
    revision.current = null;
    setDirty(false);
    setSavedAt(null);
  };
  return {
    checking: enabled && checking,
    candidate,
    dirty,
    savedAt,
    error,
    markChanged,
    flush,
    recover,
    discard,
    markSaved,
  };
}
