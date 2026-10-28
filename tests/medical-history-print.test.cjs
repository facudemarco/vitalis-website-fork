const { test, before } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadPDF, root } = require("./helpers/medical-pdf.cjs");
let pdf;
before(async () => {
  pdf = await loadPDF();
});

test('clinical measurements print their units without repeating suffixes', () => {
  for (const record of [
    {talla:175,peso:80,saturacion:99,imc:20.15,ta_min:80,ta_max:120},
    {talla:'175cm',peso:'80kg',saturacion:'99%',imc:'20,15',ta_min:'80mmhg',ta_max:'120mmHg'},
  ]) {
    const text=pdf.text(pdf.tree({medical_record_clinical_exam:record}));
    for(const value of ['175 cm','80 kg','99 %','20.15','80 mmHg','120 mmHg']) assert.ok(text.includes(value),value);
    assert.ok(!text.includes('kg kg'));
  }
});

test('physical examination has a checkbox in the studies section', () => {
  const selected=pdf.text(pdf.tree({medical_record_studies:{examen_fisico:true}}));
  const unchecked=pdf.text(pdf.tree({medical_record_studies:{examen_fisico:false}}));
  assert.ok(selected.includes('Examen físicoX'));
  assert.ok(!unchecked.includes('Examen físicoX'));
  assert.ok(selected.indexOf('Examen físico')>selected.indexOf('ESTUDIOS REALIZADOS'));
  assert.ok(!selected.includes('ESTUDIOS REALIZADOS - COMPLEMENTO'));
});

test('landscape, portrait, square and panoramic photos fit the same frame without cropping', async () => {
  const {photoFixture}=require('./helpers/photo-fixture.cjs');
  function images(node) {
    if(!node || typeof node!=='object') return [];
    if(Array.isArray(node)) return node.flatMap(images);
    return [...(node.type==='IMAGE'?[node]:[]),...images(node.props?.children)];
  }
  for(const [name,width,height] of [['landscape',480,270],['portrait',270,480],['square',320,320],['panorama',1600,100]]) {
    const src=photoFixture(width,height);
    const record={medical_record_data:{complete_name:'Paciente ficticio',company_name:'Empresa ficticia',sector:'Sector ficticio',age:'35'},medical_record_data_img:{url:src},medical_record_clinical_exam:{talla:175,peso:80,saturacion:99,imc:20.15,ta_min:80,ta_max:120},medical_record_studies:{examen_fisico:true}};
    const tree=pdf.tree(record);
    const image=images(tree).find(node=>node.props.src===src);
    assert.ok(image);
    function frames(node) {
      if(!node || typeof node!=='object') return [];
      if(Array.isArray(node)) return node.flatMap(frames);
      return [...(node.type==='VIEW' && node.props.style?.overflow==='hidden' ? [node] : []), ...frames(node.props?.children)];
    }
    const frame=frames(tree).find(node=>images(node).some(item=>item.props.src===src));
    assert.ok(frame);
    assert.equal(frame.props.style.width,'40%');
    assert.equal(image.props.style.objectFit,'contain');
    assert.equal(image.props.style.width,'100%');
    assert.equal(image.props.style.height,125);
    const buffer=await pdf.renderer.renderToBuffer(tree);
    assert.equal(buffer.subarray(0,5).toString(),'%PDF-');
    if(process.env.HC_PDF_OUTPUT) {
      fs.mkdirSync(process.env.HC_PDF_OUTPUT,{recursive:true});
      fs.writeFileSync(path.join(process.env.HC_PDF_OUTPUT,`hc-photo-${name}.pdf`),buffer);
    }
  }
});

test("legacy risk answers never add the removed questionnaire to the HC", () => {
  const text = pdf.text(
    pdf.tree({
      medical_record_cuestionario_riesgos: {
        complete_name: "RISK_ONLY_MARKER",
        observations: "RISK_ONLY_MARKER",
      },
      medical_record_ddjj: { observations: "RISK_ONLY_MARKER" },
    }),
  );
  assert.doesNotMatch(
    text,
    /CUESTIONARIO PARA TRABAJADORES|DECLARACIÓN JURADA PARA COMPLETAR|RISK_ONLY_MARKER/,
  );
  assert.match(text, /FIRMA DIGITAL Y MATRÍCULA/);
  assert.match(text, /Médico Evaluador/);
  assert.match(text, /Médico Laboral/);
  assert.match(text, /Trabajador/);
  const page = fs.readFileSync(
    path.join(root, "src/app/system/medical-history/[id]/page.tsx"),
    "utf8",
  );
  assert.doesNotMatch(page, /<CuestionarioRiesgoSection/);
});

for (const description of [
  "Cesáreas",
  "Cirugía con descripción extensa. ".repeat(35),
]) {
  test(`other surgery detail is printed without truncation (${description.length} characters)`, () => {
    const text = pdf.text(
      pdf.tree({
        medical_record_surgerys: {
          others: true,
          others_description: description,
          others_date: "2020-06-15",
        },
      }),
    );
    assert.ok(text.includes(description));
    assert.match(text, /Otras cirugías:/);
    assert.ok(text.includes(new Date("2020-06-15").toLocaleDateString()));
  });
}

test("No or an unanswered other-surgery decision does not disclose stale detail", () => {
  for (const others of [false, null, undefined]) {
    assert.ok(
      !pdf
        .text(
          pdf.tree({
            medical_record_surgerys: {
              others,
              others_description: "STALE_SURGERY",
            },
          }),
        )
        .includes("STALE_SURGERY"),
    );
  }
});

test("company fallback, age, sector and education survive the print path", () => {
  const text = pdf.text(
    pdf.tree(
      {
        medical_record_data: {
          company_name: "",
          complete_name: "PACIENTE FICTICIO",
          age: "150",
          education_level: "Terciarios",
          sector: "SECTOR_FICTICIO",
        },
      },
      "Adecco",
    ),
  );
  for (const expected of [
    "Adecco",
    "150",
    "Terciarios",
    "SECTOR_FICTICIO",
    "PACIENTE FICTICIO",
  ])
    assert.ok(text.includes(expected), expected);
});

test("the production PDF renderer accepts empty, populated and long surgery records", async () => {
  const output = process.env.HC_PDF_OUTPUT;
  if (output) fs.mkdirSync(output, { recursive: true });
  for (const [name, record] of Object.entries({
    empty: {},
    surgery: {
      medical_record_surgerys: { others: true, others_description: "Cesáreas" },
    },
    long: {
      medical_record_surgerys: {
        others: true,
        others_description:
          "Texto de prueba de una cirugía con detalle extendido. ".repeat(35),
      },
    },
  })) {
    const buffer = await pdf.renderer.renderToBuffer(pdf.tree(record));
    assert.equal(buffer.subarray(0, 5).toString(), "%PDF-");
    assert.ok(buffer.length > 10000);
    if (output) fs.writeFileSync(path.join(output, `hc-${name}.pdf`), buffer);
  }
});

test('age in the PDF includes years once, with singular and plural',()=>{
  for(const [age,expected] of [['28','28 años'],['28 años','28 años'],['1','1 año'],['150 años','150 años']]) {
    const text=pdf.text(pdf.tree({medical_record_data:{age}}));
    assert.ok(text.includes(expected));
    assert.ok(!text.includes('años años'));
  }
});
