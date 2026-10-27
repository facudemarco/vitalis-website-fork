const { test, before } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadPDF, root } = require("./helpers/medical-pdf.cjs");
let pdf;
before(async () => {
  pdf = await loadPDF();
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
