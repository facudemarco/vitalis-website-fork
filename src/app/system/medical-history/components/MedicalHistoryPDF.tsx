import React from "react";
import {Page, Text, View, Document, StyleSheet, Image} from "@react-pdf/renderer";

import {MedicalRecord} from "@/types";
import {normalizeMedicalRecordDefaults} from "@/lib/medicalRecordDefaults";

const styles = StyleSheet.create({
  page: {padding: 15, fontSize: 9, fontFamily: "Helvetica", color: "#000"},
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
  },
  logo: {width: 60, height: 60},
  headerTextContainer: {alignItems: "center", flex: 1},
  title: {fontSize: 16, fontWeight: "bold", color: "#2E5887", textTransform: "uppercase"},
  subtitle: {fontSize: 8, marginTop: 2, color: "#444"},
  headerRight: {fontSize: 8, textAlign: "right", width: 100},
  tableContainer: {borderWidth: 1, borderColor: "#000", marginBottom: 3},
  row: {flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000"},
  noBorderBottom: {borderBottomWidth: 0},
  cell: {padding: 2, borderRightWidth: 1, borderRightColor: "#000"},
  lastCell: {borderRightWidth: 0},
  greenHeader: {
    backgroundColor: "#93C47D",
    padding: 2,
    fontWeight: "bold",
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  cyanHeader: {backgroundColor: "#8ED1D1", padding: 2, fontWeight: "bold", fontSize: 9},
  label: {fontWeight: "bold", marginRight: 4, fontSize: 8},
  value: {fontSize: 8, flex: 1},
  checkboxBox: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  siNoHeader: {flexDirection: "row", justifyContent: "flex-end", marginBottom: 2},
  siNoLabel: {fontSize: 7, fontWeight: "bold", width: 15, textAlign: "center"},
  itemRow: {flexDirection: "row", alignItems: "center", marginBottom: 2},
  flex1: {flex: 1},
  w100: {width: "100%"},
  w50: {width: "50%"},
  w30: {width: "30%"},
  w70: {width: "70%"},
  obsRow: {borderTopWidth: 1, borderTopColor: "#000", padding: 2},
});

interface MedicalHistoryPDFProps {
  medicalRecord: MedicalRecord;
  patientCompanyName?: string | null;
}

const Checkbox = ({value}: {value?: boolean | null}) => (
  <View style={[styles.checkboxBox, value ? {backgroundColor: "#000"} : {}]}>
    {value && <Text style={{fontSize: 6, color: "#fff"}}>X</Text>}
  </View>
);

const SectionHeader = ({title}: {title: string}) => (
  <View style={styles.greenHeader}>
    <Text>{title}</Text>
  </View>
);

const SiNoItem = ({label, value}: {label: string; value?: boolean | null}) => (
  <View style={styles.itemRow}>
    <Text style={[styles.label, styles.flex1]}>{label}</Text>
    <Checkbox value={value === true} />
    <View style={{width: 2}} />
    <Checkbox value={value === false} />
  </View>
);

const SiNoHeaders = () => (
  <View style={styles.siNoHeader}>
    <Text style={styles.siNoLabel}>SI</Text>
    <Text style={styles.siNoLabel}>NO</Text>
  </View>
);

/* ================================================================
   COMPONENT
   ================================================================ */
export const MedicalHistoryPDF: React.FC<MedicalHistoryPDFProps> = ({medicalRecord: record, patientCompanyName}) => {
  const medicalRecord = normalizeMedicalRecordDefaults(record, true);
  const {
    medical_record_data,
    medical_record_evaluation_type,
    medical_record_habits,
    medical_record_family_history,
    medical_record_laboral_history,
    medical_record_laboral_contacts,
    medical_record_previous_problems,
    medical_record_surgerys,
    medical_record_personal_history,
    medical_record_clinical_exam,
    medical_record_skin_exam,
    medical_record_oftalmologico_exam,
    medical_record_bucodental_exam,
    medical_record_orl_exam,
    medical_record_head_exam,
    medical_record_cardiovascular_exam,
    medical_record_respiratorio_exam,
    medical_record_digestive_exam,
    medical_record_genitourinario_exam,
    medical_record_osteoarticular_exam,
    medical_record_neuro_clinical_exam,
    medical_record_psychiatric_clinical_exam,
    medical_record_immunizations,
    medical_record_data_img,
    medical_record_laboral_exam,
    medical_record_recomendations,
    medical_record_studies,
    medical_record_derivations,
    medical_record_cuestionario_riesgos,
    medical_record_ddjj,
    medical_record_neuro_medical_exam,
    medical_record_medical_responsable_signatures,
    medical_record_patient_signatures,
    medical_record_laboral_signatures,
    medical_record_signatures,
    medical_record_oftalmologico_medical_exam,
  } = medicalRecord;

  const d = medical_record_data;
  const habits = medical_record_habits;
  const img = medical_record_data_img;
  const fam = medical_record_family_history;
  const prev = medical_record_previous_problems;
  const contacts = medical_record_laboral_contacts;
  const surg = medical_record_surgerys;
  const pers = medical_record_personal_history;
  const clin = medical_record_clinical_exam;
  const skin = medical_record_skin_exam;
  const oft = medical_record_oftalmologico_exam;
  const buco = medical_record_bucodental_exam;
  const orl = medical_record_orl_exam;
  const head = medical_record_head_exam;
  const cardio = medical_record_cardiovascular_exam;
  const resp = medical_record_respiratorio_exam;
  const dig = medical_record_digestive_exam;
  const geni = medical_record_genitourinario_exam;
  const osteo = medical_record_osteoarticular_exam;
  const neuro = medical_record_neuro_clinical_exam;
  const psych = medical_record_psychiatric_clinical_exam;
  const immun = medical_record_immunizations;
  const laboral = medical_record_laboral_exam;
  const recom = medical_record_recomendations;
  const studies = medical_record_studies;
  const deriv = medical_record_derivations;
  const cuest = medical_record_cuestionario_riesgos;
  const companyName = d?.company_name?.trim() || patientCompanyName?.trim() || cuest?.company_name?.trim() || "Particular";
  const ddjj = medical_record_ddjj;
  const respon = medical_record_medical_responsable_signatures;
  const patient = medical_record_patient_signatures;
  const laboralSig = medical_record_laboral_signatures;
  const signatures = medical_record_signatures;

  const neuroMed = medical_record_neuro_medical_exam;
  const oftalmoMed = medical_record_oftalmologico_medical_exam;

  const formatDate = (date: string | null | undefined) =>
    date ? new Date(date).toLocaleDateString() : "";

  /* ---- Header (reused on page 1) ---- */
  const Header = () => (
    <View style={styles.headerContainer}>
      <Image src="/logo.png" style={styles.logo} />
      <View style={styles.headerTextContainer}>
        <Text style={styles.title}>VITALIS</Text>
        <Text style={{fontSize: 10, fontWeight: "bold"}}>CENTRO DE SALUD INTEGRAL</Text>
        <Text style={styles.subtitle}>(Ley 19.587 y 7.229) (Dcto. 658/96) (Res. SRT 37/2010)</Text>
        <Text style={{fontSize: 8, fontWeight: "bold"}}>Salud Ocupacional</Text>
      </View>
      <View style={styles.headerRight}>
        <Text>MEDICINA LABORAL</Text>
      </View>
    </View>
  );

  return (
    <Document>
      {/* ========== PAGE 1 ========== */}
      <Page size="A4" style={styles.page}>
        <Header />

        {/* DATOS PERSONALES: formato de ficha impresa */}
        <View style={styles.tableContainer} wrap={false}>
          <View style={{flexDirection: "row"}}>
            <View style={{width: "80%"}}>
              <View style={[styles.row, {minHeight: 23}]}>
                <View style={[styles.cell, {width: 90, backgroundColor: "#93C47D", justifyContent: "center"}]}>
                  <Text style={{fontSize: 11, fontWeight: "bold", color: "#2E5887"}}>EMPRESA</Text>
                </View>
                <View style={[styles.cell, styles.flex1, styles.lastCell, {justifyContent: "center"}]}>
                  <Text style={{fontSize: 8}}>{companyName}</Text>
                </View>
              </View>
              <View style={[styles.row, {minHeight: 22}]}>
                <View style={[styles.cell, styles.flex1, {backgroundColor: "#93C47D", justifyContent: "center"}]}>
                  <Text style={{fontSize: 10, fontWeight: "bold", color: "#2E5887"}}>DATOS PERSONALES</Text>
                </View>
                <View style={[styles.cell, styles.lastCell, {width: 120, justifyContent: "center"}]}>
                  <Text style={styles.label}>Fecha: <Text style={{fontWeight: "normal"}}>{new Date().toLocaleDateString("es-AR")}</Text></Text>
                </View>
              </View>
              <View style={[styles.row, {minHeight: 24}]}>
                <View style={[styles.cell, styles.w100, styles.lastCell, {justifyContent: "center"}]}>
                  <Text style={styles.label}>Apellido y nombres: <Text style={{fontWeight: "normal"}}>{d?.complete_name}</Text></Text>
                </View>
              </View>
              <View style={[styles.row, {minHeight: 23}]}>
                <View style={[styles.cell, styles.flex1, {justifyContent: "center"}]}>
                  <Text style={styles.label}>Fecha de Nac.: <Text style={{fontWeight: "normal"}}>{d?.date_of_birthday}</Text></Text>
                </View>
                <View style={[styles.cell, styles.flex1, styles.lastCell, {justifyContent: "center"}]}>
                  <Text style={styles.label}>Nacionalidad: <Text style={{fontWeight: "normal"}}>{d?.nacionality}</Text></Text>
                </View>
              </View>
              <View style={[styles.row, styles.noBorderBottom, {minHeight: 23}]}>
                <View style={[styles.cell, styles.flex1, {justifyContent: "center"}]}>
                  <Text style={styles.label}>Estado Civil: <Text style={{fontWeight: "normal"}}>{d?.civil_status}</Text></Text>
                </View>
                <View style={[styles.cell, styles.flex1, {justifyContent: "center"}]}>
                  <Text style={styles.label}>D.N.I.: <Text style={{fontWeight: "normal"}}>{d?.dni}</Text></Text>
                </View>
                <View style={[styles.cell, styles.lastCell, {width: 65, justifyContent: "center"}]}>
                  <Text style={styles.label}>Edad: <Text style={{fontWeight: "normal"}}>{d?.age || "—"}</Text></Text>
                </View>
              </View>
            </View>
            <View style={{width: "20%", borderLeftWidth: 1, borderLeftColor: "#000", padding: 5, justifyContent: "center", alignItems: "center"}}>
              {img?.url
                ? <Image src={img.url} style={{width: 90, height: 105, objectFit: "contain"}} />
                : <Text style={{fontSize: 10, color: "#555"}}>FOTO</Text>}
            </View>
          </View>
          <View style={[styles.row, {borderTopWidth: 1, borderTopColor: "#000", minHeight: 22}]}>
            <View style={[styles.cell, styles.w100, styles.lastCell, {justifyContent: "center"}]}>
              <Text style={styles.label}>Calle / domicilio: <Text style={{fontWeight: "normal"}}>{d?.address}</Text></Text>
            </View>
          </View>
          <View style={[styles.row, {minHeight: 22}]}>
            <View style={[styles.cell, {width: "35%", justifyContent: "center"}]}>
              <Text style={styles.label}>Teléfono: <Text style={{fontWeight: "normal"}}>{d?.phone}</Text></Text>
            </View>
            <View style={[styles.cell, styles.flex1, {justifyContent: "center"}]}>
              <Text style={styles.label}>E-mail: <Text style={{fontWeight: "normal"}}>{d?.email}</Text></Text>
            </View>
            <View style={[styles.cell, styles.lastCell, {width: 65, justifyContent: "center"}]}>
              <Text style={styles.label}>Hijos: <Text style={{fontWeight: "normal"}}>{d?.sons}</Text></Text>
            </View>
          </View>
          <View style={[styles.row, {minHeight: 24}]}>
            <View style={[styles.cell, styles.w100, styles.lastCell, {flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4}]}>
              <Text style={styles.label}>Estudios:</Text>
              {(["Primarios", "Secundarios", "Terciarios"] as const).map((level) => (
                <View key={level} style={{flexDirection: "row", alignItems: "center", gap: 3}}>
                  <Text style={{fontSize: 8}}>{level}</Text>
                  <Checkbox value={d?.education_level === level} />
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.row, styles.noBorderBottom, {minHeight: 22}]}>
            <View style={[styles.cell, styles.w100, styles.lastCell, {justifyContent: "center"}]}>
              <Text style={styles.label}>Sector: <Text style={{fontWeight: "normal"}}>{d?.sector || "—"}</Text></Text>
            </View>
          </View>
        </View>

        {/* TIPO EVALUACIÓN + HÁBITOS */}
        <View style={[styles.tableContainer, {flexDirection: "row"}]}>
          <View style={{width: "28%", borderRightWidth: 1, borderRightColor: "#000"}}>
            <SectionHeader title="TIPO EVALUACIÓN" />
            <View style={{padding: 3}}>
              {[
                {
                  l: "Examen Preocupacional",
                  v: medical_record_evaluation_type?.preocupational_exam,
                },
                {l: "Examen Periódicos", v: medical_record_evaluation_type?.periodic_exams},
                {l: "Examen de Egreso", v: medical_record_evaluation_type?.graduation_exam},
                {
                  l: "Cambio Puesto Laboral",
                  v: medical_record_evaluation_type?.laboral_change_position,
                },
                {l: "Post. Enf. Prolongada", v: medical_record_evaluation_type?.post_enf_prolonged},
                {
                  l: "Aptitud Física Deportiva",
                  v: medical_record_evaluation_type?.sport_physical_aptitude,
                },
                {l: "Otro", v: !!medical_record_evaluation_type?.other},
              ].map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={[styles.label, styles.flex1]}>{item.l}</Text>
                  <Checkbox value={item.v} />
                </View>
              ))}
              <Text style={{fontSize: 7}}>Cual: {medical_record_evaluation_type?.other}</Text>
            </View>
          </View>

          <View style={{width: "72%"}}>
            <SectionHeader title="HÁBITOS" />
            <View style={{padding: 2}}>
              <View style={{flexDirection: "row", marginBottom: 2}}>
                <View style={{width: "45%"}} />
                <Text style={{fontSize: 7, fontWeight: "bold", width: 15, textAlign: "center"}}>
                  SI
                </Text>
                <Text style={{fontSize: 7, fontWeight: "bold", width: 15, textAlign: "center"}}>
                  NO
                </Text>
                <View style={{flex: 1}} />
              </View>
              {[
                {l: "Dieta", v: habits?.diet, detail: ""},
                {
                  l: "Fuma",
                  v: habits?.smoke,
                  detail: `Cuántos por día? ${habits?.smoke_quantity ?? ""}`,
                },
                {
                  l: "Toma bebidas alcohólicas",
                  v: habits?.alcoholic_drinks,
                  detail: `Cantidad: ${habits?.alcoholic_drinks_quantity ?? ""}`,
                },
                {
                  l: "Usa / ha usado drogas en abuso",
                  v: habits?.drugs,
                  detail: `Cuáles? ${habits?.drugs_type ?? ""}`,
                },
                {
                  l: "Tiene alteración del sueño",
                  v: habits?.sleep_alteration,
                  detail: `Cuántas horas duerme? ${habits?.sleep_hours ?? ""}`,
                },
                {
                  l: "Hace alguna dieta",
                  v: habits?.daily_diet,
                  detail: `de qué tipo? ${habits?.diet_type ?? ""}`,
                },
                {
                  l: "Realiza actividad física",
                  v: habits?.physic_activity,
                  detail: `Cuál/es? con qué frecuencia? ${habits?.physic_activity_type ?? ""} - ${habits?.frequency ?? ""}`,
                },
              ].map((item, i) => (
                <View key={i} style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                  <Text style={[styles.label, {width: "45%"}]}>{item.l}</Text>
                  <Checkbox value={item.v === true} />
                  <View style={{width: 2}} />
                  <Checkbox value={item.v === false} />
                  <Text style={{fontSize: 7, flex: 1, marginLeft: 5}}>{item.detail}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ANTECEDENTES FAMILIARES */}
        <View style={styles.tableContainer}>
          <SectionHeader title="ANTECEDENTES FAMILIARES" />
          <View style={{flexDirection: "row", padding: 4}}>
            <View style={{width: "20%"}}>
              <View style={{flexDirection: "row", justifyContent: "flex-end", marginBottom: 2}}>
                <Text style={{fontSize: 7, width: 25, textAlign: "center"}}>VIVO</Text>
                <Text style={{fontSize: 7, width: 35, textAlign: "center"}}>FALLECIDO</Text>
              </View>
              {[
                {l: "Padre", v: fam?.father_alive},
                {l: "Madre", v: fam?.mother_alive},
                {l: "Hermanos", v: fam?.brothers_alive},
                {l: "Hermanas", v: fam?.sisters_alive},
                {l: "Esposo /a", v: fam?.husband_alive},
                {l: "Hijos", v: fam?.sons_alive},
              ].map((item, i) => (
                <View key={i} style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                  <Text style={[styles.label, styles.flex1]}>{item.l}</Text>
                  <Checkbox value={item.v} />
                  <View style={{width: 10}} />
                  <Checkbox value={item.v === false} />
                </View>
              ))}
            </View>
            <View style={{width: "40%", paddingLeft: 10}}>
              <Text style={{fontSize: 8, fontWeight: "bold", marginBottom: 2, textAlign: "center"}}>
                Alguno de ellos a padecido:
              </Text>
              <SiNoHeaders />
              {[
                {l: "Enfermedades mentales", v: fam?.mental_illnesses},
                {l: "Enfermedades cardiovasculares", v: fam?.cardiovascular_illnesses},
                {l: "Problemas de riñón", v: fam?.kidney_problems},
                {l: "Problemas digestivos", v: fam?.digestive_problems},
                {l: "Asma", v: fam?.asma},
                {l: "Tuberculosis", v: fam?.tuberculosis},
              ].map((item, i) => (
                <SiNoItem key={i} label={item.l} value={item.v} />
              ))}
            </View>
            <View style={{width: "40%", paddingLeft: 10, paddingTop: 15}}>
              <SiNoHeaders />
              {[
                {l: "Diabetes", v: fam?.diabetes},
                {l: "Reumatismo", v: fam?.reumatism},
                {l: "Cáncer", v: fam?.cancer},
              ].map((item, i) => (
                <SiNoItem key={i} label={item.l} value={item.v} />
              ))}
              <Text style={{fontSize: 7, marginTop: 3}}>Tipo: {fam?.cancer_type}</Text>
            </View>
          </View>
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Observaciones: <Text style={{fontWeight: "normal"}}>{fam?.observations}</Text>
            </Text>
          </View>
        </View>

        {/* ANTECEDENTES LABORALES */}
        <View style={styles.tableContainer}>
          <SectionHeader title="ANTECEDENTES LABORALES" />
          <View style={[styles.row, styles.noBorderBottom]}>
            <View style={[styles.cell, styles.w100, styles.lastCell]}>
              <Text style={{fontSize: 8, textAlign: "center", fontWeight: "bold"}}>
                Tareas realizadas - Duración de las mismas
              </Text>
              <Text style={{fontSize: 8, minHeight: 30}}>
                {medical_record_laboral_history?.done_tasks}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ========== PAGE 2 ========== */}
      <Page size="A4" style={styles.page}>
        {/* PROBLEMAS PREVIOS */}
        <View style={styles.tableContainer}>
          <SectionHeader title="Usted ha tenido o tiene alguno de los siguientes problemas?" />
          <View style={{flexDirection: "row", padding: 4}}>
            <View style={{width: "50%"}}>
              <SiNoHeaders />
              {[
                {l: "Dolores de cabeza frecuente", v: prev?.head_pain},
                {l: "Convulsiones", v: prev?.seizures},
                {l: "Mareos o desmayos", v: prev?.dizziness_or_fainting},
                {l: "Nerviosismo excesivo", v: prev?.excesive_nervious},
                {l: "Pérdida de memoria", v: prev?.memory_loss},
                {l: "Problemas en los ojos o en la vista", v: prev?.eyes_problems},
                {l: "Problemas en los oídos o en la audición", v: prev?.ear_problems},
                {l: "Problemas en la boca / dientes", v: prev?.mouth_problems},
                {l: "Enfermedades de la piel", v: prev?.skin_diseases},
                {l: "Alergias", v: prev?.allergies},
                {l: "Sinusitis", v: prev?.sinusitis},
                {l: "Asma", v: prev?.asma},
                {l: "Tos prolongada o sangre al escupir", v: prev?.long_cough},
                {l: "Tuberculosis", v: prev?.tuberculosis},
                {l: "Dolores de pecho", v: prev?.chest_pain},
                {l: "Falta de aire", v: prev?.insufficient_air},
                {l: "Palpitaciones", v: prev?.palpitations},
                {l: "Presión alta o baja", v: prev?.high_or_low_pressure},
                {l: "Problemas digestivos", v: prev?.digestive_problems},
                {l: "Hepatitis", v: prev?.hepatitis},
              ].map((item, i) => (
                <SiNoItem key={i} label={item.l} value={item.v} />
              ))}
              <View style={styles.itemRow}>
                <Text style={styles.label}>Otros: </Text>
                <Text style={styles.value}>{prev?.others}</Text>
              </View>
            </View>
            <View style={{width: "50%", paddingLeft: 10}}>
              <SiNoHeaders />
              {[
                {l: "Hernias", v: prev?.hernias},
                {l: "Hemorroides", v: prev?.hemorroides},
                {l: "Dificultad para orinar", v: prev?.difficulty_pee},
                {l: "Amputaciones", v: prev?.amputations},
                {l: "Fracturas", v: prev?.bone_breaks},
                {l: "Dolores de cuello", v: prev?.neck_pain},
                {l: "Dolores de espalda o cintura", v: prev?.back_or_waist_pain},
                {l: "Dolores en hombros - codos - muñecas", v: prev?.shoulders_elbows_wrists_pain},
                {l: "Dolores en caderas - rodillas - tobillos", v: prev?.hips_knees_ankles_pain},
                {l: "Pies planos", v: prev?.plane_feet},
                {l: "Várices", v: prev?.varices},
                {l: "Diabetes", v: prev?.diabetes},
                {l: "Fiebre reumática", v: prev?.fiebre_reumatica},
                {l: "Chagas", v: prev?.chagas},
                {l: "Enfermedades de transmisión sexual", v: prev?.sexual_transmition_diseases},
                {l: "Cáncer o tumores", v: prev?.cancer},
                {l: "Toma actualmente alguna medicación", v: prev?.medication_actually},
              ].map((item, i) => (
                <SiNoItem key={i} label={item.l} value={item.v} />
              ))}
              <View style={styles.itemRow}>
                <Text style={styles.label}>¿Cual?: </Text>
                <Text style={styles.value}>{prev?.medication_type}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CONTACTOS LABORALES + CIRUGÍAS */}
        <View style={{flexDirection: "row", gap: 5, marginBottom: 5}}>
          <View style={[styles.tableContainer, {flex: 1, marginBottom: 0}]}>
            <SectionHeader title="Estuvo alguna vez laboralmente en contacto con:" />
            <View style={{padding: 3}}>
              <View style={{flexDirection: "row", marginBottom: 2}}>
                <View style={styles.flex1} />
                <Text style={{fontSize: 7, fontWeight: "bold", width: 15, textAlign: "center"}}>
                  SI
                </Text>
                <Text style={{fontSize: 7, fontWeight: "bold", width: 15, textAlign: "center"}}>
                  NO
                </Text>
                <Text style={{fontSize: 7, fontWeight: "bold", width: 60, textAlign: "center"}}>
                  FECHA APROX.
                </Text>
              </View>
              {[
                {
                  l: "Ambiente pulverulento?",
                  v: contacts?.dusty_environment,
                  dt: contacts?.dusty_environment_date,
                },
                {
                  l: "Ambiente ruidoso?",
                  v: contacts?.noisy_environment,
                  dt: contacts?.noisy_environment_date,
                },
                {
                  l: "Productos animales?",
                  v: contacts?.animal_products,
                  dt: contacts?.animal_products_date,
                },
                {
                  l: "Productos químicos?",
                  v: contacts?.chemicals_products,
                  dt: contacts?.chemicals_products_date,
                },
                {
                  l: "Radiaciones ionizantes?",
                  v: contacts?.ionizing_radiation,
                  dt: contacts?.ionizing_radiation_date,
                },
                {
                  l: "Otros contaminantes?",
                  v: contacts?.other_contamination,
                  dt: contacts?.other_contamination_date,
                },
              ].map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={[styles.label, styles.flex1]}>{item.l}</Text>
                  <Checkbox value={item.v === true} />
                  <View style={{width: 2}} />
                  <Checkbox value={item.v === false} />
                  <Text style={{fontSize: 7, width: 60, textAlign: "center"}}>
                    {formatDate(item.dt)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.tableContainer, {flex: 1, marginBottom: 0}]}>
            <SectionHeader title="Ha sido operado de:" />
            <View style={{padding: 3}}>
              <View style={{flexDirection: "row", marginBottom: 2}}>
                <View style={styles.flex1} />
                <Text style={{fontSize: 7, fontWeight: "bold", width: 15, textAlign: "center"}}>
                  SI
                </Text>
                <Text style={{fontSize: 7, fontWeight: "bold", width: 15, textAlign: "center"}}>
                  NO
                </Text>
                <Text style={{fontSize: 7, fontWeight: "bold", width: 60, textAlign: "center"}}>
                  FECHA APROX.
                </Text>
              </View>
              {[
                {l: "Apéndice?", v: surg?.apendice, dt: surg?.apendice_date},
                {l: "Amígdala?", v: surg?.amigdala, dt: surg?.amigdala_date},
                {l: "Hernia?", v: surg?.hernia, dt: surg?.hernia_date},
                {l: "Várices?", v: surg?.varices, dt: surg?.varices_date},
                {l: "Vesícula?", v: surg?.vesicula, dt: surg?.vesicula_date},
                {l: "Columna?", v: surg?.columna, dt: surg?.columna_date},
                {l: "Testículos?", v: surg?.testiculos, dt: surg?.testiculos_date},
                {l: "Otros", v: surg?.others, dt: surg?.others_date},
              ].map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={[styles.label, styles.flex1]}>{item.l}</Text>
                  <Checkbox value={item.v === true} />
                  <View style={{width: 2}} />
                  <Checkbox value={item.v === false} />
                  <Text style={{fontSize: 7, width: 60, textAlign: "center"}}>
                    {formatDate(item.dt)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ANTECEDENTES PERSONALES */}
        <View style={styles.tableContainer}>
          <SectionHeader title="ANTECEDENTES PERSONALES" />
          <View style={{padding: 3}}>
            <SiNoHeaders />
            <View style={styles.itemRow}>
              <Text style={[styles.label, {width: 60}]}>Internaciones</Text>
              <Checkbox value={pers?.internations === true} />
              <View style={{width: 2}} />
              <Checkbox value={pers?.internations === false} />
              <Text style={{fontSize: 7, marginLeft: 10}}>
                ¿Indique por qué, si es sí? {pers?.internations_motive}
              </Text>
            </View>
            <SiNoItem label="Covid" value={pers?.covid} />
            <SiNoItem label="FHA" value={pers?.fha} />
            <SiNoItem label="Dengue" value={pers?.dengue} />
          </View>
        </View>

        {/* EXAMEN CLÍNICO */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN CLÍNICO" />
          <View style={[styles.row, styles.noBorderBottom]}>
            <View style={[styles.cell, styles.flex1]}>
              <Text style={styles.label}>
                Talla: <Text style={{fontWeight: "normal"}}>{clin?.talla}</Text>
              </Text>
            </View>
            <View style={[styles.cell, styles.flex1]}>
              <Text style={styles.label}>
                Peso: <Text style={{fontWeight: "normal"}}>{clin?.peso}</Text>
              </Text>
            </View>
            <View style={[styles.cell, styles.flex1]}>
              <Text style={styles.label}>
                Saturación: <Text style={{fontWeight: "normal"}}>{clin?.saturacion}</Text>
              </Text>
            </View>
            <View style={[styles.cell, styles.flex1]}>
              <Text style={styles.label}>
                IMC: <Text style={{fontWeight: "normal"}}>{clin?.imc}</Text>
              </Text>
            </View>
            <View style={[styles.cell, styles.flex1]}>
              <Text style={styles.label}>
                TA mín: <Text style={{fontWeight: "normal"}}>{clin?.ta_min}</Text>
              </Text>
            </View>
            <View style={[styles.cell, styles.flex1, styles.lastCell]}>
              <Text style={styles.label}>
                TA máx: <Text style={{fontWeight: "normal"}}>{clin?.ta_max}</Text>
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ========== PAGE 3 ========== */}
      <Page size="A4" style={styles.page}>
        {/* PIEL / FANERAS */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN DE PIEL / FANERAS" />
          <View style={{flexDirection: "row", padding: 3}}>
            <View style={{width: "40%"}}>
              <SiNoHeaders />
              <SiNoItem label="Alteraciones de la piel y faneras" value={skin?.skin_alteration} />
              <SiNoItem label="Piercing" value={skin?.piercing} />
              <SiNoItem label="Tatuajes" value={skin?.tattoo} />
              <SiNoItem label="Cicatrices" value={skin?.cicatrices} />
            </View>
            <View style={{width: "60%", paddingLeft: 10}}>
              <Text style={styles.label}>
                Observaciones: <Text style={{fontWeight: "normal"}}>{skin?.observations}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* OFTALMOLÓGICO */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN OFTALMOLÓGICO" />
          <View style={styles.row}>
            <Text style={[styles.cell, {width: 50, fontSize: 7}]}> </Text>
            <Text
              style={[
                styles.cell,
                {fontSize: 7, fontWeight: "bold", width: 80, textAlign: "center"},
              ]}
            >
              Cercana
            </Text>
            <Text
              style={[
                styles.cell,
                {fontSize: 7, fontWeight: "bold", width: 80, textAlign: "center"},
              ]}
            >
              Lejana
            </Text>
            <View style={[styles.cell, styles.flex1, styles.lastCell, {flexDirection: "row"}]}>
              <Text style={{fontSize: 7, fontWeight: "bold", width: 15, textAlign: "center"}}>
                SI
              </Text>
              <Text style={{fontSize: 7, fontWeight: "bold", width: 15, textAlign: "center"}}>
                NO
              </Text>
              <Text style={{fontSize: 7, fontWeight: "bold", flex: 1}}>Observaciones</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={[styles.cell, {width: 50, fontSize: 7}]}>S/C</Text>
            <View style={[styles.cell, {width: 80, flexDirection: "row"}]}>
              <Text style={{fontSize: 7, flex: 1}}>OD: {oft?.sc_od_nearby}</Text>
              <Text style={{fontSize: 7, flex: 1}}>OI: {oft?.sc_oi_nearby}</Text>
            </View>
            <View style={[styles.cell, {width: 80, flexDirection: "row"}]}>
              <Text style={{fontSize: 7, flex: 1}}>OD: {oft?.sc_od_distant}</Text>
              <Text style={{fontSize: 7, flex: 1}}>OI: {oft?.sc_oi_distant}</Text>
            </View>
            <View
              style={[
                styles.cell,
                styles.flex1,
                styles.lastCell,
                {flexDirection: "row", alignItems: "center"},
              ]}
            >
              <Text style={{fontSize: 7, flex: 1}}>Alteraciones oculares</Text>
              <Checkbox value={oft?.eyes_alterations === true} />
              <View style={{width: 2}} />
              <Checkbox value={oft?.eyes_alterations === false} />
            </View>
          </View>
          <View style={[styles.row, styles.noBorderBottom]}>
            <Text style={[styles.cell, {width: 50, fontSize: 7}]}>C/C</Text>
            <View style={[styles.cell, {width: 80, flexDirection: "row"}]}>
              <Text style={{fontSize: 7, flex: 1}}>OD: {oft?.cc_od_nearby}</Text>
              <Text style={{fontSize: 7, flex: 1}}>OI: {oft?.cc_oi_nearby}</Text>
            </View>
            <View style={[styles.cell, {width: 80, flexDirection: "row"}]}>
              <Text style={{fontSize: 7, flex: 1}}>OD: {oft?.cc_od_distant}</Text>
              <Text style={{fontSize: 7, flex: 1}}>OI: {oft?.cc_oi_distant}</Text>
            </View>
            <View
              style={[
                styles.cell,
                styles.flex1,
                styles.lastCell,
                {flexDirection: "row", alignItems: "center"},
              ]}
            >
              <Text style={{fontSize: 7, flex: 1}}>Discromatopsia</Text>
              <Checkbox value={oft?.discromatopsia === true} />
              <View style={{width: 2}} />
              <Checkbox value={oft?.discromatopsia === false} />
            </View>
          </View>
        </View>

        {/* BUCODENTAL + ORL */}
        <View style={{flexDirection: "row", gap: 5, marginBottom: 5}}>
          <View style={[styles.tableContainer, {flex: 1, marginBottom: 0}]}>
            <SectionHeader title="EXAMEN BUCODENTAL" />
            <View style={{padding: 3}}>
              <SiNoHeaders />
              <SiNoItem label="Prótesis" value={buco?.protesis} />
              <SiNoItem label="Caries" value={buco?.caries} />
              <SiNoItem label="Encías alteradas" value={buco?.encias_alteradas} />
              <SiNoItem label="Dentadura parcial" value={buco?.dentadura_parcial} />
            </View>
            <View style={styles.obsRow}>
              <Text style={styles.label}>
                Observaciones: <Text style={{fontWeight: "normal"}}>{buco?.observations}</Text>
              </Text>
            </View>
          </View>
          <View style={[styles.tableContainer, {flex: 1, marginBottom: 0}]}>
            <SectionHeader title="EXAMEN ORL" />
            <View style={{padding: 3}}>
              <SiNoHeaders />
              <SiNoItem label="Patología de Faringe" value={orl?.faringe_pathology} />
              <SiNoItem label="Patología de Amígdalas" value={orl?.amigdalas_pathology} />
              <SiNoItem label="Alteraciones de la voz" value={orl?.voice_alterations} />
              <SiNoItem label="Rinitis" value={orl?.rinitis} />
              <SiNoItem label="Trastornos de la audición" value={orl?.audition_disorders} />
              <SiNoItem label="Adenopatías" value={orl?.adenopatias} />
            </View>
          </View>
        </View>

        {/* CABEZA Y CUELLO */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN CABEZA Y CUELLO" />
          <View style={{flexDirection: "row", padding: 3}}>
            <View style={{width: "50%"}}>
              <SiNoHeaders />
              <SiNoItem label="Movilidad alterada" value={head?.alteration_movility} />
              <SiNoItem
                label="Latidos carotídeos alterados"
                value={head?.latidos_carotideos_alterados}
              />
            </View>
            <View style={{width: "50%"}}>
              <SiNoHeaders />
              <SiNoItem label="Tumoraciones tiroideas" value={head?.tumoraciones_tiroideas} />
              <SiNoItem label="Adenopatías" value={head?.adenopatias} />
            </View>
          </View>
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Observaciones: <Text style={{fontWeight: "normal"}}>{head?.observations}</Text>
            </Text>
          </View>
        </View>

        {/* CARDIOVASCULAR */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN CARDIOVASCULAR" />
          <View style={{flexDirection: "row", padding: 3}}>
            <View style={{width: "25%"}}>
              <Text style={styles.label}>
                Frecuencia cardíaca:{" "}
                <Text style={{fontWeight: "normal"}}>{cardio?.freq_cardiaca}</Text> por minuto
              </Text>
              <Text style={[styles.label, {marginTop: 3}]}>
                Tensión arterial:{" "}
                <Text style={{fontWeight: "normal"}}>{cardio?.tension_arterial}</Text> mm/Hg
              </Text>
            </View>
            <View style={{width: "35%"}}>
              <SiNoHeaders />
              <SiNoItem label="Ritmo cardíaco irregular" value={cardio?.ritmo_irregular} />
              <SiNoItem label="Ruidos cardíacos alterados" value={cardio?.ruidos_alterados} />
              <SiNoItem label="Extrasístoles" value={cardio?.extrasistoles} />
            </View>
            <View style={{width: "40%"}}>
              <SiNoHeaders />
              <SiNoItem label="Soplos" value={cardio?.soplos} />
              <SiNoItem
                label="Pulsos periféricos ausentes"
                value={cardio?.pulsos_perifericos_ausentes}
              />
              <SiNoItem label="Várices" value={cardio?.varices} />
            </View>
          </View>
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Observaciones: <Text style={{fontWeight: "normal"}}>{cardio?.observations}</Text>
            </Text>
          </View>
        </View>

        {/* RESPIRATORIO */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN TORÁXICO / RESPIRATORIO" />
          <View style={{flexDirection: "row", padding: 3}}>
            <View style={{width: "25%"}}>
              <Text style={styles.label}>
                Frecuencia respiratoria:{" "}
                <Text style={{fontWeight: "normal"}}>{resp?.freq_respiratoria}</Text> por minuto
              </Text>
            </View>
            <View style={{width: "35%"}}>
              <SiNoHeaders />
              <SiNoItem label="Deformaciones toráxicas" value={resp?.deformaciones_toracicas} />
              <SiNoItem label="Rales" value={resp?.rales} />
              <SiNoItem label="Roncus y Sibilancias" value={resp?.roncus} />
            </View>
            <View style={{width: "40%"}}>
              <SiNoHeaders />
              <SiNoItem label="Murmullo vesicular alterado" value={resp?.murmullo_vesicular} />
              <SiNoItem label="Adenopatías" value={resp?.adenopatias} />
              <SiNoItem label="Proceso agudo en curso" value={resp?.proceso_agudo} />
            </View>
          </View>
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Observaciones: <Text style={{fontWeight: "normal"}}>{resp?.observations}</Text>
            </Text>
          </View>
        </View>
      </Page>

      {/* ========== PAGE 4 ========== */}
      <Page size="A4" style={styles.page}>
        {/* DIGESTIVO */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN DIGESTIVO / ABDOMINAL" />
          <View style={{flexDirection: "row", padding: 3}}>
            <View style={{width: "50%"}}>
              <SiNoHeaders />
              <SiNoItem label="Cicatrices quirúrgicas" value={dig?.cicatrices_quirurgicas} />
              <SiNoItem label="Hemorroides" value={dig?.hemorroides} />
              <SiNoItem label="Dolores abdominales" value={dig?.dolores_abdominales} />
            </View>
            <View style={{width: "50%"}}>
              <SiNoHeaders />
              <SiNoItem label="Hepatomegalia" value={dig?.hepatomegalia} />
              <SiNoItem label="Esplenomegalia" value={dig?.esplenomegalia} />
              <SiNoItem label="Adenopatías" value={dig?.adenopatias} />
              <SiNoItem label="Hernias" value={dig?.hernias} />
            </View>
          </View>
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Observaciones: <Text style={{fontWeight: "normal"}}>{dig?.observations}</Text>
            </Text>
          </View>
        </View>

        {/* GENITOURINARIO */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN GENITOURINARIO" />
          <View style={{flexDirection: "row"}}>
            <View style={{width: "50%", borderRightWidth: 1, borderRightColor: "#000"}}>
              <View style={styles.cyanHeader}>
                <Text style={{textAlign: "center", fontWeight: "bold", fontSize: 8}}>MUJERES</Text>
              </View>
              <View style={{padding: 3}}>
                <SiNoHeaders />
                <SiNoItem label="Alteraciones mamarias" value={geni?.women_alteraciones_mamarias} />
                <SiNoItem
                  label="Alteraciones ginecológicas"
                  value={geni?.women_alteraciones_ginecologicas}
                />
                <SiNoItem label="FUM" value={geni?.women_fum} />
                <Text style={styles.label}>
                  Fecha ultima menstruacion:{" "}
                  <Text style={{fontWeight: "normal"}}>{geni?.women_fum_date}</Text>
                </Text>
                <SiNoItem label="Dolores menstruales" value={geni?.women_dolores_menstruales} />
                <SiNoItem label="Flujos alterados" value={geni?.women_flujos_alterados} />
                <SiNoItem label="Anticonceptivos" value={geni?.women_anticonceptivos} />
                <SiNoItem label="Parto normal" value={geni?.women_parto_normal} />
                <SiNoItem label="Abortos" value={geni?.women_abortos} />
                <SiNoItem label="Cesárea" value={geni?.women_cesarea} />
              </View>
            </View>
            <View style={{width: "50%"}}>
              <View style={styles.cyanHeader}>
                <Text style={{textAlign: "center", fontWeight: "bold", fontSize: 8}}>HOMBRES</Text>
              </View>
              <View style={{padding: 3}}>
                <SiNoHeaders />
                <SiNoItem label="Alteraciones mamarias" value={geni?.men_alteraciones_mamarias} />
                <SiNoItem
                  label="Alteraciones testiculares"
                  value={geni?.men_alteraciones_testiculares}
                />
              </View>
              <View style={{padding: 3, borderTopWidth: 1, borderTopColor: "#000"}}>
                <Text style={styles.label}>
                  Observaciones: <Text style={{fontWeight: "normal"}}>{geni?.observations}</Text>
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Observaciones: <Text style={{fontWeight: "normal"}}>{geni?.observations}</Text>
            </Text>
          </View>
        </View>

        {/* OSTEOARTICULAR */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN OSTEOARTICULAR" />
          <View style={{flexDirection: "row"}}>
            <View style={{width: "22%", borderRightWidth: 1, borderRightColor: "#000"}}>
              <View style={[styles.greenHeader, {fontSize: 7}]}>
                <Text>COLUMNA VERTEBRAL</Text>
              </View>
              <View style={{padding: 3}}>
                <SiNoHeaders />
                <SiNoItem label="Movilidad alterada" value={osteo?.column_movilidad_alterada} />
                <SiNoItem label="Puntos dolorosos" value={osteo?.column_puntos_dolorosos} />
                <SiNoItem label="Escoliosis" value={osteo?.column_escoliosis} />
                <SiNoItem label="Cifosis anormal" value={osteo?.column_cifosis} />
                <SiNoItem label="Lordosis anormal" value={osteo?.column_lordosis} />
              </View>
            </View>
            <View style={{width: "40%", borderRightWidth: 1, borderRightColor: "#000"}}>
              <View style={[styles.cyanHeader, {fontSize: 7}]}>
                <Text>EXTREMIDADES SUPERIOR</Text>
              </View>
              <View style={{padding: 3}}>
                <SiNoHeaders />
                <SiNoItem label="Dolor articular" value={osteo?.dolor_articular} />
                <SiNoItem label="Limitación de movimientos" value={osteo?.limitacion_movimientos} />
                <SiNoItem label="Tono / Trofismo alterado" value={osteo?.tono_trofismo} />
                <SiNoItem label="Amputaciones" value={osteo?.amputaciones} />
                <SiNoItem
                  label="Movilidad hombro alterado"
                  value={osteo?.movilidad_hombro_alterado}
                />
                <SiNoItem label="Movilidad codo alterado" value={osteo?.movilidad_codo_alterado} />
                <SiNoItem
                  label="Movilidad muñeca alterada"
                  value={osteo?.movilidad_muñeca_alterado}
                />
                <SiNoItem label="Movilidad mano alterada" value={osteo?.movilidad_mano_alterado} />
              </View>
            </View>
            <View style={{width: "38%"}}>
              <View style={[styles.cyanHeader, {fontSize: 7}]}>
                <Text>EXTREMIDADES INFERIOR</Text>
              </View>
              <View style={{padding: 3}}>
                <SiNoHeaders />
                <SiNoItem
                  label="Movilidad cadera alterada"
                  value={osteo?.movilidad_cadera_alterado}
                />
                <SiNoItem
                  label="Movilidad rodilla alterada"
                  value={osteo?.movilidad_rodilla_alterado}
                />
                <SiNoItem label="Movilidad pié alterado" value={osteo?.movilidad_pie_alterado} />
              </View>
            </View>
          </View>
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Observaciones: <Text style={{fontWeight: "normal"}}>{osteo?.observations}</Text>
            </Text>
          </View>
        </View>
      </Page>

      {/* ========== PAGE 5 ========== */}
      <Page size="A4" style={styles.page}>
        {/* NEUROLÓGICO + PSIQUIÁTRICO */}
        <View style={{flexDirection: "row", gap: 5, marginBottom: 5}}>
          <View style={[styles.tableContainer, {flex: 1, marginBottom: 0}]}>
            <SectionHeader title="EVALUACIÓN CLÍNICA NEUROLÓGICA" />
            <View style={{padding: 3}}>
              <SiNoHeaders />
              <SiNoItem label="Desorientado tiempo y espacio" value={neuro?.desorientado} />
              <SiNoItem label="Motilidad alterada" value={neuro?.motilidad_alterada} />
              <SiNoItem label="Sensibilidad alterada" value={neuro?.sensibilidad_alterada} />
              <SiNoItem label="Reflejos alterados" value={neuro?.reflejos_alterados} />
              <SiNoItem label="Apraxia" value={neuro?.apraxia} />
              <SiNoItem label="Ataxia" value={neuro?.ataxia} />
            </View>
            <View style={styles.obsRow}>
              <Text style={styles.label}>
                Observaciones: <Text style={{fontWeight: "normal"}}>{neuro?.observations}</Text>
              </Text>
            </View>
          </View>
          <View style={[styles.tableContainer, {flex: 1, marginBottom: 0}]}>
            <SectionHeader title="EVALUACIÓN CLÍNICA PSÍQUICA" />
            <View style={{padding: 3}}>
              <SiNoHeaders />
              <SiNoItem label="Alteraciones de conducta" value={psych?.alteraciones_conducta} />
              <SiNoItem label="Nerviosismo excesivo" value={psych?.nerviosismo_excesivo} />
              <SiNoItem label="Depresión Psicomotriz" value={psych?.depresion_psicomotriz} />
              <SiNoItem label="Timidez excesiva" value={psych?.timidez_excesiva} />
            </View>
            <View style={styles.obsRow}>
              <Text style={styles.label}>
                Observaciones: <Text style={{fontWeight: "normal"}}>{psych?.observations}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* INMUNIZACIONES */}
        <View style={styles.tableContainer}>
          <SectionHeader title="INMUNIZACIONES" />
          <View style={{padding: 3}}>
            <SiNoHeaders />
            <View style={styles.itemRow}>
              <Text style={[styles.label, {flex: 1}]}>Sars-cov-2</Text>
              <Text style={{fontSize: 7, marginRight: 10}}>Dosis: {immun?.sars_cov_2_dosis}</Text>
              <Checkbox value={immun?.sars_cov_2 === true} />
              <View style={{width: 2}} />
              <Checkbox value={immun?.sars_cov_2 === false} />
            </View>
            <SiNoItem label="FHA" value={immun?.fha} />
            <SiNoItem label="Dengue" value={immun?.dengue} />
            <SiNoItem label="Triple adultos (tétanos)" value={immun?.triple_adultos_tetanos} />
            <SiNoItem label="Hepatitis A" value={immun?.hepatitis_a} />
            <SiNoItem label="Hepatitis B" value={immun?.hepatitis_b} />
          </View>
        </View>

        {/* EXAMEN MÉDICO LABORAL */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN MÉDICO LABORAL" />
          <View style={[styles.cyanHeader, {fontSize: 7}]}>
            <Text>ANTECEDENTES DE EXPOSICIÓN</Text>
          </View>
          <View style={{flexDirection: "row", padding: 3}}>
            <View style={{width: "40%"}}>
              <SiNoHeaders />
              <SiNoItem label="Físico" value={laboral?.physical} />
              <SiNoItem label="Químico" value={laboral?.chemical} />
              <SiNoItem label="Biológico" value={laboral?.biological} />
              <SiNoItem label="Ergonómico" value={laboral?.ergonomic} />
              <SiNoItem label="Otros" value={laboral?.others} />
            </View>
            <View style={{width: "60%", paddingLeft: 10}}>
              <Text style={styles.label}>
                Observaciones: <Text style={{fontWeight: "normal"}}>{laboral?.observations}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* CONCLUSIONES Y RECOMENDACIONES */}
        <View style={styles.tableContainer}>
          <SectionHeader title="CONCLUSIONES Y RECOMENDACIONES" />
          <View style={{padding: 5}}>
            {[
              {l: "APTO", v: recom?.apto},
              {
                l: "APTO CON PREEXISTENCIA QUE NO CONDICIONA SU TAREA LABORAL",
                v: recom?.apto_preexistencia_no_condiciona,
              },
              {
                l: "APTO CON PREEXISTENCIA QUE CONDICIONA SU TAREA LABORAL",
                v: recom?.apto_preexistencia_condiciona,
              },
            ].map((item, i) => (
              <View key={i} style={{flexDirection: "row", alignItems: "center", marginBottom: 3}}>
                <Text style={{fontSize: 8, fontWeight: "bold", flex: 1}}>{item.l}</Text>
                <Checkbox value={item.v} />
              </View>
            ))}
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 3}}>
              <Text style={{fontSize: 8, fontWeight: "bold", flex: 1}}>NO APTO TEMPORAL</Text>
              <Checkbox value={recom?.no_apto_temporal} />
              <Text style={{fontSize: 8, marginLeft: 10}}>Duración: {recom?.duracion}</Text>
            </View>
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 3}}>
              <Text style={{fontSize: 8, fontWeight: "bold", flex: 1}}>NO APTO DEFINITIVO</Text>
              <Checkbox value={recom?.no_apto_definitivo} />
            </View>
          </View>
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Observaciones: <Text style={{fontWeight: "normal"}}>{recom?.observations}</Text>
            </Text>
          </View>
        </View>

        {/* DERIVACIONES */}
        <View style={styles.tableContainer}>
          <SectionHeader title="DERIVACIONES Y APELLIDO DEL PACIENTE CON ESPECIALISTAS" />
          <View style={{padding: 5, minHeight: 30}}>
            <Text style={{fontSize: 8}}>{deriv?.derivations_lastname_especialists}</Text>
          </View>
        </View>

        {/* ESTUDIOS REALIZADOS */}
        <View style={styles.tableContainer}>
          <SectionHeader title="ESTUDIOS REALIZADOS" />
          <View style={{flexDirection: "row", padding: 3}}>
            <View style={{width: "33%"}}>
              {[
                {l: "RX Torax frente", v: studies?.rx_torax_frente},
                {
                  l: "RX Columna Lumbo-Sacra frente/perfil",
                  v: studies?.rx_columna_lumbo_sacra_frente,
                },
                {l: "RX Columna Cervical frente/perfil", v: studies?.rx_columna_cervical_frente},
                {l: "Electrocardiograma", v: studies?.electro},
                {l: "Audiometría", v: studies?.audiometria},
              ].map((item, i) => (
                <View key={i} style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                  <Text style={{fontSize: 7, flex: 1}}>{item.l}</Text>
                  <Checkbox value={item.v} />
                </View>
              ))}
            </View>
            <View style={{width: "33%", paddingLeft: 10}}>
              {[
                {l: "Psicotécnico", v: studies?.psicotecnico},
                {l: "Espirometría", v: studies?.espirometria},
                {l: "Ergometría", v: studies?.ergometria},
                {l: "Ev. Oftalmológica", v: studies?.evaluation_oftalmologica},
                {l: "Psicometría", v: studies?.psicometria},
              ].map((item, i) => (
                <View key={i} style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                  <Text style={{fontSize: 7, flex: 1}}>{item.l}</Text>
                  <Checkbox value={item.v} />
                </View>
              ))}
            </View>
            <View style={{width: "33%", paddingLeft: 10}}>
              {[
                {l: "Electroencefalograma", v: studies?.electroencefalograma},
                {l: "Laboratorio", v: studies?.laboratorio},
                {l: "Drogas de abuso", v: studies?.drogas_abuso},
                {l: "Test del cereal", v: studies?.test_cereal},
              ].map((item, i) => (
                <View key={i} style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                  <Text style={{fontSize: 7, flex: 1}}>{item.l}</Text>
                  <Checkbox value={item.v} />
                </View>
              ))}
            </View>
          </View>
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Observaciones: <Text style={{fontWeight: "normal"}}>{studies?.observations}</Text>
            </Text>
          </View>
        </View>
      </Page>

      {/* ========== PAGE 7: CUESTIONARIO DE RIESGO ========== */}
      <Page size="A4" style={styles.page}>
        <Header />

        {/* CUESTIONARIO PARA TRABAJADORES */}
        <View style={styles.tableContainer}>
          <SectionHeader title="CUESTIONARIO PARA TRABAJADORES EN ALTURA, CONDUCCIÓN DE VEHÍCULOS Y TRABAJOS EN ESPACIOS CONFINADOS" />
          <View style={[styles.row, styles.noBorderBottom]}>
            <View style={[styles.cell, styles.flex1]}>
              <Text style={styles.label}>
                Empresa: <Text style={{fontWeight: "normal"}}>{cuest?.company_name?.trim() || companyName}</Text>
              </Text>
            </View>
          </View>
          <View style={[styles.row, styles.noBorderBottom]}>
            <View style={[styles.cell, styles.flex1]}>
              <Text style={styles.label}>
                Apellido y nombre:{" "}
                <Text style={{fontWeight: "normal"}}>{cuest?.complete_name}</Text>
              </Text>
            </View>
            <View style={[styles.cell, styles.flex1]}>
              <Text style={styles.label}>
                DNI: <Text style={{fontWeight: "normal"}}>{cuest?.dni}</Text>
              </Text>
            </View>
            <View style={[styles.cell, styles.flex1]}>
              <Text style={styles.label}>
                Edad: <Text style={{fontWeight: "normal"}}>{cuest?.age ?? d?.age}</Text>
              </Text>
            </View>
            <View style={[styles.cell, styles.flex1, styles.lastCell]}>
              <Text style={styles.label}>
                Peso: <Text style={{fontWeight: "normal"}}>{cuest?.weight}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* DECLARACIÓN JURADA */}
        <View style={styles.tableContainer}>
          <SectionHeader title="DECLARACIÓN JURADA PARA COMPLETAR POR EL TRABAJADOR" />
          <View style={{padding: 3}}>
            <Text style={{fontSize: 7, fontStyle: "italic", marginBottom: 3}}>
              Tiene o tuvo en el último año
            </Text>
            <View style={{flexDirection: "row"}}>
              <View style={{width: "50%"}}>
                <SiNoHeaders />
                <SiNoItem
                  label="¿Mareos, vértigos o desmayos?"
                  value={ddjj?.last_year_mareos_vertigo_desmayos}
                />
                <SiNoItem label="¿Pico de presión arterial?" value={ddjj?.pico_presion_arterial} />
                <SiNoItem label="¿Golpe severo en el cráneo?" value={ddjj?.golpe_severo_craneo} />
                <SiNoItem
                  label="¿Trastornos depresivos o fobias?"
                  value={ddjj?.trastornos_depresivos_fobias}
                />
                <SiNoItem
                  label="¿Inseguridad trabajos en altura / espacios confinados?"
                  value={ddjj?.inseguridad_trabajos_altura}
                />
              </View>
              <View style={{width: "50%", paddingLeft: 10}}>
                <SiNoHeaders />
                <SiNoItem
                  label="¿Epilepsias y/o convulsiones?"
                  value={ddjj?.epilepsias_convulsiones}
                />
                <SiNoItem
                  label="¿Medicación neurológica / somnolencia?"
                  value={ddjj?.medicacion_neurologica}
                />
                <SiNoItem label="¿Hipoglucemia?" value={ddjj?.hipoglucemia} />
                <SiNoItem label="¿Caídas desde altura?" value={ddjj?.caidas} />
                <SiNoItem
                  label="¿Inseguridad conducción de vehículos?"
                  value={ddjj?.inseguridad_conduccion}
                />
              </View>
            </View>
          </View>
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Observaciones: <Text style={{fontWeight: "normal"}}>{ddjj?.observations}</Text>
            </Text>
          </View>
        </View>

        {/* EXAMEN NEUROLÓGICO */}
        <View style={styles.tableContainer}>
          <SectionHeader title="PARA COMPLETAR POR EL MÉDICO - EXAMEN NEUROLÓGICO" />
          <View style={{padding: 3}}>
            <Text style={{fontSize: 7, fontStyle: "italic", marginBottom: 3}}>
              Tiene o tuvo en el último año
            </Text>
            {/* Header */}
            <View style={{flexDirection: "row", marginBottom: 3}}>
              <View style={{flex: 1}} />
              <Text style={{fontSize: 7, fontWeight: "bold", width: 35, textAlign: "center"}}>
                Normal
              </Text>
              <Text style={{fontSize: 7, fontWeight: "bold", width: 35, textAlign: "center"}}>
                Anormal
              </Text>
              <Text style={{fontSize: 7, fontWeight: "bold", width: 120, textAlign: "center"}}>
                Describir
              </Text>
            </View>
            {[
              {
                l: "Prueba dedo - nariz",
                normal: neuroMed?.test_dedo_nariz_normal,
                anormal: neuroMed?.test_dedo_nariz_anormal,
                desc: neuroMed?.test_dedo_nariz_description,
              },
              {
                l: "Prueba de Romberg",
                normal: neuroMed?.test_romberg_normal,
                anormal: neuroMed?.test_romberg_anormal,
                desc: neuroMed?.test_romberg_description,
              },
              {
                l: "Prueba de seguimiento ocular",
                normal: neuroMed?.test_seguimiento_ocular_normal,
                anormal: neuroMed?.test_seguimiento_ocular_anormal,
                desc: neuroMed?.test_seguimiento_ocular_description,
              },
              {
                l: "Examen de miembro Sup. (Sensitivo y Motor)",
                normal: neuroMed?.exam_miembro_sup_normal,
                anormal: neuroMed?.exam_miembro_sup_anormal,
                desc: neuroMed?.exam_miembro_sup_description,
              },
              {
                l: "Examen de miembro Inf. (Sensitivo y Motor)",
                normal: neuroMed?.exam_miembro_inf_normal,
                anormal: neuroMed?.exam_miembro_inf_anormal,
                desc: neuroMed?.exam_miembro_inf_description,
              },
            ].map((item, i) => (
              <View key={i} style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                <Text style={[styles.label, {flex: 1}]}>{item.l}</Text>
                <View style={{width: 35, alignItems: "center"}}>
                  <Checkbox value={item.normal} />
                </View>
                <View style={{width: 35, alignItems: "center"}}>
                  <Checkbox value={item.anormal} />
                </View>
                <Text style={{fontSize: 7, width: 120}}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* EXAMEN OFTALMOLÓGICO */}
        <View style={styles.tableContainer}>
          <SectionHeader title="EXAMEN OFTALMOLÓGICO" />
          <View style={[styles.cyanHeader, {fontSize: 7}]}>
            <Text>Agudeza Visual</Text>
          </View>
          {/* Table header */}
          <View style={styles.row}>
            <Text style={[styles.cell, {width: 100, fontSize: 7, fontWeight: "bold"}]}> </Text>
            <Text
              style={[styles.cell, {flex: 1, fontSize: 7, fontWeight: "bold", textAlign: "center"}]}
            >
              OI
            </Text>
            <Text
              style={[styles.cell, {flex: 1, fontSize: 7, fontWeight: "bold", textAlign: "center"}]}
            >
              OD
            </Text>
            <Text
              style={[
                styles.cell,
                styles.lastCell,
                {flex: 1, fontSize: 7, fontWeight: "bold", textAlign: "center"},
              ]}
            >
              BINOCULAR
            </Text>
          </View>
          {[
            {
              l: "A. Visual Cercana",
              oi: oftalmoMed?.visual_cercana_oi,
              od: oftalmoMed?.visual_cercana_od,
              bino: oftalmoMed?.visual_cercana_binocular,
            },
            {
              l: "A. Visual Lejana",
              oi: oftalmoMed?.visual_lejana_oi,
              od: oftalmoMed?.visual_lejana_od,
              bino: oftalmoMed?.visual_lejana_binocular,
            },
            {
              l: "Discriminación de colores",
              oi: oftalmoMed?.discriminacion_colores_oi,
              od: oftalmoMed?.discriminacion_colores_od,
              bino: oftalmoMed?.discriminacion_colores_binocular,
            },
            {
              l: "Campimetría",
              oi: oftalmoMed?.campimetria_oi,
              od: oftalmoMed?.campimetria_od,
              bino: oftalmoMed?.campimetria_binocular,
            },
          ].map((item, i, arr) => (
            <View key={i} style={[styles.row, i === arr.length - 1 ? styles.noBorderBottom : {}]}>
              <Text style={[styles.cell, {width: 100, fontSize: 7}]}>{item.l}</Text>
              <Text style={[styles.cell, {flex: 1, fontSize: 7, textAlign: "center"}]}>
                {item.oi}
              </Text>
              <Text style={[styles.cell, {flex: 1, fontSize: 7, textAlign: "center"}]}>
                {item.od}
              </Text>
              <Text
                style={[styles.cell, styles.lastCell, {flex: 1, fontSize: 7, textAlign: "center"}]}
              >
                {item.bino}
              </Text>
            </View>
          ))}
          <View style={styles.obsRow}>
            <Text style={styles.label}>
              Dictamen: <Text style={{fontWeight: "normal"}}>{oftalmoMed?.dictamen}</Text>
            </Text>
          </View>
        </View>

        {/* PARA COMPLETAR POR EL MÉDICO */}
        <View style={styles.tableContainer}>
          <SectionHeader title="PARA COMPLETAR POR EL MÉDICO" />
          <View style={{padding: 5}}>
            <Text style={{fontSize: 8, marginBottom: 5}}>
              En las Evaluaciones realizadas en este formulario el día de la fecha:
            </Text>
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 3}}>
              <Checkbox value={cuest?.es_apto} />
              <Text style={{fontSize: 7, flex: 1, marginLeft: 3, fontWeight: "bold"}}>
                NO SE EVIDENCIAN LIMITACIONES PARA REALIZAR TRABAJO EN ALTURA, TRABAJO EN ESPACIOS
                CONFINADOS Y CONDUCCIÓN DE VEHÍCULOS.
              </Text>
            </View>
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 5}}>
              <Checkbox value={cuest?.no_es_apto} />
              <Text style={{fontSize: 7, flex: 1, marginLeft: 3, fontWeight: "bold"}}>
                SE EVIDENCIAN LIMITACIONES PARA REALIZAR TRABAJO EN ALTURA, TRABAJO EN ESPACIOS
                CONFINADOS Y CONDUCCIÓN DE VEHÍCULOS.
              </Text>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#000",
                minHeight: 40,
                padding: 3,
                marginBottom: 10,
              }}
            >
              <Text style={{fontSize: 7}}>{cuest?.observations}</Text>
            </View>

            {/* Firmas */}
            <View style={{flexDirection: "row", marginTop: 15}}>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#000",
                  padding: 5,
                  marginRight: 10,
                  minHeight: 60,
                }}
              >
                <Image src={respon?.url} />
                <Text style={{fontSize: 7, fontWeight: "bold", textAlign: "center"}}>
                  Firma y matrícula del médico responsable
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#000",
                  padding: 5,
                  minHeight: 60,
                }}
              >
                <Image src={patient?.url} />
                <Text style={{fontSize: 7, fontWeight: "bold", textAlign: "center"}}>
                  Firma y aclaración del trabajador
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* FIRMA DIGITAL Y MATRÍCULA */}
        <View style={[styles.tableContainer, {marginTop: 10}]}>
          <SectionHeader title="FIRMA DIGITAL Y MATRÍCULA" />
          <View
            style={{flexDirection: "row", marginTop: 15, paddingHorizontal: 10, paddingBottom: 15}}
          >
            {/* Médico Evaluador */}
            <View style={{flex: 1, paddingRight: 10}}>
              <Text style={{fontSize: 9, fontWeight: "bold"}}>
                Médico Evaluador <Text style={{fontWeight: "normal"}}>Firma y Matrícula</Text>
              </Text>
              {(medicalRecord as any).medical_record_evaluator_signatures?.url ||
              medicalRecord.medical_record_signatures?.url ||
              medicalRecord.firma_medico_evaluador ? (
                <Image
                  src={medicalRecord.medical_record_signatures?.url}
                  style={{width: 150, height: 50, marginTop: 5}}
                />
              ) : (
                <Text style={{fontSize: 9, fontWeight: "bold", marginTop: 10, marginBottom: 10}}>
                  Firma __________________
                </Text>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 5,
                  borderWidth: 1,
                  borderColor: "#000",
                  padding: 3,
                  width: "100%",
                }}
              >
                <Text style={{fontSize: 8}}>
                  Fecha: {formatDate(medicalRecord.medical_record_signatures?.created_at)}
                </Text>
              </View>
            </View>

            {/* Médico Laboral */}
            <View style={{flex: 1, paddingLeft: 10}}>
              <Text style={{fontSize: 9, fontWeight: "bold"}}>
                Médico Laboral <Text style={{fontWeight: "normal"}}>Firma y Matrícula</Text>
              </Text>
              {medicalRecord.medical_record_laboral_signatures?.url}
              <Image
                src={medicalRecord.medical_record_laboral_signatures?.url}
                style={{width: 150, height: 50, marginTop: 5}}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 5,
                  borderWidth: 1,
                  borderColor: "#000",
                  padding: 3,
                  width: "100%",
                }}
              >
                <Text style={{fontSize: 8}}>
                  Fecha: {formatDate(medicalRecord.medical_record_laboral_signatures?.created_at)}
                </Text>
              </View>
            </View>
            {/* Firma del trabajador */}
            <View style={{flex: 1, paddingLeft: 10, marginTop: 10}}>
              <Text style={{fontSize: 9, fontWeight: "bold"}}>Trabajador <Text style={{fontWeight: "normal"}}>Firma y aclaración</Text></Text>
              {patient?.url ? <Image src={patient.url} style={{width: 150, height: 50, marginTop: 5}} /> : <Text style={{fontSize: 9, fontWeight: "bold", marginTop: 10, marginBottom: 10}}>Firma __________________</Text>}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
