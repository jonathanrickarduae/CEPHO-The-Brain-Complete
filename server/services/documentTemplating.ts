/**
 * Document Templating Engine
 * Applies consistent, professional branding and formatting to all generated documents.
 * Appendix U of the Grand Master Plan v10.0
 */

export type DocumentTemplate =
  | "executive_report"
  | "board_report"
  | "project_brief"
  | "strategic_memo"
  | "innovation_proposal"
  | "risk_assessment"
  | "weekly_digest"
  | "morning_briefing";

export interface DocumentSection {
  heading?: string;
  content: string;
  type?: "paragraph" | "bullets" | "table" | "metrics";
  data?: Record<string, unknown>[];
}

export interface DocumentInput {
  template: DocumentTemplate;
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  sections: DocumentSection[];
  metadata?: Record<string, string>;
  confidentiality?: "public" | "internal" | "confidential" | "strictly_confidential";
}

export interface FormattedDocument {
  html: string;
  markdown: string;
  plainText: string;
  wordCount: number;
}

const TEMPLATE_STYLES: Record<DocumentTemplate, { accentColor: string; headerStyle: string }> = {
  executive_report: { accentColor: "#6366f1", headerStyle: "Executive Report" },
  board_report: { accentColor: "#0f172a", headerStyle: "Board Report" },
  project_brief: { accentColor: "#0ea5e9", headerStyle: "Project Brief" },
  strategic_memo: { accentColor: "#8b5cf6", headerStyle: "Strategic Memorandum" },
  innovation_proposal: { accentColor: "#f59e0b", headerStyle: "Innovation Proposal" },
  risk_assessment: { accentColor: "#ef4444", headerStyle: "Risk Assessment" },
  weekly_digest: { accentColor: "#10b981", headerStyle: "Weekly Digest" },
  morning_briefing: { accentColor: "#6366f1", headerStyle: "Morning Briefing" },
};

const CONFIDENTIALITY_LABELS: Record<string, string> = {
  public: "",
  internal: "INTERNAL USE ONLY",
  confidential: "CONFIDENTIAL",
  strictly_confidential: "STRICTLY CONFIDENTIAL",
};

function renderSectionHtml(section: DocumentSection): string {
  const heading = section.heading
    ? `<h2 style="font-size:14px;font-weight:700;color:#1e293b;margin:20px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">${section.heading}</h2>`
    : "";

  let body = "";
  if (section.type === "bullets") {
    const items = section.content
      .split("\n")
      .filter(Boolean)
      .map(line => `<li style="margin-bottom:4px;">${line.replace(/^[-•*]\s*/, "")}</li>`)
      .join("");
    body = `<ul style="margin:0;padding-left:20px;color:#334155;">${items}</ul>`;
  } else if (section.type === "metrics" && section.data) {
    const cells = section.data
      .map(
        row =>
          `<tr><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:12px;">${row.label ?? ""}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#1e293b;font-size:12px;">${row.value ?? ""}</td></tr>`
      )
      .join("");
    body = `<table style="width:100%;border-collapse:collapse;margin:8px 0;">${cells}</table>`;
  } else {
    body = `<p style="color:#334155;line-height:1.6;margin:0;">${section.content}</p>`;
  }

  return `<div style="margin-bottom:16px;">${heading}${body}</div>`;
}

function renderSectionMarkdown(section: DocumentSection): string {
  const heading = section.heading ? `## ${section.heading}\n\n` : "";
  let body = "";
  if (section.type === "bullets") {
    body = section.content
      .split("\n")
      .filter(Boolean)
      .map(line => `- ${line.replace(/^[-•*]\s*/, "")}`)
      .join("\n");
  } else if (section.type === "metrics" && section.data) {
    body = section.data
      .map(row => `**${row.label}:** ${row.value}`)
      .join("\n");
  } else {
    body = section.content;
  }
  return `${heading}${body}\n\n`;
}

export function formatDocument(input: DocumentInput): FormattedDocument {
  const style = TEMPLATE_STYLES[input.template];
  const date = input.date ?? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const confidentialityLabel = CONFIDENTIALITY_LABELS[input.confidentiality ?? "internal"];

  // HTML
  const sectionsHtml = input.sections.map(renderSectionHtml).join("");
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px; background: #fff; color: #1e293b; }
    .header { border-bottom: 3px solid ${style.accentColor}; padding-bottom: 20px; margin-bottom: 24px; }
    .doc-type { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${style.accentColor}; margin-bottom: 8px; }
    .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
    .subtitle { font-size: 14px; color: #64748b; margin: 0 0 12px; }
    .meta { font-size: 11px; color: #94a3b8; }
    .confidential { display: inline-block; background: #fef2f2; color: #dc2626; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 2px 8px; border-radius: 4px; margin-top: 8px; }
    .footer { border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 12px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div class="doc-type">CEPHO.AI — ${style.headerStyle}</div>
    <h1 class="title">${input.title}</h1>
    ${input.subtitle ? `<p class="subtitle">${input.subtitle}</p>` : ""}
    <div class="meta">${input.author ? `Prepared by ${input.author} · ` : ""}${date}</div>
    ${confidentialityLabel ? `<div class="confidential">${confidentialityLabel}</div>` : ""}
  </div>
  ${sectionsHtml}
  <div class="footer">
    <span>Generated by CEPHO.AI</span>
    <span>${date}</span>
  </div>
</body>
</html>`.trim();

  // Markdown
  const sectionsMarkdown = input.sections.map(renderSectionMarkdown).join("");
  const markdown = `# ${input.title}
${input.subtitle ? `\n_${input.subtitle}_\n` : ""}
${input.author ? `**Prepared by:** ${input.author}  ` : ""}
**Date:** ${date}  
${confidentialityLabel ? `**Classification:** ${confidentialityLabel}` : ""}

---

${sectionsMarkdown}

---
_Generated by CEPHO.AI_`;

  // Plain text
  const plainText = [
    input.title,
    input.subtitle ?? "",
    `Date: ${date}`,
    confidentialityLabel,
    "",
    ...input.sections.map(s => [s.heading ? `${s.heading.toUpperCase()}` : "", s.content].filter(Boolean).join("\n")),
    "",
    "Generated by CEPHO.AI",
  ]
    .filter(line => line !== undefined)
    .join("\n");

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return { html, markdown, plainText, wordCount };
}
