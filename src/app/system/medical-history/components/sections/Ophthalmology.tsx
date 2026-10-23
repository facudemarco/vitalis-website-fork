import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {MedicalRecordOphthalmology} from "@/types";
import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {SectionHandler} from "../../useFormRegistry";

interface Props {
  defaultValues: MedicalRecordOphthalmology | null;
  registerSection: (handler: SectionHandler<MedicalRecordOphthalmology>) => () => void;
}

const yesNoFields: Array<[keyof MedicalRecordOphthalmology, string]> = [
  ["consulted_ophthalmologist", "¿Consultó a un oftalmólogo en los últimos 2 años?"],
  ["vision_disease", "¿Tiene o tuvo alguna enfermedad en la vista?"],
  ["vision_treatment", "¿Está realizando algún tratamiento para la vista?"],
  ["vision_surgery", "¿Lo/la operaron de la vista?"],
  ["glasses_or_contacts", "¿Usa anteojos o lentes de contacto?"],
  ["medications", "¿Toma medicamentos?"],
  ["monocular_vision", "Visión monocular"],
  ["anisometropia", "Anisometropía"],
  ["ocular_movement_extrinsic", "Movimientos oculares extrínsecos (estrabismo)"],
  ["ocular_movement_intrinsic", "Movimientos oculares intrínsecos (anisocoria)"],
];

const tables: Array<{title: string; fields: Array<[keyof MedicalRecordOphthalmology, string]>; options: string[]}> = [
  {title:"Campo visual", fields:[["visual_field_od","OD"],["visual_field_oi","OI"]], options:["Normal","Patológico"]},
  {title:"Biomicroscopía (BMC)", fields:[["bmc_conjunctivas","Conjuntivas"],["bmc_cornea","Córneas"],["bmc_lens","Cristalino"]], options:["Normal","Patológico","No realizada"]},
  {title:"Tensión ocular", fields:[["ocular_tension_od","OD"],["ocular_tension_oi","OI"]], options:["Normal","Patológico","No realizado"]},
  {title:"Fondo de ojo", fields:[["fundus_od","OD"],["fundus_oi","OI"]], options:["Normal","Patológico","No realizado"]},
];

export const OphthalmologySection = React.memo(({defaultValues, registerSection}: Props) => {
  const booleanFields = ["consulted_ophthalmologist","vision_disease","vision_treatment","vision_surgery","glasses_or_contacts","medications","monocular_vision","anisometropia","ocular_movement_extrinsic","ocular_movement_intrinsic","fundus_dilation"] as const;
  const toBool = (value: unknown) => value === true || value === "true" || value === 1;
  const normalizedDefaults = defaultValues ? {...defaultValues, ...Object.fromEntries(booleanFields.map((field) => [field, defaultValues[field] == null ? undefined : toBool(defaultValues[field])]))} as MedicalRecordOphthalmology : null;
  const {register, getValues, trigger, control} = useForm<MedicalRecordOphthalmology>({
    defaultValues: normalizedDefaults ?? ({} as MedicalRecordOphthalmology), mode:"onBlur",
  });
  useEffect(() => registerSection({getValues, validate: async () => trigger()}), [registerSection,getValues,trigger]);

  const radioRow = (name: (typeof yesNoFields)[number][0], label: string) => (
    <div key={name} className="flex flex-wrap items-center gap-3 border-b py-2">
      <span className="min-w-48 flex-1 text-sm">{label}</span>
      <Controller control={control} name={name} render={({field}) => <>
        <label className="flex items-center gap-1 text-sm"><input checked={field.value === true} type="radio" onChange={() => field.onChange(true)} />Sí</label>
        <label className="flex items-center gap-1 text-sm"><input checked={field.value === false} type="radio" onChange={() => field.onChange(false)} />No</label>
      </>} />
    </div>
  );

  const matrix = (table: typeof tables[number]) => (
    <div key={table.title} className="min-w-0 overflow-x-auto rounded-lg border">
      <h3 className="bg-slate-100 px-3 py-2 text-sm font-semibold">{table.title}</h3>
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead><tr><th className="border p-2 text-left"></th>{table.options.map(o=><th key={o} className="border p-2">{o}</th>)}</tr></thead>
        <tbody>{table.fields.map(([field,label])=><tr key={field}><th className="border p-2 text-left">{label}</th>{table.options.map(option=><td key={option} className="border p-2 text-center"><input aria-label={label+" "+option} type="radio" value={option} {...register(field)} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  );

  return <AccordionItem value="ophthalmology">
    <AccordionTrigger>Oftalmología</AccordionTrigger>
    <AccordionContent>
      <section className="space-y-5 px-2">
        <h3 className="font-semibold">Anamnesis visual</h3>
        <div>{yesNoFields.map(([field,label])=>radioRow(field,label))}</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">¿De qué y cuándo fue la cirugía?<textarea className="mt-1 min-h-20 w-full rounded border p-2" {...register("vision_surgery_details")} /></label>
          <label className="text-sm">Detalle de medicamentos<textarea className="mt-1 min-h-20 w-full rounded border p-2" {...register("medications_details")} /></label>
          <label className="text-sm">Visión nocturna<input className="mt-1 w-full rounded border p-2" placeholder="1-100%" {...register("night_vision")} /></label>
          <label className="text-sm">Visión crepuscular<input className="mt-1 w-full rounded border p-2" placeholder="1-100%" {...register("twilight_vision")} /></label>
          <label className="text-sm">Deslumbramiento (readaptación al encandilamiento)<input className="mt-1 w-full rounded border p-2" placeholder="1-100 seg" {...register("glare_readaptation")} /></label>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">{tables.map(matrix)}</div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["ishihara","trcs","farnsworth"] as const).map((field)=><fieldset key={field} className="rounded-lg border p-3"><legend className="px-1 font-medium">{field==="trcs"?"T.R.C.S":field==="ishihara"?"Ishi Hara":"Farnsworth"}</legend><div className="flex flex-wrap gap-4">{(field==="ishihara"?["Normal","Discromatópsico","No realizado"]:["Normal","Anormal","No realizado"]).map(option=><label key={option} className="flex items-center gap-1 text-sm"><input type="radio" value={option} {...register(field)} />{option}</label>)}</div></fieldset>)}
          <label className="text-sm">Cabeza y cuello<select className="mt-1 block w-full rounded border p-2" {...register("head_neck")}><option value="">Seleccionar</option>{["1","2","3","4"].map(v=><option key={v} value={v}>{v}</option>)}</select></label>
          {radioRow("fundus_dilation","Dilatación")}
        </div>
      </section>
    </AccordionContent>
  </AccordionItem>;
});
