(function(root){
const dictionary=['Python','JavaScript','TypeScript','Java','C++','SQL','PyTorch','TensorFlow','scikit-learn','Pandas','NumPy','Hugging Face','Transformers','LangChain','LlamaIndex','OpenAI','GPT','LLM','RAG','GenAI','Generative AI','Machine Learning','Deep Learning','NLP','Natural Language Processing','Embeddings','Vector Database','Pinecone','FAISS','Chroma','Weaviate','Fine-tuning','Prompt Engineering','Evaluation','MLOps','Docker','Kubernetes','AWS','Azure','GCP','FastAPI','Flask','Django','React','Node.js','Git','CI/CD','REST','API','Data Pipelines','ETL','Spark','Airflow','Deployment','Monitoring','Testing','Security','Collaboration','Communication','Leadership','Research'];
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function contains(text,term){return new RegExp('(^|[^a-z0-9])'+escape(term).replace(/[ -]/g,'[ -]?')+'(?=$|[^a-z0-9])','i').test(text)}
function analyze(resume,job){
 if(!resume.trim()||!job.trim())throw Error('Add both your resume and the job description to continue.');
 const lines=resume.split('\n').map(s=>s.trim()).filter(Boolean);
 let section='Header', project=''; const entries=lines.map(line=>{if(/^(summary|profile|professional summary|skills|technical skills|experience|work experience|professional experience|projects|personal projects|education|certifications)\s*:?$/i.test(line)){section=line.replace(/:$/,'');project='';}else if(/projects/i.test(section)&&!/^[-•*]\s/.test(line))project=line;return {line,section,project}});
 const terms=dictionary.filter(t=>contains(job,t));
 const keywords=terms.map(term=>{const evidence=entries.filter(e=>contains(e.line,term));const context=job.split(/[\n.!?]+/).filter(s=>contains(s,term)).join(' ');return {term,evidence,required:/preferred|nice.to.have|bonus|desirable/i.test(context)?'Nice-to-have':/must|required|essential|minimum/i.test(context)?'Required':'Mentioned; confirm requirement'}});
 const matched=keywords.filter(k=>k.evidence.length),missing=keywords.filter(k=>!k.evidence.length);
 const changes=[];
 const rewritten=entries.map(e=>{let line=e.line;if(/^[-•*]\s/.test(line)){line=line.replace(/^([-•*]\s+)(responsible for\s+|helped (?:to )?)/i,'$1').replace(/^([-•*]\s+)worked on\s+/i,'$1Contributed to ');line=line.replace(/^([-•*]\s+)([a-z])/,(_,b,c)=>b+c.toUpperCase());}if(line!==e.line)changes.push({section:e.section,project:e.project,original:e.line,new:line,why:'Remove weak phrasing while preserving the original claim.'});return {...e,new:line,weight:matched.filter(k=>contains(line,k.term)).length}});
 // Reorder only contiguous bullet groups, never move a bullet under another employer or project.
 const output=[];for(let i=0;i<rewritten.length;){if(/^[-•*]\s/.test(rewritten[i].new)){let j=i;while(j<rewritten.length&&/^[-•*]\s/.test(rewritten[j].new))j++;const group=rewritten.slice(i,j);const sorted=[...group].sort((a,b)=>b.weight-a.weight);if(sorted.some((e,n)=>e!==group[n]))changes.push({section:group[0].section,project:group[0].project,original:group.map(e=>e.line).join('\n'),new:sorted.map(e=>e.new).join('\n'),why:'Prioritize job-relevant bullets within the same existing role or project.'});output.push(...sorted.map(e=>e.new));i=j;}else{output.push(rewritten[i].new);i++;}}
 const summary=matched.length?'Relevant technical background includes '+matched.slice(0,6).map(k=>k.term).join(', ')+'.':'Review your existing summary against the role; no recognized technical keyword overlap was found.';
 // Replace labeled summary blocks; preserve existing skills and add only evidenced matches.
 const clean=[]; let current='Header'; let skipSummary=false; let hasSummary=false; let hasSkills=false;
 const heading=/^(summary|profile|professional summary|skills|technical skills|experience|work experience|professional experience|projects|personal projects|education|certifications)\s*:?$/i;
 for(const line of output){
  if(heading.test(line)){
   current=line.replace(/:$/,'');skipSummary=/summary|profile/i.test(current)&&matched.length>0;
   clean.push('\n'+line);
   if(skipSummary){clean.push(summary);hasSummary=true;}
   if(/skills/i.test(current)){hasSkills=true;if(matched.length)clean.push('Relevant to this role: '+matched.map(k=>k.term).join(', '));}
  } else if(!skipSummary)clean.push(line);
 }
 const firstSection=clean.findIndex(line=>line.startsWith('\n'));
 const additions=[];
 if(!hasSummary&&matched.length)additions.push('\nSummary',summary);
 if(!hasSkills&&matched.length)additions.push('\nSkills',matched.map(k=>k.term).join(', '));
 if(additions.length)clean.splice(firstSection<0?clean.length:firstSection,0,...additions);
 const draft=clean.join('\n').trim();
 const projectChanges=changes.filter(c=>/projects/i.test(c.section));
 changes.unshift({section:'Suggested summary',original:entries.filter(e=>/summary|profile/i.test(e.section)).map(e=>e.line).join(' ')||'No clearly labeled summary found.',new:summary,why:'Highlight only technical terms that also appear in the source resume.'});
 changes.push({section:'Suggested skills',original:'Skills mentioned throughout the source resume.',new:matched.map(k=>k.term).join(', ')||'No recognized matches.',why:'Surface job-relevant terms with source evidence. Missing tools remain in the learning plan.'});
 const score=terms.length?Math.round(matched.length/terms.length*100)/10:null;
 return {keywords,matched,missing,changes,projectChanges,draft,score,responsibilities:job.split('\n').map(s=>s.trim()).filter(s=>/build|develop|design|deploy|evaluate|maintain|collaborat|implement|optimiz|responsib/i.test(s)).slice(0,8)};
}
if(typeof module!=='undefined')module.exports={analyze,contains};else root.ResumeEngine={analyze,contains};
})(typeof window!=='undefined'?window:globalThis);
