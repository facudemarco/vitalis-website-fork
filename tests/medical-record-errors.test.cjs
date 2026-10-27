const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/lib/medicalRecordErrors.ts'), 'utf8');
const output = {};
new Function('exports', ts.transpile(source, {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}))(output);
const message = output.getMedicalRecordErrorMessage;

test('schema failure asks administration to update rather than blaming form fields', () => {
  const text = message({response: {status: 503, data: {detail: {code: 'medical_record_schema_outdated'}}}});
  assert.match(text, /base de datos necesita una actualización/);
  assert.match(text, /datos ingresados se conservaron/);
});
test('raw SQL error and clinical values are not shown for server failures', () => {
  const text = message({response: {status: 500, data: {detail: 'INSERT INTO medical_record VALUES (private-clinical-data)'}}});
  assert.match(text, /servidor/);
  assert.doesNotMatch(text, /INSERT|private-clinical/);
});
test('expired session is distinguished from form validation', () => {
  assert.match(message({response: {status: 401}}), /sesión venció/);
});
test('network failures tell the user to check the connection', () => {
  assert.match(message({}), /Revisá la conexión/);
});
test('validation errors show the field-specific explanation', () => {
  assert.match(message({response: {status: 422, data: {detail: {fields: [{field: 'sector', message: 'Sector admite hasta 255 caracteres.'}]}}}}), /Sector admite hasta 255 caracteres/);
});

test('expired medical save keeps the form mounted while other unauthorized requests redirect', async () => {
  let onError;
  const removed = [];
  const oldWindow = global.window;
  const oldStorage = global.localStorage;
  global.window = {location: {pathname: '/system/medical-history/patient', href: ''}};
  global.localStorage = {removeItem: (key) => removed.push(key)};
  try {
    const code = fs.readFileSync(path.join(__dirname, '../src/lib/axios.ts'), 'utf8');
    const fakeAxios = {create: () => ({interceptors: {response: {use: (_success, failure) => {onError = failure;}}}})};
    new Function('require', 'exports', ts.transpile(code, {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}))(() => fakeAxios, {});
    const expiredSave = {response: {status: 401}, config: {url: '/medical-records/record', method: 'put'}};
    await assert.rejects(onError(expiredSave));
    assert.equal(global.window.location.href, '');
    assert.deepEqual(removed, []);
    await assert.rejects(onError({response: {status: 401}, config: {url: '/patients/', method: 'get'}}));
    assert.equal(global.window.location.href, '/login');
  } finally {
    global.window = oldWindow;
    global.localStorage = oldStorage;
  }
});
