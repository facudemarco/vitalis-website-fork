"use client";

import {useRef, useState, useEffect, useCallback} from "react";

type InputMode = "draw" | "upload";

type UploadStatus = "idle" | "saving" | "success" | "error";

interface SignatureCanvasProps {
  /** Ancho máximo del canvas en px (default 500) */
  width?: number;
  /** Alto del canvas en px (default 250) */
  height?: number;
  /** Color del trazo (default "#000") */
  strokeColor?: string;
  /** Grosor del trazo en px (default 2) */
  strokeWidth?: number;
  /** Callback que recibe el Blob PNG de la firma al guardar */
  onSave?: (blob: Blob) => void;
  onDraftChange?: (blob: Blob | null) => void;
  initialBlob?: Blob | null;
  /** Callback al subir la firma exitosamente a la API */
  onUploadSuccess?: (data: unknown) => void;
  /** Callback al fallar la subida de la firma */
  onUploadError?: (error: unknown) => void;
  /** Subir automáticamente a la API al guardar (default true) */
  uploadOnSave?: boolean;
}

export default function SignatureCanvas({
  width = 500,
  height = 250,
  strokeColor = "#000",
  strokeWidth = 2,
  onSave,
  onDraftChange,
  initialBlob,
  onUploadSuccess,
  onUploadError,
  uploadOnSave = true,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draftChange = useRef(onDraftChange); draftChange.current = onDraftChange;
  const lastEmitted = useRef<Blob | null | undefined>(undefined);
  const baseImage = useRef<HTMLImageElement | null>(null);
  const draftVersion = useRef(0);
  const emitDraft = useCallback(() => {
    const version = ++draftVersion.current;
    canvasRef.current?.toBlob(blob => { if (blob && version === draftVersion.current) { lastEmitted.current = blob; draftChange.current?.(blob); } }, "image/png");
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathsRef = useRef<{x: number; y: number}[][]>([]);
  const currentPathRef = useRef<{x: number; y: number}[]>([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("draw");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- Canvas setup & retina scaling ----------

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const containerWidth = container.clientWidth;
    const canvasWidth = Math.min(containerWidth, width);

    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    // Redibujar trazos existentes después de redimensionar
    redrawPaths(ctx);
  }, [width, height, strokeColor, strokeWidth]);

  useEffect(() => {
    setupCanvas();

    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver(() => {
      setupCanvas();
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [setupCanvas]);

  useEffect(() => {
    if (!initialBlob || initialBlob === lastEmitted.current) return;
    pathsRef.current = [];
    const url = URL.createObjectURL(initialBlob);
    const image = new Image();
    let cancelled = false;
    image.onload = () => {
      if (cancelled) return;
      baseImage.current = image;
      setupCanvas(); setIsEmpty(false);
    };
    image.src = url;
    return () => { cancelled = true; URL.revokeObjectURL(url); };
  }, [initialBlob, setupCanvas]);

  // ---------- Helpers ----------

  const redrawPaths = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    if (baseImage.current) ctx.drawImage(baseImage.current, 0, 0, canvas.width / dpr, canvas.height / dpr);
    for (const path of pathsRef.current) {
      if (path.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
  };

  const getCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent): {x: number; y: number} | null => {
      const canvas = canvasRef.current;

      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const scaleX = parseFloat(canvas.style.width) / rect.width;
      const scaleY = parseFloat(canvas.style.height) / rect.height;

      if ("touches" in e) {
        const touch = e.touches[0];

        if (!touch) return null;

        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  // ---------- Drawing handlers ----------

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const coords = getCoordinates(e);

      if (!coords) return;

      const ctx = canvasRef.current?.getContext("2d");

      if (!ctx) return;

      currentPathRef.current = [coords];
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
      setIsEmpty(false);
      if (status !== "idle") setStatus("idle");
    },
    [getCoordinates, status],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;

      const coords = getCoordinates(e);

      if (!coords) return;

      const ctx = canvasRef.current?.getContext("2d");

      if (!ctx) return;

      currentPathRef.current.push(coords);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    },
    [isDrawing, getCoordinates],
  );

  const stopDrawing = useCallback(() => {
    if (isDrawing && currentPathRef.current.length > 0) {
      pathsRef.current.push([...currentPathRef.current]);
      currentPathRef.current = [];
      emitDraft();
    }
    setIsDrawing(false);
  }, [isDrawing, emitDraft]);

  // ---------- Actions ----------

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!canvas || !ctx) return;

          const dpr = window.devicePixelRatio || 1;
          ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
          ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
          baseImage.current = img;
          pathsRef.current = [];
          emitDraft();
          setIsEmpty(false);
          setStatus("idle");
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [emitDraft],
  );

  const handleModeChange = useCallback(
    (mode: InputMode) => {
      setInputMode(mode);
      // Limpiar canvas y estado al cambiar de modo
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        }
      }
      pathsRef.current = [];
      baseImage.current = null; draftVersion.current++; lastEmitted.current = null; draftChange.current?.(null);
      setIsEmpty(true);
      setStatus("idle");
      setErrorMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [],
  );

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    pathsRef.current = [];
    currentPathRef.current = [];
    baseImage.current = null; draftVersion.current++; lastEmitted.current = null; draftChange.current?.(null);
    setIsEmpty(true);
    setStatus("idle");
    setErrorMessage("");
  }, []);

  const handleUndo = useCallback(() => {
    pathsRef.current.pop();
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    redrawPaths(ctx);

    if (pathsRef.current.length === 0 && !baseImage.current) {
      setIsEmpty(true); lastEmitted.current = null; draftChange.current?.(null);
    } else emitDraft();
  }, [strokeColor, strokeWidth, emitDraft]);

  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;

    if (!canvas || isEmpty) return;

    setStatus("saving");
    setErrorMessage("");

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png");
    });

    if (!blob) {
      setStatus("error");
      setErrorMessage("No se pudo generar la imagen de la firma.");

      return;
    }

    // Callback con el blob crudo
    onSave?.(blob);

    if (!uploadOnSave) {
      setStatus("success");

      return;
    }

    try {
      //   const data = await uploadSignature(blob);
      const link = document.createElement("a");

      link.download = "canvas.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      console.log(typeof blob);
      setStatus("success");
      //   onUploadSuccess?.(data);
    } catch (err: unknown) {
      setStatus("error");
      const message =
        err instanceof Error ? err.message : "Error al subir la firma. Intente nuevamente.";

      setErrorMessage(message);
      onUploadError?.(err);
    }
  }, [isEmpty, onSave, uploadOnSave, onUploadSuccess, onUploadError]);

  // ---------- Render ----------

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col items-center gap-4"
      style={{maxWidth: width}}
    >
      {/* Tabs de modo */}
      <div className="flex gap-4 self-start text-sm">
        <button
          className={`cursor-pointer pb-0.5 transition-all ${
            inputMode === "draw"
              ? "border-b-2 border-gray-800 font-semibold text-gray-800"
              : "text-gray-400 hover:text-gray-600"
          }`}
          type="button"
          onClick={() => handleModeChange("draw")}
        >
          Dibujar
        </button>
        <button
          className={`cursor-pointer pb-0.5 transition-all ${
            inputMode === "upload"
              ? "border-b-2 border-gray-800 font-semibold text-gray-800"
              : "text-gray-400 hover:text-gray-600"
          }`}
          type="button"
          onClick={() => handleModeChange("upload")}
        >
          Subir imagen
        </button>
      </div>

      {inputMode === "upload" ? (
        <div className="flex w-full flex-col gap-2">
          <p className="text-sm text-gray-500">Seleccioná tu firma digital (.png, .jpg)</p>
          <input
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/*"
            className="w-full rounded-lg border border-dashed border-gray-300 bg-white p-2 text-sm"
            type="file"
            onChange={handleFileUpload}
          />
          {/* Canvas oculto para procesar la imagen — sigue generando el blob */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">Dibuje su firma en el recuadro</p>
          <canvas
        ref={canvasRef}
            aria-label="Área de firma digital"
            className="w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed border-gray-300 bg-white"
            role="img"
            onMouseDown={startDrawing}
            onMouseLeave={stopDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            onTouchStart={startDrawing}
          />
        </>
      )}

      {/* Status feedback */}
      {status === "success" && (
        <p className="text-sm font-medium text-green-600">Firma guardada correctamente.</p>
      )}
      {status === "error" && <p className="text-sm font-medium text-red-600">{errorMessage}</p>}

      <div className="flex gap-3">
        <button
          className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isEmpty || status === "saving"}
          type="button"
          onClick={handleUndo}
        >
          Deshacer
        </button>
        <button
          className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={status === "saving"}
          type="button"
          onClick={handleClear}
        >
          Limpiar
        </button>
        <button
          className="bg-blue cursor-pointer rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isEmpty || status === "saving"}
          type="button"
          onClick={handleSave}
        >
          {status === "saving" ? "Guardando..." : "Guardar firma"}
        </button>
      </div>
    </div>
  );
}

