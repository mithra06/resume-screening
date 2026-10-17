const {test}=require('node:test');const assert=require('node:assert/strict');const {analyze,contains}=require('../public/engine');
test('requires both inputs',()=>assert.throws(()=>analyze('','Python')));
test('matches complete terms',()=>{assert.equal(contains('JavaScript','Java'),false);assert.equal(contains('Python, SQL','Python'),true)});
test('does not invent missing tools or metrics in resume',()=>{const r=analyze('Projects\nSearch\n- Built a Python service.','Required Python, RAG, LangChain');assert.equal(r.missing.length,2);assert.equal(r.draft.includes('LangChain'),false);assert.equal(r.draft.includes('RAG'),false);assert.equal(/\d/.test(r.draft),false)});
test('keeps bullets with original project',()=>{const r=analyze('Projects\nAlpha\n- Built SQL storage.\n- Built Python service.\nBeta\n- Built Python API.','Required Python');assert.ok(r.draft.indexOf('- Built Python service.')<r.draft.indexOf('- Built SQL storage.'));assert.ok(r.draft.indexOf('Beta')<r.draft.indexOf('- Built Python API.'))});
test('no keyword score without recognized vocabulary',()=>assert.equal(analyze('Writer','Editorial expert').score,null));
