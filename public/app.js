const $=id=>document.getElementById(id);const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let reportText='';let resumeText='';
for(const id of ['resume','job'])$(id).addEventListener('input',()=>{$(id+'-count').textContent=($(id).value.trim().match(/\S+/g)||[]).length+' words';$('error').textContent='';});
$('sample').onclick=()=>{$('resume').value=`Jordan Davis
AI Engineer

Summary
Software engineer building machine learning applications.

Skills
Python, SQL, FastAPI, scikit-learn, Docker, Git

Experience
Software Engineer | Atlas Labs
- Responsible for building REST APIs with FastAPI and Python.
- Worked on SQL data pipelines for model training.
- Built classification models with scikit-learn.

Projects
Document Search Assistant
- Built a document retrieval service with Python.
- Containerized the service with Docker.

Education
B.S. Computer Science`;$('job').value=`AI / GenAI Engineer
Required skills: Python, FastAPI, SQL, Docker, RAG, LangChain, LLM, Evaluation.
Build and deploy retrieval-augmented applications.
Develop reliable APIs and evaluate generated answers.
Collaborate with engineers on testing and deployment.
Nice-to-have: AWS, Kubernetes, Hugging Face.`;['resume','job'].forEach(id=>$(id).dispatchEvent(new Event('input')));};
function table(headers,rows){return '<table><thead><tr>'+headers.map(h=>'<th>'+safe(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+safe(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'}
function card(title,body){return '<article class="report-card"><h2>'+title+'</h2>'+body+'</article>'}
$('analyze').onclick=()=>{try{const r=ResumeEngine.analyze($('resume').value,$('job').value);const rows=r.keywords.map(k=>[k.term,k.required,k.evidence.length?k.evidence.map(e=>e.section+': '+e.line).join('\n'):'No explicit evidence']);const gaps=r.keywords.map(k=>[k.term,k.required,k.evidence.length?'Yes — text mention only':'No explicit evidence',k.evidence.length?'Low':k.required==='Nice-to-have'?'Medium':'High',k.evidence.length?'Prepare to explain the cited work and your contribution.':'Study official documentation, then add and evaluate this capability in a relevant EXISTING project. Add it to your resume only after completing the work.']);const honesty=['No new projects, employers, metrics, or missing tools were inserted.','Be ready to explain each matched skill and your personal contribution; a text match does not prove proficiency.','The rewritten resume replaces labeled summary text and preserves original skills and project ownership. Review the editable resume before downloading.','Section detection and keyword coverage use a fixed vocabulary. Review unrecognized tools, ambiguous wording, and project ownership manually.','Requirement classifications use nearby wording and may need correction.'];const top=r.missing.slice(0,3).map(k=>'Learn and demonstrate '+k.term+' in a relevant existing project, then document the actual implementation.');while(top.length<3)top.push(['Add clearer evidence for the most important responsibilities.','Explain your individual contribution in existing project bullets.','Review the draft against the full job description.'][top.length]);const kw=table(['Skill / tool','Requirement','Where it appears'],rows);const responsibilities=r.responsibilities.length?'<h3>Responsibilities from the job description</h3><ul>'+r.responsibilities.map(s=>'<li>'+safe(s)+'</li>').join('')+'</ul>':'';$('report').innerHTML=card('01 / Keyword match',kw+responsibilities+(rows.length?'':'<p>No recognized technical terms found. Manual review is required.</p>'))+card('02 / Tailored resume','<p>Review and edit this resume before downloading. Only this text is included in the PDF.</p><textarea id="tailored-resume" aria-label="Editable tailored resume">'+safe(r.draft)+'</textarea>')+card('03 / Change log',table(['Section','Original','New','Why I changed it'],r.changes.map(c=>[c.section,c.original,c.new,c.why])))+card('Project changes — existing projects only',r.projectChanges.length?table(['Project','Original','Rewritten','Reason'],r.projectChanges.map(c=>[c.project||'Existing project',c.original,c.new,c.why])):'<p>No project bullet edits or reordering were needed, or no clearly labeled Projects section was detected. No new projects or unverified tools were added.</p>')+card('04 / Tools and skills to learn',table(['Tool / skill','Requirement','Do I have it?','Priority','Fastest way to learn or show it'],gaps))+card('05 / Honesty check','<ul>'+honesty.map(s=>'<li>'+safe(s)+'</li>').join('')+'</ul>')+card('06 / Match score','<div class="score">'+(r.score===null?'N/A':r.score+'<small> / 10</small>')+'</div><p>Estimated keyword coverage only. This is not a recruiter assessment or a prediction of interview success.</p><ol>'+top.map(s=>'<li>'+safe(s)+'</li>').join('')+'</ol>');$('results').hidden=false;$('step2').classList.add('current');$('step3').classList.add('current');resumeText=r.draft;$('download-pdf').disabled=false;reportText=$('report').innerText;$('results').scrollIntoView({behavior:'smooth'});}catch(e){$('error').textContent=e.message;}};
$('download').onclick=()=>{reportText=$('report').innerText+'\n\nTAILORED RESUME\n'+$('tailored-resume').value;const url=URL.createObjectURL(new Blob([reportText],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='aligned-resume-report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};

$('resume-file').addEventListener('change',async()=>{
 const file=$('resume-file').files[0];if(!file)return;
 const extension=file.name.split('.').pop().toLowerCase();
 if(!['pdf','docx','txt'].includes(extension)||file.size>10*1024*1024){$('upload-status').textContent='Choose a PDF, DOCX, or TXT file up to 10 MB.';$('resume-file').value='';return;}
 $('upload-status').textContent='Reading '+file.name+'…';$('analyze').disabled=true;$('resume-file').disabled=true;
 try{const response=await fetch('/api/upload',{method:'POST',headers:{'X-File-Extension':extension},body:file});const result=await response.json();if(!response.ok)throw Error(result.error);$('resume').value=result.text;$('resume').dispatchEvent(new Event('input'));$('upload-status').textContent='Loaded '+file.name+'. Check the extracted text and fix formatting before analyzing.';}
 catch(error){$('upload-status').textContent=error.message;}
 finally{$('analyze').disabled=false;$('resume-file').disabled=false;$('resume-file').value='';}
});
$('download-pdf').onclick=async()=>{
 const button=$('download-pdf');button.disabled=true;button.textContent='Creating PDF…';
 try{resumeText=$('tailored-resume').value;const response=await fetch('/api/resume.pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:resumeText})});if(!response.ok){const data=await response.json();throw Error(data.error);}const url=URL.createObjectURL(await response.blob());const a=document.createElement('a');a.href=url;a.download='tailored-resume.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 catch(error){$('error').textContent=error.message;$('error').scrollIntoView({behavior:'smooth'});}
 finally{button.disabled=false;button.textContent='Download resume PDF ↓';}
};
