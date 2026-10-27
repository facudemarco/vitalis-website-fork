const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const output = {};
const source = fs.readFileSync(path.join(__dirname, '../src/lib/medicalRecordDefaults.ts'), 'utf8');
new Function('exports', ts.transpile(source, {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}))(output);
const {normalizeMedicalRecordDefaults: normalize, toMedicalBoolean} = output;

test('the No defaults displayed by the form are explicit false for printing and saving', () => {
  const original = {medical_record_previous_problems: {head_pain: null, seizures: true}, medical_record_laboral_contacts: {animal_products: 1}, medical_record_surgerys: {amigdala: 'false'}};
  const normalized = normalize(original);
  assert.equal(normalized.medical_record_previous_problems.head_pain, false);
  assert.equal(normalized.medical_record_previous_problems.seizures, true);
  assert.equal(normalized.medical_record_laboral_contacts.animal_products, true);
  assert.equal(normalized.medical_record_surgerys.amigdala, false);
  assert.equal(normalized.medical_record_surgerys.apendice, false);
  assert.equal(original.medical_record_previous_problems.head_pain, null);
});
test('printing fills only the defaults that the screen actually shows', () => {
  const record = normalize({}, true);
  assert.equal(record.medical_record_previous_problems.chest_pain, false);
  assert.equal(record.medical_record_laboral_contacts.noisy_environment, false);
  assert.equal(record.medical_record_surgerys.vesicula, false);
  assert.equal(record.medical_record_family_history.father_alive, undefined);
  assert.equal(record.medical_record_neuro_medical_exam, undefined);
  assert.equal(record.medical_record_recomendations, undefined);
  assert.equal(record.medical_record_personal_history.medications, undefined);
});
test('saving does not create clinical sections that have not been completed', () => {
  assert.deepEqual(normalize({medical_record_surgerys: null}), {medical_record_surgerys: null});
});
test('dates, text and explicit decisions are preserved', () => {
  const result = normalize({medical_record_surgerys: {apendice: true, apendice_date: '01/01/2001', others: null, others_description: 'Texto'}, medical_record_data: {age: '35'}});
  assert.equal(result.medical_record_surgerys.apendice, true);
  assert.equal(result.medical_record_surgerys.apendice_date, '01/01/2001');
  assert.equal(result.medical_record_surgerys.others, null);
  assert.equal(result.medical_record_data.age, '35');
});
test('all common boolean representations retain their actual value', () => {
  for (const value of [true, 1, '1', 'true']) assert.equal(toMedicalBoolean(value), true);
  for (const value of [false, 0, '0', 'false']) assert.equal(toMedicalBoolean(value), false);
  for (const value of [null, undefined, '', 'unknown']) assert.equal(toMedicalBoolean(value), undefined);
});
