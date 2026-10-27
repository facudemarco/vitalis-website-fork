// Discovers the form's literal field names from TypeScript, then changes each
// value independently in the actual PDF component. Exits nonzero on omissions.
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { loadPDF, root } = require("../tests/helpers/medical-pdf.cjs");

async function audit() {
  const source = ts.createSourceFile(
    "types.ts",
    fs.readFileSync(path.join(root, "src/types.ts"), "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const interfaces = new Map(
    source.statements
      .filter(ts.isInterfaceDeclaration)
      .map((n) => [n.name.text, n]),
  );
  const page = fs.readFileSync(
    path.join(root, "src/app/system/medical-history/[id]/page.tsx"),
    "utf8",
  );
  const dir = path.join(
    root,
    "src/app/system/medical-history/components/sections",
  );
  const forms = fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".tsx") && !n.startsWith("Cuestionario"))
    .map((n) => ({
      name: n,
      text: fs.readFileSync(path.join(dir, n), "utf8"),
    }));
  const pdf = await loadPDF();
  const fields = [];
  for (const section of interfaces.get("MedicalRecord").members) {
    const key = section.name?.getText(source);
    if (!page.includes(`registry.register("${key}"`)) continue;
    const type = section.type.getText(source).split("|")[0].trim();
    const model = interfaces.get(type);
    if (!model) continue;
    const files = forms.filter((f) => f.text.includes(type));
    for (const field of model.members) {
      const name = field.name?.getText(source);
      if (["id", "medical_record_id", "created_at"].includes(name)) continue;
      if (
        !files.some(
          (f) => f.text.includes(`"${name}"`) || f.text.includes(`'${name}'`),
        )
      )
        continue;
      fields.push({
        section: key,
        name,
        type: field.type.getText(source),
        forms: files.map((f) => f.name),
      });
    }
  }
  const populated = {};
  for (const f of fields) {
    populated[f.section] ??= {};
    populated[f.section][f.name] = f.type.includes("boolean")
      ? true
      : f.name.includes("date")
        ? "2020-06-15"
        : f.name === "education_level"
          ? "Primarios"
          : f.type.includes("number")
            ? 123
            : "PRUEBA";
  }
  const fingerprint = (record) => JSON.stringify(pdf.tree(record));
  const missing = [];
  for (const f of fields) {
    const before = structuredClone(populated),
      after = structuredClone(populated);
    before[f.section][f.name] = f.type.includes("boolean") ? false : null;
    if (fingerprint(before) === fingerprint(after)) missing.push(f);
  }
  const report = {
    checked: fields.length,
    missing,
    note: "Audita campos literales del formulario. No sustituye revisión visual ni verifica campos dinámicos no enumerados.",
  };
  if (process.env.HC_PDF_OUTPUT) {
    fs.mkdirSync(process.env.HC_PDF_OUTPUT, { recursive: true });
    await pdf.renderer.renderToFile(
      pdf.tree(populated),
      path.join(process.env.HC_PDF_OUTPUT, "hc-coverage.pdf"),
    );
  }
  const output = path.join(root, "test-results/hc-print-coverage.json");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(
    `HC: ${fields.length} campos auditados; ${missing.length} sin efecto en el PDF. Informe: ${output}`,
  );
  for (const f of missing) console.error(`  ${f.section}.${f.name}`);
  if (missing.length) process.exitCode = 1;
}
audit().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
