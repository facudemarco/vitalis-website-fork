const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const source = fs.readFileSync(
  path.join(__dirname, "../src/services/authService.ts"),
  "utf8",
);
test("verifyToken requires valid true in the response, not only HTTP success", async () => {
  for (const data of [{ valid: false }, {}, { valid: true }]) {
    const output = {};
    new Function(
      "require",
      "exports",
      ts.transpile(source, {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      }),
    )(() => ({ apiClient: { get: async () => ({ data }) } }), output);
    assert.equal(await output.authService.verifyToken(), data.valid === true);
  }
});
