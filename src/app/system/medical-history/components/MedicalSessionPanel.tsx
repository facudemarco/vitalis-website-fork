import { useState } from "react";
import type { useMedicalSession } from "../useMedicalSession";

export function MedicalSessionPanel({
  session,
}: {
  session: ReturnType<typeof useMedicalSession>;
}) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  if (
    !session.expired &&
    session.ready &&
    !session.error &&
    (session.minutesLeft ?? 360) > 15
  )
    return null;
  return (
    <section
      data-medical-auth
      className="my-4 rounded-lg border border-orange-300 bg-orange-50 p-4"
      aria-label="Sesión de la ficha"
    >
      <p className="font-semibold">
        {session.expired
          ? "La sesión venció. La ficha sigue abierta y conserva tus cambios."
          : session.ready
            ? `Queda${session.minutesLeft === 1 ? "" : "n"} ${session.minutesLeft} minuto${session.minutesLeft === 1 ? "" : "s"} de sesión para esta ficha.`
            : "Abriendo sesión de trabajo para esta ficha…"}
      </p>
      {session.error && <p role="alert">{session.error}</p>}
      {session.expired ? (
        <form
          className="mt-3 flex flex-wrap items-end gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            if (await session.authenticate(email, password)) setPassword("");
          }}
        >
          <label className="text-sm">
            Correo de tu cuenta
            <input
              required
              autoComplete="username"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="block border p-2"
            />
          </label>
          <label className="text-sm">
            Contraseña
            <input
              required
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="block border p-2"
            />
          </label>
          <button
            disabled={session.busy}
            className="rounded bg-white px-4 py-2 font-semibold"
            type="submit"
          >
            Volver a ingresar sin salir de la ficha
          </button>
          <p className="w-full text-sm">
            Usá la misma cuenta con la que abriste la ficha. Después, presioná
            Guardar.
          </p>
        </form>
      ) : session.error ? (
        <button
          type="button"
          disabled={session.busy}
          onClick={() => void session.begin()}
        >
          Reintentar sesión
        </button>
      ) : null}
    </section>
  );
}
