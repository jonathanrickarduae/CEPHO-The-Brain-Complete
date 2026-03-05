import { createWriteStream } from "fs";
import { join } from "path";
import { tmpdir } from "os";
// @ts-ignore — pdfkit types are declared separately
import PDFDocument from "pdfkit";

interface BriefData {
  date: string;
  overviewSummary: {
    headline: string;
    energyFocus: string;
  };
  schedule: Array<{
    time: string;
    title: string;
    type: string;
    location?: string;
    attendees?: string[];
  }>;
  priorities: Array<{
    title: string;
    description: string;
    urgency: string;
    estimatedTime: string;
  }>;
  insights: Array<{
    category: string;
    message: string;
  }>;
  emails?: {
    unread: number;
    requireResponse: number;
    highPriority: number;
    urgent: Array<{
      from: string;
      subject: string;
      preview: string;
      suggestedResponse: string;
    }>;
  };
}

/**
 * Generate PDF from Victoria's Brief data using pdfkit (pure Node.js, no system deps).
 * Returns the path to the generated PDF file.
 */
export async function generateBriefPDF(briefData: BriefData): Promise<string> {
  const tempPdfPath = join(tmpdir(), `victoria-brief-${Date.now()}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = createWriteStream(tempPdfPath);

    doc.pipe(stream);

    // ── Colour palette ─────────────────────────────────────────────────────────
    const DARK = "#0f172a";
    const PRIMARY = "#6366f1";
    const MUTED = "#64748b";
    const WHITE = "#ffffff";
    const LIGHT_BG = "#f8fafc";

    // ── Header band ────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(DARK);
    doc
      .fillColor(WHITE)
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("Victoria's Morning Brief", 50, 22, { align: "left" });
    doc
      .fillColor(PRIMARY)
      .fontSize(11)
      .font("Helvetica")
      .text(briefData.date, 50, 52, { align: "left" });

    doc.moveDown(2);

    // ── Helper: section heading ────────────────────────────────────────────────
    const sectionHeading = (title: string) => {
      doc.moveDown(0.5);
      doc
        .fillColor(PRIMARY)
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(title.toUpperCase(), { underline: false });
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor(PRIMARY)
        .lineWidth(0.5)
        .stroke();
      doc.moveDown(0.4);
    };

    // ── Overview ───────────────────────────────────────────────────────────────
    sectionHeading("Overview");
    doc
      .fillColor(DARK)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(briefData.overviewSummary.headline);
    doc.moveDown(0.3);
    doc
      .fillColor(MUTED)
      .fontSize(10)
      .font("Helvetica")
      .text(`Energy Focus: ${briefData.overviewSummary.energyFocus}`);

    // ── Schedule ───────────────────────────────────────────────────────────────
    if (briefData.schedule && briefData.schedule.length > 0) {
      sectionHeading("Today's Schedule");
      for (const item of briefData.schedule) {
        doc
          .fillColor(DARK)
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(`${item.time}  `, { continued: true })
          .font("Helvetica")
          .text(item.title);
        if (item.location) {
          doc
            .fillColor(MUTED)
            .fontSize(9)
            .text(`  Location: ${item.location}`);
        }
        if (item.attendees && item.attendees.length > 0) {
          doc
            .fillColor(MUTED)
            .fontSize(9)
            .text(`  Attendees: ${item.attendees.join(", ")}`);
        }
        doc.moveDown(0.3);
      }
    }

    // ── Priorities ─────────────────────────────────────────────────────────────
    if (briefData.priorities && briefData.priorities.length > 0) {
      sectionHeading("Top Priorities");
      briefData.priorities.forEach((p, i) => {
        doc
          .fillColor(DARK)
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(`${i + 1}. ${p.title}`);
        doc
          .fillColor(DARK)
          .fontSize(10)
          .font("Helvetica")
          .text(p.description, { indent: 15 });
        doc
          .fillColor(MUTED)
          .fontSize(9)
          .text(`Urgency: ${p.urgency}  |  Est. Time: ${p.estimatedTime}`, {
            indent: 15,
          });
        doc.moveDown(0.4);
      });
    }

    // ── Insights ───────────────────────────────────────────────────────────────
    if (briefData.insights && briefData.insights.length > 0) {
      sectionHeading("Key Insights");
      for (const insight of briefData.insights) {
        doc
          .fillColor(DARK)
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(`${insight.category}: `, { continued: true })
          .font("Helvetica")
          .fillColor(DARK)
          .text(insight.message);
        doc.moveDown(0.3);
      }
    }

    // ── Urgent Emails ──────────────────────────────────────────────────────────
    if (
      briefData.emails &&
      briefData.emails.urgent &&
      briefData.emails.urgent.length > 0
    ) {
      sectionHeading(`Urgent Emails (${briefData.emails.urgent.length})`);
      for (const email of briefData.emails.urgent) {
        doc
          .fillColor(DARK)
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(`From: ${email.from}`);
        doc
          .fillColor(DARK)
          .fontSize(10)
          .font("Helvetica")
          .text(`Subject: ${email.subject}`);
        doc.fillColor(MUTED).fontSize(9).text(`Preview: ${email.preview}`);
        doc
          .fillColor(MUTED)
          .fontSize(9)
          .text(`Suggested Response: ${email.suggestedResponse}`);
        doc.moveDown(0.4);
      }
    }

    // ── Footer ─────────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 40;
    doc
      .rect(0, footerY, doc.page.width, 40)
      .fill(LIGHT_BG);
    doc
      .fillColor(MUTED)
      .fontSize(8)
      .font("Helvetica")
      .text(
        `Generated by CEPHO — Victoria AI Chief of Staff  •  ${new Date().toISOString()}`,
        50,
        footerY + 14,
        { align: "center", width: doc.page.width - 100 }
      );

    doc.end();

    stream.on("finish", () => resolve(tempPdfPath));
    stream.on("error", reject);
  });
}
