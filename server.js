const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
async function extractPdf(buffer) {
 const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
 const task=getDocument({data:new Uint8Array(buffer),isEvalSupported:false,useSystemFonts:true});
 const document=await task.promise;
 try {
  const pages=[];
  for(let pageNumber=1;pageNumber<=document.numPages;pageNumber++) {
   const page=await document.getPage(pageNumber);const content=await page.getTextContent();
   let text='',lastY;
   for(const item of content.items){if(!('str' in item))continue;const y=item.transform[5];if(lastY!==undefined&&Math.abs(y-lastY)>2&&!text.endsWith('\n'))text+='\n';text+=item.str;if(item.hasEOL)text+='\n';else text+=' ';lastY=y;}
   pages.push(text);
  }
  return {text:pages.join('\n\n'),numpages:document.numPages};
 } finally {await task.destroy();}
}
const mammoth = require('mammoth');
const PDFDocument = require('pdfkit');
const root = path.join(__dirname, 'public');
async function readBody(req, limit = 10 * 1024 * 1024) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) { const error = new Error('File is too large. Maximum size is 10 MB.'); error.status = 413; throw error; }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
function json(res, status, data) { res.writeHead(status, {'Content-Type':'application/json'}); res.end(JSON.stringify(data)); }
function createServer() {
 return http.createServer(async (req,res)=>{
  try {
   const url = new URL(req.url, 'http://localhost');
   if (req.method === 'POST' && url.pathname === '/api/upload') {
    const type = String(req.headers['x-file-extension'] || '').toLowerCase();
    if (!['pdf','docx','txt'].includes(type)) return json(res,400,{error:'Choose a PDF, DOCX, or TXT file. Legacy DOC files are not supported.'});
    const buffer = await readBody(req);
    if (!buffer.length) return json(res,400,{error:'The file is empty.'});
    let text;
    try {
     if(type==='pdf') text=(await extractPdf(buffer)).text;
     else if(type==='docx') text=(await mammoth.extractRawText({buffer})).value;
     else {if(buffer.includes(0)) throw Error(); text=new TextDecoder('utf-8',{fatal:true}).decode(buffer);}
    } catch {return json(res,422,{error:'Unable to read this file. Use an unencrypted PDF, a valid DOCX, or UTF-8 TXT file, or paste your resume instead.'});}
    if(!text.trim()) return json(res,422,{error:'No selectable text found. Scanned PDFs need OCR first. You can paste the resume text instead.'});
    return json(res,200,{text:text.trim()});
   }
   if(req.method==='POST' && url.pathname==='/api/resume.pdf') {
    let data; try{data=JSON.parse((await readBody(req,512*1024)).toString());}catch{return json(res,400,{error:'Invalid resume data.'});}
    if(typeof data.text!=='string'||!data.text.trim()||data.text.length>100000) return json(res,400,{error:'Provide a non-empty resume of up to 100,000 characters.'});
    const doc=new PDFDocument({size:'A4',margin:48,info:{Title:'Tailored Resume'}});
    res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="tailored-resume.pdf"','Cache-Control':'no-store'});
    doc.pipe(res);
    // Use a bundled Unicode font when available, with PDF's standard font as fallback.
    const font=path.join(__dirname,'assets','ResumeSans.ttf');
    if(fs.existsSync(font))doc.font(font);
    doc.fontSize(10).fillColor('#172c23').text(data.text,{lineGap:4});doc.end();return;
   }
   if(req.method!=='GET')return json(res,405,{error:'Method not allowed.'});
   const file=path.join(root,url.pathname==='/'?'index.html':url.pathname);
   if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
   fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.setHeader('Content-Type',({'html':'text/html','css':'text/css','js':'text/javascript'})[path.extname(file).slice(1)]||'application/octet-stream');res.end(data);});
  } catch(error) {if(!res.headersSent)json(res,error.status||500,{error:error.status?error.message:'Unable to process the request. Please try again.'});else res.end();}
 });
}
if(require.main===module)createServer().listen(process.env.PORT||3000,'0.0.0.0',()=>console.log(`Resume studio running on port ${process.env.PORT||3000}`));
module.exports={createServer,extractPdf};
