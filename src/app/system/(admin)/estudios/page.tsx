"use client";
import Link from "next/link";
import {useEffect, useState} from "react";

import {StudiesCategory} from "@/types";

import {Estudies} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";

import Panel from "../../components/Panel";

export default function StudiesPanelPage() {
  const [studies, setStudies] = useState<StudiesCategory[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const studies = await dataService.getCategories();

        setStudies(studies);
      } catch (error) {
        console.error(error);
      }
    };

    void fetch();
  }, []);

  const deletedCategory = async (category_id: string) => {
    try {
      await dataService.deleteCategory(category_id);

      const newStudies = studies.filter((study) => study.id !== category_id);

      setStudies(newStudies);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Panel pageIcon={<Estudies />} pageTitle="Estudios">
      <div className="flex justify-end">
        <Link
          className="flex w-max items-center gap-2 rounded-xl border px-3 py-1"
          href="/system/estudios/add"
        >
          <p className="text-sm">Agregar estudio</p>
          <p className="text-xl font-bold">+</p>
        </Link>
      </div>
      {/* Tabla de Estudios - Desktop */}
      <div className="mt-6 hidden overflow-hidden rounded-lg sm:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-neutral-800 text-white">
              <th className="border-b border-neutral-700 px-6 py-4 text-left text-sm font-medium">
                Nombre del Estudio
              </th>
              <th className="border-b border-neutral-700 px-6 py-4 text-left text-sm font-medium">
                Imagen
              </th>
              <th className="border-b border-neutral-700 px-6 py-4 text-left text-sm font-medium">
                Informe obligatorio
              </th>
              <th className="w-16 border-b border-neutral-700" />
            </tr>
          </thead>
          <tbody>
            {studies.map((estudio) => (
              <tr
                key={estudio.id}
                className="hover:bg-neutral-750 border-b border-neutral-700 bg-neutral-800 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-white">{estudio.name}</td>
                <td className="px-6 py-4">
                  <img
                    alt={estudio.name}
                    className="h-12 w-12 rounded object-cover"
                    src={estudio.url_image}
                  />
                </td>
                <td className="px-6 py-4 text-sm text-white">
                  {estudio.requires_report ? "Sí" : "No"}
                </td>
                <td className="px-4 py-4">
                  <button
                    aria-label={`Eliminar ${estudio.name}`}
                    className="cursor-pointer rounded p-2 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-red-500"
                    onClick={() => {
                      if (estudio.id) {
                        void deletedCategory(estudio.id);
                      }
                    }}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lista de Estudios - Mobile */}
      <div className="mt-6 flex flex-col gap-4 sm:hidden">
        {studies.map((estudio) => (
          <div
            key={estudio.id}
            className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-800 p-4"
          >
            <div className="flex items-center gap-4">
              <img
                alt={estudio.name}
                className="h-12 w-12 rounded object-cover"
                src={estudio.url_image}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{estudio.name}</span>
                <span className="text-xs text-neutral-300">
                  Informe {estudio.requires_report ? "obligatorio" : "opcional"}
                </span>
              </div>
            </div>
            <button
              aria-label={`Eliminar ${estudio.name}`}
              className="cursor-pointer rounded p-2 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-red-500"
              onClick={() => {
                if (estudio.id) {
                  void deletedCategory(estudio.id);
                }
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
