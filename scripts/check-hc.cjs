const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32" && command.endsWith(".cmd"),
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const backend = path.resolve(root, "../backend-vitalis");
const python = path.join(
  backend,
  process.platform === "win32" ? "venv/Scripts/python.exe" : "venv/bin/python",
);
if (!fs.existsSync(python))
  throw new Error(
    "Falta el entorno Python del backend en ../backend-vitalis/venv. Consultá tests/HC-TESTS.md.",
  );
run(
  python,
  [
    "-m",
    "unittest",
    "discover",
    "-s",
    "tests",
    "-p",
    "test_medical_record_*.py",
  ],
  backend,
);
run(
  python,
  [
    "-m",
    "unittest",
    "discover",
    "-s",
    "tests",
    "-p",
    "test_patient_publication.py",
  ],
  backend,
);
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
run(npm, ["run", "test:hc:unit"]);
run(process.execPath, [
  "node_modules/typescript/bin/tsc",
  "--noEmit",
  "--incremental",
  "false",
]);
run(npm, ["run", "test:hc:web"]);
run(npm, ["run", "test:hc:audit"]);
console.log(
  "Suite HC completada. La revisión visual del PDF sigue siendo necesaria cuando cambia su diseño.",
);
