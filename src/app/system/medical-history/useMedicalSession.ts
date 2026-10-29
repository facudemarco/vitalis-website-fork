import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { medicalLogoutKey, medicalLogoutEvent } from "@/lib/medicalDrafts";

export function useMedicalSession(patientId: string) {
  const { refreshUser } = useAuth();
  const refresh = useRef(refreshUser);
  refresh.current = refreshUser;
  const owner = useRef<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const deadline = useRef<number | null>(null);
  const [ready, setReady] = useState(false),
    [expired, setExpired] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const accept = useCallback(
    (data: { user_id: string; expires_at: number }) => {
      if (!data.user_id || !Number.isFinite(data.expires_at))
        throw new Error("Respuesta de sesión inválida.");
      if (owner.current && owner.current !== data.user_id)
        throw new Error(
          "Ingresá con la misma cuenta con la que abriste esta ficha.",
        );
      owner.current = data.user_id;
      deadline.current = data.expires_at * 1000;
      setUserId(data.user_id);
      setExpiresAt(deadline.current);
      setNow(Date.now());
      setReady(true);
      setExpired(false);
      setError(null);
      setGeneration((value) => value + 1);
    },
    [],
  );
  const begin = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const body = new URLSearchParams();
      if (owner.current) body.set("expected_user_id", owner.current);
      const response = await apiClient.post(
        `/medical-session/${encodeURIComponent(patientId)}`,
        body,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );
      accept(response.data);
    } catch (failure: any) {
      if (failure.response?.status === 401) setExpired(true);
      setError(
        failure.response?.status === 401
          ? "Iniciá sesión para continuar con esta ficha."
          : "No se pudo abrir la sesión de esta ficha. Reintentá.",
      );
    } finally {
      setBusy(false);
    }
  }, [patientId, accept]);
  useEffect(() => {
    void begin();
  }, [begin]);
  useEffect(() => {
    const invalid = () => setExpired(true);
    const logout = (event: Event) => {
      if (
        (event instanceof StorageEvent &&
          owner.current &&
          event.key === medicalLogoutKey(owner.current)) ||
        (event instanceof CustomEvent && event.detail === owner.current)
      )
        setExpired(true);
    };
    const interval = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (deadline.current && time >= deadline.current) setExpired(true);
    }, 30000);
    window.addEventListener("medical-session-expired", invalid);
    window.addEventListener("storage", logout);
    window.addEventListener(medicalLogoutEvent, logout);
    return () => {
      clearInterval(interval);
      window.removeEventListener("medical-session-expired", invalid);
      window.removeEventListener("storage", logout);
      window.removeEventListener(medicalLogoutEvent, logout);
    };
  }, []);
  useEffect(() => {
    if (!expiresAt) return;
    const timeout = setTimeout(
      () => setExpired(true),
      Math.max(0, expiresAt - Date.now()),
    );
    return () => clearTimeout(timeout);
  }, [expiresAt]);
  const authenticate = async (email: string, password: string) => {
    setBusy(true);
    setError(null);
    try {
      const body = new URLSearchParams({ email, password });
      if (owner.current) body.set("expected_user_id", owner.current);
      const response = await apiClient.post(
        `/medical-session/${encodeURIComponent(patientId)}/reauthenticate`,
        body,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );
      accept(response.data);
      await refresh.current();
      return true;
    } catch (failure: any) {
      setError(
        typeof failure.response?.data?.detail === "string"
          ? failure.response.data.detail
          : "No se pudo iniciar sesión. Reintentá sin cerrar la ficha.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  };
  const ensureCurrent = async () => {
    const response = await apiClient.get("/verify-token", {
      withCredentials: true,
    });
    const payload = response.data?.payload;
    if (
      expired ||
      response.data?.valid !== true ||
      payload?.id !== owner.current ||
      !deadline.current ||
      Date.now() >= deadline.current
    ) {
      setExpired(true);
      throw { response: { status: 401 } };
    }
  };
  return {
    userId,
    expiresAt,
    ready,
    expired,
    busy,
    error,
    begin,
    authenticate,
    ensureCurrent,
    generation,
    minutesLeft: expiresAt
      ? Math.max(0, Math.ceil((expiresAt - now) / 60000))
      : null,
  };
}
