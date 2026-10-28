const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const output = {};
new Function('exports', ts.transpile(fs.readFileSync(path.join(__dirname,'../src/lib/clinicalMeasurements.ts'),'utf8'), {module:ts.ModuleKind.CommonJS}))(output);
const {parseClinicalMeasurement: parse, formatClinicalMeasurement: format} = output;

test('units are accepted and canonical numbers print with their fixed unit', () => {
  for (const [field,value,number,printed] of [['talla','175cm',175,'175 cm'],['peso','80 KG',80,'80 kg'],['saturacion','99%',99,'99 %'],['imc','20,15',20.15,'20.15'],['ta_min','80mmhg',80,'80 mmHg'],['ta_max','120 mmHg',120,'120 mmHg']]) {
    assert.equal(parse(field,value),number);
    assert.equal(format(field,number),printed);
    assert.equal(format(field,value),printed);
  }
});
test('BMI precision, empty inputs and legacy numbers', () => {
  for(const value of [20,20.1,20.15,'20','20,1','20.15']) assert.equal(parse('imc',value),Number(String(value).replace(',','.')));
  assert.equal(parse('peso',' '),null);
  assert.equal(format('peso',null),'');
  assert.equal(format('peso',0),'0 kg');
  for(const [field,value] of [['imc','20.123'],['peso','80cm'],['talla','175kg'],['ta_max','120/80'],['peso',NaN],['peso',true],['peso',-1]]) assert.throws(()=>parse(field,value));
});
