"use client";
import Link from "next/link";
import {useEffect, useState} from "react";

import {StudiesCategory} from "@/types";

import {Estudies} from "@/components/ui/Icons";
import {dataService} from "@/services/dataService";

import Panel from "../../components/Panel";

export default function StudiesPanelPage() {
  const [studies, setStudies] = useState<StudiesCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<StudiesCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editRequiresReport, setEditRequiresReport] = useState(true);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [editError, setEditError] = useState("");

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

  const startEditing = (category: StudiesCategory) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditRequiresReport(category.requires_report !== false);
    setEditImage(null);
    setEditError("");
  };

  const closeEditor = () => {
    setEditingCategory(null);
    setEditImage(null);
    setEditError("");
  };

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingCategory?.id) return;
    if (!editName.trim()) {
      setEditError("Ingresá un nombre para la categoría.");
      return;
    }

    setSavingCategory(true);
    setEditError("");
    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      formData.append("requires_report", String(editRequiresReport));
      if (editImage) formData.append("image", editImage);

      await dataService.updateCategory(editingCategory.id, formData);
      setStudies(await dataService.getCategories());
      closeEditor();
      alert("Categoría actualizada correctamente.");
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
      setEditError("No se pudo actualizar la categoría. Intentá nuevamente.");
    } finally {
      setSavingCategory(false);
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
              <th className="w-40 border-b border-neutral-700" />
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
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="cursor-pointer rounded-lg border border-neutral-600 px-3 py-2 text-sm text-white transition-colors hover:bg-neutral-700"
                      type="button"
                      onClick={() => startEditing(estudio)}
                    >
                      Modificar
                    </button>
                    <button
                      aria-label={`Eliminar ${estudio.name}`}
                      className="cursor-pointer rounded p-2 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-red-500"
                      type="button"
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
            <div className="flex flex-col gap-2">
              <button
                className="cursor-pointer rounded-lg border border-neutral-600 px-3 py-2 text-xs text-white transition-colors hover:bg-neutral-700"
                type="button"
                onClick={() => startEditing(estudio)}
              >
                Modificar
              </button>
              <button
                aria-label={`Eliminar ${estudio.name}`}
                className="cursor-pointer rounded p-2 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-red-500"
                type="button"
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
          </div>
        ))}
      </div>

      {editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <section
            aria-labelledby="edit-study-category-title"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 text-gray-900 shadow-2xl"
            role="dialog"
          >
            <h2 className="mb-5 text-xl font-bold" id="edit-study-category-title">
              Modificar categoría de estudio
            </h2>
            <form className="flex flex-col gap-4" onSubmit={(event) => void saveCategory(event)}>
              <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="edit-category-name">
                Nombre del estudio
                <input
                  autoFocus
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                  id="edit-category-name"
                  required
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-sm" htmlFor="edit-category-requires-report">
                <input
                  checked={editRequiresReport}
                  className="h-4 w-4"
                  id="edit-category-requires-report"
                  type="checkbox"
                  onChange={(event) => setEditRequiresReport(event.target.checked)}
                />
                Exigir informe para confirmar este estudio
              </label>

              {editingCategory.url_image && (
                <div className="flex items-center gap-3">
                  <img
                    alt={`Imagen actual de ${editingCategory.name}`}
                    className="h-14 w-14 rounded object-cover"
                    src={editingCategory.url_image}
                  />
                  <span className="text-sm text-gray-600">Imagen actual</span>
                </div>
              )}

              <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="edit-category-image">
                Reemplazar imagen (opcional)
                <input
                  accept="image/*"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                  id="edit-category-image"
                  type="file"
                  onChange={(event) => setEditImage(event.target.files?.[0] ?? null)}
                />
              </label>

              {editError && <p className="text-sm text-red-700" role="alert">{editError}</p>}

              <div className="mt-2 flex justify-end gap-3">
                <button
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
                  disabled={savingCategory}
                  type="button"
                  onClick={closeEditor}
                >
                  Cancelar
                </button>
                <button
                  className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={savingCategory}
                  type="submit"
                >
                  {savingCategory ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </Panel>
  );
}
