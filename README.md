# Aligned — Resume studio

Resume alignment for AI and GenAI roles, with file upload and a rewritten resume PDF.

## Run on Windows or another computer

Install Node.js LTS (version 22.13 or newer). Download this repository, extract the ZIP, and open the extracted folder in VS Code. Open its terminal and run:

```sh
npm ci
npm start
```

Open http://localhost:3000 in your browser. Keep the terminal running. Stop it with Ctrl+C. After downloading an updated version, run `npm ci` again and restart the server. `PORT` can override the default server port.

## Use

1. Upload a PDF, DOCX, or UTF-8 TXT resume (maximum 10 MB), or paste its text. Scanned PDFs need OCR first; encrypted PDFs and legacy DOC files are not supported.
2. Review the extracted text. File extraction may change line breaks, columns, bullet characters, or section headings. For best project attribution, use a separate **Projects** heading, project names on their own lines, and bullets starting with `-`, `•`, or `*` followed by a space.
3. Paste the job description and choose **Find my alignment**.
4. Review the six report sections and the separate **Project changes — existing projects only** table. This table shows project names, original bullets, revised bullets, and reasons. If no project edits are needed, it says so explicitly.
5. Edit the rewritten resume text if needed, then choose **Download resume PDF**. The PDF contains only the resume, not the analysis or change log. Long resumes continue onto additional pages. The full report, including project changes, can be exported separately as text.

## Honesty and privacy

The tailoring engine is rule-based, not an AI model. It creates a summary from evidenced matching skills, preserves original skills, rewrites weak bullet openings, and reorders bullets within each existing role/project. It never adds missing tools as completed work, invents projects, or introduces metrics. Learning suggestions remain separate. Project detection and keyword coverage are approximate; review the output before applying. Downloaded PDF formatting is a clean text layout rather than a reproduction of the uploaded design.

Analysis runs in the browser. Uploaded documents go to the local app server for text extraction; edited resume text goes to it for PDF generation. Documents are processed in memory and not saved by the app. Optional Google Fonts supplies interface typography. Use this app locally; the server has no authentication and is not intended for public deployment.

## Validate

```sh
npm test
```

Tests cover source-preserving tailoring, project attribution, TXT/DOCX/PDF extraction, invalid and oversized uploads, and multipage PDF generation with text verification. A bundled DejaVu font provides Unicode support for its supported character set; see `assets/FONT-LICENSE.txt`.
