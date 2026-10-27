const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const { pathToFileURL } = require("node:url");
const root = path.resolve(__dirname, "../..");

function compile(relative, dependencies = {}) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  const output = {};
  const code = ts.transpile(source, {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.React,
    esModuleInterop: true,
  });
  new Function("require", "exports", code)(
    (id) => dependencies[id] ?? require(id),
    output,
  );
  return output;
}

async function loadPDF() {
  const renderer = await import(
    pathToFileURL(require.resolve("@react-pdf/renderer")).href
  );
  const defaults = compile("src/lib/medicalRecordDefaults.ts");
  const { MedicalHistoryPDF } = compile(
    "src/app/system/medical-history/components/MedicalHistoryPDF.tsx",
    {
      "@react-pdf/renderer": renderer,
      "@/lib/medicalRecordDefaults": defaults,
    },
  );
  const logo =
    "data:image/png;base64," +
    fs.readFileSync(path.join(root, "public/logo.png")).toString("base64");
  function resolve(node) {
    if (node == null || typeof node === "boolean") return null;
    if (Array.isArray(node))
      return node.map((child, index) => {
        const resolved = resolve(child);
        return React.isValidElement(resolved)
          ? React.cloneElement(resolved, { key: child?.key ?? index })
          : resolved;
      });
    if (typeof node !== "object") return node;
    if (typeof node.type === "function") return resolve(node.type(node.props));
    const { children, ...props } = node.props;
    if (props.src === "/logo.png") props.src = logo;
    return React.createElement(
      node.type,
      { ...props, key: node.key ?? undefined },
      resolve(children),
    );
  }
  const tree = (record, company) =>
    resolve(
      React.createElement(MedicalHistoryPDF, {
        medicalRecord: record,
        patientCompanyName: company,
      }),
    );
  const text = (node) => {
    if (node == null || typeof node === "boolean") return "";
    if (Array.isArray(node)) return node.map(text).join("");
    if (typeof node !== "object") return String(node);
    return text(node.props.children);
  };
  return { tree, text, renderer };
}
module.exports = { loadPDF, root };
