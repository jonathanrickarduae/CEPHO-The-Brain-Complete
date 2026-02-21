/**
 * CEPHO.AI DOCX Generator Service
 * 
 * Generates professional Word documents (.docx) with proper formatting,
 * styling, and CEPHO branding.
 * 
 * Uses officegen or docx library for document generation.
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, Header, Footer, PageNumber, NumberFormat } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

// Brand colors (CEPHO-BP-016)
const BRAND_COLORS = {
  black: '000000',
  darkGrey: '333333',
  mediumGrey: '666666',
  lightGrey: '999999',
  white: 'FFFFFF',
  cephoCyan: '00D4FF',
  cephoMagenta: 'D946EF',
};

// Document metadata
export interface DocxMetadata {
  title: string;
  subject?: string;
  creator?: string;
  keywords?: string[];
  description?: string;
  classification?: 'public' | 'internal' | 'confidential' | 'restricted';
}

// Section content
export interface DocxSection {
  heading: string;
  level?: 1 | 2 | 3;
  content: string | string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

// Document structure
export interface DocxDocument {
  metadata: DocxMetadata;
  sections: DocxSection[];
  footer?: {
    preparedBy?: string;
    reviewedBy?: string;
    date?: string;
    classification?: string;
  };
}

/**
 * Generate a Word document from structured content
 */
export async function generateDocx(
  documentData: DocxDocument,
  outputPath: string
): Promise<string> {
  try {
    const sections: any[] = [];

    // Title page
    sections.push(
      new Paragraph({
        text: documentData.metadata.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    if (documentData.metadata.subject) {
      sections.push(
        new Paragraph({
          text: documentData.metadata.subject,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    if (documentData.metadata.classification) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Classification: ${documentData.metadata.classification.toUpperCase()}`,
              bold: true,
              color: BRAND_COLORS.darkGrey,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    // Add page break after title
    sections.push(
      new Paragraph({
        text: '',
        pageBreakBefore: true,
      })
    );

    // Process each section
    for (const section of documentData.sections) {
      // Section heading
      const headingLevel = 
        section.level === 1 ? HeadingLevel.HEADING_1 :
        section.level === 2 ? HeadingLevel.HEADING_2 :
        HeadingLevel.HEADING_3;

      sections.push(
        new Paragraph({
          text: section.heading,
          heading: headingLevel,
          spacing: { before: 240, after: 120 },
        })
      );

      // Section content
      if (typeof section.content === 'string') {
        // Single paragraph
        const paragraphs = section.content.split('\n\n');
        paragraphs.forEach(para => {
          if (para.trim()) {
            sections.push(
              new Paragraph({
                text: para.trim(),
                spacing: { after: 120 },
              })
            );
          }
        });
      } else {
        // Multiple paragraphs
        section.content.forEach(para => {
          if (para.trim()) {
            sections.push(
              new Paragraph({
                text: para.trim(),
                spacing: { after: 120 },
              })
            );
          }
        });
      }

      // Add table if present
      if (section.table) {
        const tableRows: TableRow[] = [];

        // Header row
        tableRows.push(
          new TableRow({
            children: section.table.headers.map(
              header =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: header,
                          bold: true,
                          color: BRAND_COLORS.white,
                        }),
                      ],
                    }),
                  ],
                  shading: {
                    fill: BRAND_COLORS.darkGrey,
                  },
                })
            ),
          })
        );

        // Data rows
        section.table.rows.forEach((row, idx) => {
          tableRows.push(
            new TableRow({
              children: row.map(
                cell =>
                  new TableCell({
                    children: [new Paragraph({ text: cell })],
                    shading: {
                      fill: idx % 2 === 0 ? BRAND_COLORS.white : 'F5F5F5',
                    },
                  })
              ),
            })
          );
        });

        sections.push(
          new Table({
            rows: tableRows,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLORS.mediumGrey },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLORS.mediumGrey },
              left: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLORS.mediumGrey },
              right: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLORS.mediumGrey },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLORS.lightGrey },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLORS.lightGrey },
            },
          })
        );

        sections.push(
          new Paragraph({
            text: '',
            spacing: { after: 200 },
          })
        );
      }
    }

    // Footer section
    if (documentData.footer) {
      sections.push(
        new Paragraph({
          text: '',
          pageBreakBefore: true,
        })
      );

      sections.push(
        new Paragraph({
          text: 'Document Sign-Off',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );

      if (documentData.footer.preparedBy) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Prepared by: ', bold: true }),
              new TextRun({ text: documentData.footer.preparedBy }),
            ],
            spacing: { after: 80 },
          })
        );
      }

      if (documentData.footer.reviewedBy) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Reviewed by: ', bold: true }),
              new TextRun({ text: documentData.footer.reviewedBy }),
            ],
            spacing: { after: 80 },
          })
        );
      }

      if (documentData.footer.date) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Date: ', bold: true }),
              new TextRun({ text: documentData.footer.date }),
            ],
            spacing: { after: 80 },
          })
        );
      }

      if (documentData.footer.classification) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Classification: ', bold: true }),
              new TextRun({ 
                text: documentData.footer.classification.toUpperCase(),
                color: BRAND_COLORS.darkGrey,
              }),
            ],
            spacing: { after: 80 },
          })
        );
      }
    }

    // Create document
    const doc = new Document({
      creator: documentData.metadata.creator || 'CEPHO.AI',
      title: documentData.metadata.title,
      subject: documentData.metadata.subject,
      keywords: documentData.metadata.keywords?.join(', '),
      description: documentData.metadata.description,
      
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'CEPHO.AI',
                      bold: true,
                      color: BRAND_COLORS.darkGrey,
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Page ',
                      color: BRAND_COLORS.mediumGrey,
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      color: BRAND_COLORS.mediumGrey,
                    }),
                    new TextRun({
                      text: ' of ',
                      color: BRAND_COLORS.mediumGrey,
                    }),
                    new TextRun({
                      children: [PageNumber.TOTAL_PAGES],
                      color: BRAND_COLORS.mediumGrey,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          children: sections,
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error(`Failed to generate Word document: ${error.message}`);
  }
}

/**
 * Generate a simple report document
 */
export async function generateReport(
  title: string,
  sections: { heading: string; content: string }[],
  outputPath: string,
  metadata?: Partial<DocxMetadata>
): Promise<string> {
  const documentData: DocxDocument = {
    metadata: {
      title,
      creator: metadata?.creator || 'CEPHO.AI',
      subject: metadata?.subject,
      keywords: metadata?.keywords,
      description: metadata?.description,
      classification: metadata?.classification || 'internal',
    },
    sections: sections.map(s => ({
      heading: s.heading,
      level: 1,
      content: s.content,
    })),
    footer: {
      preparedBy: 'CEPHO AI System',
      reviewedBy: 'Chief of Staff',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      classification: metadata?.classification || 'INTERNAL',
    },
  };

  return generateDocx(documentData, outputPath);
}

/**
 * Generate an innovation brief document
 */
export async function generateInnovationBrief(
  briefData: {
    title: string;
    executiveSummary: string;
    opportunity: string;
    marketAnalysis: string;
    recommendation: string;
    nextSteps: string[];
  },
  outputPath: string
): Promise<string> {
  const documentData: DocxDocument = {
    metadata: {
      title: briefData.title,
      subject: 'Innovation Brief',
      creator: 'CEPHO.AI Innovation Engine',
      classification: 'internal',
    },
    sections: [
      {
        heading: 'Executive Summary',
        level: 1,
        content: briefData.executiveSummary,
      },
      {
        heading: 'Opportunity Analysis',
        level: 1,
        content: briefData.opportunity,
      },
      {
        heading: 'Market Analysis',
        level: 1,
        content: briefData.marketAnalysis,
      },
      {
        heading: 'Recommendation',
        level: 1,
        content: briefData.recommendation,
      },
      {
        heading: 'Next Steps',
        level: 1,
        content: briefData.nextSteps,
      },
    ],
    footer: {
      preparedBy: 'CEPHO Innovation Engine',
      reviewedBy: 'Chief of Staff',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      classification: 'INTERNAL',
    },
  };

  return generateDocx(documentData, outputPath);
}

/**
 * Generate a project genesis document
 */
export async function generateProjectGenesisDocument(
  projectData: {
    name: string;
    vision: string;
    objectives: string[];
    scope: string;
    timeline: { phase: string; duration: string; deliverables: string }[];
    resources: string;
    risks: { risk: string; mitigation: string }[];
  },
  outputPath: string
): Promise<string> {
  const documentData: DocxDocument = {
    metadata: {
      title: `Project Genesis: ${projectData.name}`,
      subject: 'Project Initiation Document',
      creator: 'CEPHO.AI Project Genesis',
      classification: 'internal',
    },
    sections: [
      {
        heading: 'Project Vision',
        level: 1,
        content: projectData.vision,
      },
      {
        heading: 'Objectives',
        level: 1,
        content: projectData.objectives,
      },
      {
        heading: 'Scope',
        level: 1,
        content: projectData.scope,
      },
      {
        heading: 'Timeline',
        level: 1,
        content: 'Project timeline and key milestones:',
        table: {
          headers: ['Phase', 'Duration', 'Deliverables'],
          rows: projectData.timeline.map(t => [t.phase, t.duration, t.deliverables]),
        },
      },
      {
        heading: 'Resources',
        level: 1,
        content: projectData.resources,
      },
      {
        heading: 'Risk Assessment',
        level: 1,
        content: 'Identified risks and mitigation strategies:',
        table: {
          headers: ['Risk', 'Mitigation Strategy'],
          rows: projectData.risks.map(r => [r.risk, r.mitigation]),
        },
      },
    ],
    footer: {
      preparedBy: 'CEPHO Project Genesis',
      reviewedBy: 'Chief of Staff',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      classification: 'INTERNAL',
    },
  };

  return generateDocx(documentData, outputPath);
}


/**
 * DocxGeneratorService class wrapper for easier imports
 */
export class DocxGeneratorService {
  async generateReport(reportData: {
    title: string;
    sections: Array<{
      heading: string;
      content: string | string[];
    }>;
  }): Promise<Buffer> {
    return generateReport(reportData);
  }

  async generateInnovationBrief(briefData: {
    title: string;
    description: string;
    category?: string;
    confidenceScore?: number;
    assessments?: Array<any>;
    scenarios?: Array<any>;
    recommendation?: any;
  }): Promise<Buffer> {
    return generateInnovationBrief(briefData);
  }

  async generateProjectGenesisDocument(projectData: {
    projectName: string;
    description: string;
    phases?: Array<any>;
  }): Promise<Buffer> {
    return generateProjectGenesisDocument(projectData);
  }
}
