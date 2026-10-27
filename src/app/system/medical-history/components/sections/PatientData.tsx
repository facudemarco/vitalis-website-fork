import React, {useEffect, useRef, useState} from "react";
import {useForm} from "react-hook-form";

import {MedicalRecordData} from "@/types";

import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordData | null;
  defaultCompanyName?: string | null;
  registerSection: (handler: SectionHandler<MedicalRecordData>) => () => void;
  currentImageUrl?: string | null;
  onImageChange?: (file: File | null) => void;
}

export const PatientDataSection = React.memo(
  ({defaultValues, defaultCompanyName, registerSection, currentImageUrl, onImageChange}: Props) => {
    const form = useForm<MedicalRecordData>({
      defaultValues: {...defaultValues, company_name: defaultValues?.company_name || defaultCompanyName || "Particular"} as MedicalRecordData,
      mode: "onBlur",
    });

    const {getValues, trigger, register} = form;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null);

    useEffect(() => {
      const unregister = registerSection({
        getValues: () => getValues(),
        validate: async () => trigger(),
        getErrors: () => [
          ...(form.getFieldState("sons").error ? ["Cantidad de hijos: ingresá un número entero igual o mayor a cero"] : []),
        ],
      });

      return unregister;
    }, [registerSection, getValues, trigger]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;

      if (file) {
        const objectUrl = URL.createObjectURL(file);

        setPreviewUrl(objectUrl);
      } else {
        setPreviewUrl(null);
      }

      onImageChange?.(file);
    };

    return (
      <section className="flex flex-col items-center gap-5 px-5">
        <div className="mt-7 flex w-full flex-col justify-between gap-2 text-xl font-bold md:flex-row md:text-2xl">
          <p>Datos del paciente *</p>
        </div>
        <div className="flex w-full flex-col gap-5 md:flex-row md:gap-4">
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input className="w-full border border-gray-500 p-2" placeholder="Empresa (o Particular)" type="text" {...register("company_name")} />
            <input
              className="w-full border border-gray-500 p-2"
              placeholder="Nombre completo"
              type="text"
              {...register("complete_name")}
            />
            <input
              className="w-full border border-gray-500 p-2"
              placeholder="Fecha de nacimiento. Formato: 00/00/0000"
              type="text"
              {...register("date_of_birthday")}
            />
            <input
              className="w-full border border-gray-500 p-2"
              placeholder="Estado civil"
              type="text"
              {...register("civil_status")}
            />
            <input
              className="w-full border border-gray-500 p-2"
              placeholder="DNI"
              type="text"
              {...register("dni")}
            />
            <input
              className="w-full border border-gray-500 p-2"
              placeholder="Nacionalidad"
              type="text"
              {...register("nacionality")}
            />
            <input
              className="w-full border border-gray-500 p-2"
              placeholder="Teléfono"
              type="text"
              {...register("phone")}
            />
            <input
              className="w-full border border-gray-500 p-2"
              placeholder="Dirección"
              type="text"
              {...register("address")}
            />
            <input
              className="w-full border border-gray-500 p-2"
              placeholder="E-mail"
              type="email"
              {...register("email")}
            />
            <input
              className="w-full border border-gray-500 p-2"
              placeholder="Hijos"
              type="number"
              min="0"
              step="1"
              {...register("sons", {
                setValueAs: (value) => (value === "" ? null : Number(value)),
                validate: (value) =>
                  value == null ||
                  (Number.isInteger(value) && value >= 0) ||
                  "Ingresá un número entero igual o mayor a cero.",
              })}
            />
          </div>
          <div className="flex w-[150px] shrink-0 flex-col items-center gap-2">
            <div
              className="flex h-[180px] w-[150px] cursor-pointer items-center justify-center overflow-hidden border border-gray-400 bg-gray-100"
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
            >
              {previewUrl ? (
                <img
                  alt="Foto del paciente"
                  className="h-full w-full object-cover"
                  src={previewUrl}
                />
              ) : (
                <span className="text-center text-xs text-gray-400">Click para subir foto</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              type="file"
              onChange={handleFileChange}
            />
            {previewUrl && (
              <button
                className="cursor-pointer text-xs text-red-500 underline"
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  onImageChange?.(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Quitar foto
              </button>
            )}
          </div>
        </div>
        <div className="mb-10 flex w-full flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-semibold" htmlFor="patient-education-level">
            Estudios
            <select id="patient-education-level" className="w-full border border-gray-500 bg-white p-2 font-normal" {...register("education_level", {setValueAs: (value) => value || null})}>
              <option value="">Sin especificar</option>
              <option value="Primarios">Primarios</option>
              <option value="Secundarios">Secundarios</option>
              <option value="Terciarios">Terciarios</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold" htmlFor="patient-sector">
            Sector
            <input id="patient-sector" className="w-full border border-gray-500 p-2 font-normal" placeholder="Sector de trabajo" maxLength={255} type="text" {...register("sector")} />
          </label>
        </div>
      </section>
    );
  },
);

PatientDataSection.displayName = "PatientDataSection";
