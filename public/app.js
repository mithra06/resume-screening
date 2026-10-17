const $=id=>document.getElementById(id);const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let reportText='';
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
$('analyze').onclick=()=>{try{const r=ResumeEngine.analyze($('resume').value,$('job').value);const rows=r.keywords.map(k=>[k.term,k.required,k.evidence.length?k.evidence.map(e=>e.section+': '+e.line).join('\n'):'No explicit evidence']);const gaps=r.keywords.map(k=>[k.term,k.required,k.evidence.length?'Yes — text mention only':'No explicit evidence',k.evidence.length?'Low':k.required==='Nice-to-have'?'Medium':'High',k.evidence.length?'Prepare to explain the cited work and your contribution.':'Study official documentation, then add and evaluate this capability in a relevant EXISTING project. Add it to your resume only after completing the work.']);const honesty=['No new projects, employers, metrics, or missing tools were inserted.','Be ready to explain each matched skill and your personal contribution; a text match does not prove proficiency.','Suggested summary and skills are proposed replacements. The source-preserving draft retains original sections for review.','Section detection and keyword coverage use a fixed vocabulary. Review unrecognized tools, ambiguous wording, and project ownership manually.','Requirement classifications use nearby wording and may need correction.'];const top=r.missing.slice(0,3).map(k=>'Learn and demonstrate '+k.term+' in a relevant existing project, then document the actual implementation.');while(top.length<3)top.push(['Add clearer evidence for the most important responsibilities.','Explain your individual contribution in existing project bullets.','Review the draft against the full job description.'][top.length]);const kw=table(['Skill / tool','Requirement','Where it appears'],rows);const responsibilities=r.responsibilities.length?'<h3>Responsibilities from the job description</h3><ul>'+r.responsibilities.map(s=>'<li>'+safe(s)+'</li>').join('')+'</ul>':'';$('report').innerHTML=card('01 / Keyword match',kw+responsibilities+(rows.length?'':'<p>No recognized technical terms found. Manual review is required.</p>'))+card('02 / Tailored resume','<pre>'+safe(r.draft)+'</pre>')+card('03 / Change log',table(['Section','Original','New','Why I changed it'],r.changes.map(c=>[c.section,c.original,c.new,c.why])))+card('04 / Tools and skills to learn',table(['Tool / skill','Requirement','Do I have it?','Priority','Fastest way to learn or show it'],gaps))+card('05 / Honesty check','<ul>'+honesty.map(s=>'<li>'+safe(s)+'</li>').join('')+'</ul>')+card('06 / Match score','<div class="score">'+(r.score===null?'N/A':r.score+'<small> / 10</small>')+'</div><p>Estimated keyword coverage only. This is not a recruiter assessment or a prediction of interview success.</p><ol>'+top.map(s=>'<li>'+safe(s)+'</li>').join('')+'</ol>');$('results').hidden=false;$('step2').classList.add('current');$('step3').classList.add('current');reportText=$('report').innerText;$('results').scrollIntoView({behavior:'smooth'});}catch(e){$('error').textContent=e.message;}};
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([reportText],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='aligned-resume-report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
