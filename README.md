# Aligned — Resume studio

A private, browser-based resume alignment app for AI and GenAI roles.

## Run

Requires Node.js 18 or later. No packages or API keys required.

```sh
npm start
```

The HTTP server uses port 3000 by default (`PORT` overrides it).
Paste a resume and job description, or choose **Try an example**. Generate six report sections and export the report as text.

```sh
npm test
```

Analysis runs locally; inputs are never sent to a model or stored. Google Fonts is used for optional typography, with system fallbacks. The engine uses a fixed technical vocabulary and conservative, source-preserving edits rather than a language model. It ranks contiguous bullet groups within existing roles/projects and proposes an evidence-based summary and skills section. Missing skills are learning recommendations, never inserted as completed work. Keyword score is a rough coverage measure, not verified proficiency or a hiring prediction. Review all suggestions before applying.
