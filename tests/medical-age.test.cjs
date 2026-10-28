const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const output={};
new Function('exports',ts.transpile(fs.readFileSync(path.join(__dirname,'../src/lib/medicalAge.ts'),'utf8'),{module:ts.ModuleKind.CommonJS}))(output);
const {parseMedicalAge:parse,formatMedicalAge:format}=output;
test('ages with year suffix normalize without widening storage',()=>{
  for(const [value,expected] of [['28 años','28'],['1 año','1'],['150 AÑOS','150'],['28años','28'],[' 28 años ','28'],['35','35']]) assert.equal(parse(value),expected);
  assert.equal(parse(''),null);
  assert.equal(format('28'),'28 años');
  assert.equal(format('28 años'),'28 años');
  assert.equal(format('1'),'1 año');
  assert.equal(format(null),'');
});
test('invalid or out-of-range ages are rejected',()=>{
  for(const value of ['0 años','151 años','28 meses','28.5 años','01 años','-1','abc',28]) assert.throws(()=>parse(value));
});
