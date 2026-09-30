"use client";
import Link from "next/link";
import {useForm} from "react-hook-form";
import {useRouter} from "next/navigation";

import {StudiesCategory} from "@/types";

import {ArrowLeft, Estudies} from "@/components/ui/Icons";
import Panel from "@/app/system/components/Panel";
import {dataService} from "@/services/dataService";

export default function AddCategoryPage() {
  const router = useRouter();

  const {register, handleSubmit} = useForm<StudiesCategory>({
    defaultValues: {
      name: "",
      image: "",
      requires_report: true,
    },
  });

  const onSubmit = async (data: StudiesCategory) => {
    try {
      const fd = new FormData();

      fd.append("name", data.name);
      fd.append("requires_report", String(data.requires_report));
      fd.append("image", data.image[0]); // File real

      await dataService.createCategory(fd);
      router.push("/system/estudios");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Panel pageIcon={<Estudies />} pageTitle="Agregar estudio">
      <Link className="flex items-center gap-1 font-bold" href="/system/estudios">
        <ArrowLeft />
        Cancelar
      </Link>
      <form
        className="my-5 flex flex-col gap-2"
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
      >
        <label htmlFor="name">Nombre del estudio *</label>
        <input
          required
          className="rounded-lg border border-[#4A4A4A] bg-white px-5 py-1"
          id="name"
          placeholder="Ingresa el nombre del estudio"
          type="text"
          {...register("name")}
        />
        <label className="mt-3 flex cursor-pointer items-center gap-3" htmlFor="requires_report">
          <input
            className="h-4 w-4"
            id="requires_report"
            type="checkbox"
            {...register("requires_report")}
          />
          <span>Exigir un informe para confirmar este estudio</span>
        </label>
        <label htmlFor="url_image">Imagen del estudio *</label>
        <input
          required
          className="w-full rounded-lg border border-[#4A4A4A] bg-white px-5 py-1"
          id="url_image"
          type="file"
          {...register("image")}
        />
        <button
          className="bg-blue mt-10 cursor-pointer rounded-lg py-2 font-semibold text-white"
          type="submit"
        >
          Agregar
        </button>
      </form>
    </Panel>
  );
}
