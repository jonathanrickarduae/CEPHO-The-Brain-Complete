/**
 * Document Generation Service
 * Generates PDF reports, presentations, and other documents
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { getDb } from '../db';

interface PDFOptions {
  template: string;
  data: any;
  filename: string;
}

/**
 * Generate PDF document
 */
export async function generatePDF(options: PDFOptions): Promise<string> {
  const outputDir = path.join(process.cwd(), 'generated-documents');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, options.filename);
  
  // Generate PDF based on template
  switch (options.template) {
    case 'daily_signal':
      await generateDailySignalPDF(options.data, outputPath);
      break;
    case 'evening_briefing':
      await generateEveningBriefingPDF(options.data, outputPath);
      break;
    case 'weekly_report':
      await generateWeeklyReportPDF(options.data, outputPath);
      break;
    default:
      throw new Error(`PDF template '${options.template}' not found`);
  }
  
  console.log('[PDF] Generated:', outputPath);
  
  // Log document generation
  const db = await getDb();
  await db`
    INSERT INTO generated_documents 
    (type, filename, path, "generatedAt")
    VALUES (${options.template}, ${options.filename}, ${outputPath}, NOW())
  `;
  
  return outputPath;
}

/**
 * Generate Daily Signal PDF
 */
async function generateDailySignalPDF(data: any, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });
      
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Header with gradient background (simulated with rectangles)
      doc.rect(0, 0, 612, 100).fill('#667eea');
      
      // Logo/Title
      doc.fillColor('#ffffff')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('🧠 CEPHO.AI', 50, 30);
      
      doc.fontSize(16)
         .font('Helvetica')
         .text('Daily Trading Signal', 50, 65);
      
      // Date
      const date = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.fontSize(10)
         .text(date, 400, 40);
      
      // Reset to black for content
      doc.fillColor('#000000');
      
      // Signal Section
      doc.moveDown(3);
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('Trading Signal', 50);
      
      doc.moveDown(0.5);
      
      // Signal box
      const signalColor = data.signal.signal === 'BUY' ? '#10b981' : 
                         data.signal.signal === 'SELL' ? '#ef4444' : '#6b7280';
      
      doc.fontSize(32)
         .fillColor(signalColor)
         .font('Helvetica-Bold')
         .text(data.signal.signal, 50);
      
      doc.fontSize(18)
         .fillColor('#667eea')
         .font('Helvetica')
         .text(`Confidence: ${data.signal.confidence}%`, 50);
      
      // Reasoning
      doc.moveDown(1);
      doc.fontSize(12)
         .fillColor('#000000')
         .font('Helvetica-Bold')
         .text('Reasoning:', 50);
      
      doc.fontSize(11)
         .font('Helvetica')
         .text(data.signal.reasoning || 'No reasoning provided', 50, doc.y, {
           width: 500,
           align: 'left',
         });
      
      // Market Overview
      doc.moveDown(2);
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Market Overview', 50);
      
      doc.moveDown(0.5);
      doc.fontSize(11)
         .font('Helvetica')
         .text(data.briefing.summary || 'No summary available', 50, doc.y, {
           width: 500,
           align: 'left',
         });
      
      // Key Points
      if (data.briefing.keyPoints && data.briefing.keyPoints.length > 0) {
        doc.moveDown(2);
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('Key Points', 50);
        
        doc.moveDown(0.5);
        data.briefing.keyPoints.forEach((point: string) => {
          doc.fontSize(11)
             .font('Helvetica')
             .text(`• ${point}`, 60, doc.y, {
               width: 490,
               align: 'left',
             });
          doc.moveDown(0.3);
        });
      }
      
      // Recommendation
      doc.moveDown(2);
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Recommendation', 50);
      
      doc.moveDown(0.5);
      doc.fontSize(11)
         .font('Helvetica')
         .text(data.briefing.recommendation || 'No recommendation available', 50, doc.y, {
           width: 500,
           align: 'left',
         });
      
      // Footer
      doc.moveDown(4);
      doc.fontSize(9)
         .fillColor('#666666')
         .text('This signal was validated by the Chief of Staff AI', 50, 750, {
           align: 'center',
           width: 500,
         });
      
      doc.text(`© ${new Date().getFullYear()} CEPHO.AI - All rights reserved`, 50, 765, {
        align: 'center',
        width: 500,
      });
      
      // Finalize PDF
      doc.end();
      
      stream.on('finish', () => resolve());
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate Evening Briefing PDF
 */
async function generateEveningBriefingPDF(data: any, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });
      
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Header
      doc.rect(0, 0, 612, 100).fill('#667eea');
      
      doc.fillColor('#ffffff')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('🌙 CEPHO.AI', 50, 30);
      
      doc.fontSize(16)
         .font('Helvetica')
         .text('Evening Briefing', 50, 65);
      
      // Date
      const date = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.fontSize(10)
         .text(date, 400, 40);
      
      // Reset to black
      doc.fillColor('#000000');
      
      // Performance Summary
      doc.moveDown(3);
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('Today\'s Performance', 50);
      
      doc.moveDown(1);
      doc.fontSize(11)
         .font('Helvetica')
         .text(data.briefing.summary || 'No summary available', 50, doc.y, {
           width: 500,
           align: 'left',
         });
      
      // Tomorrow's Plan
      doc.moveDown(2);
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Tomorrow\'s Plan', 50);
      
      doc.moveDown(0.5);
      doc.fontSize(11)
         .font('Helvetica')
         .text(data.briefing.tomorrowPlan || 'Continue monitoring markets', 50, doc.y, {
           width: 500,
           align: 'left',
         });
      
      // Footer
      doc.fontSize(9)
         .fillColor('#666666')
         .text(`© ${new Date().getFullYear()} CEPHO.AI - All rights reserved`, 50, 765, {
           align: 'center',
           width: 500,
         });
      
      doc.end();
      
      stream.on('finish', () => resolve());
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate Weekly Report PDF
 */
async function generateWeeklyReportPDF(data: any, outputPath: string): Promise<void> {
  // TODO: Implement weekly report template
  return generateDailySignalPDF(data, outputPath);
}

/**
 * Generate presentation using Gamma.app integration
 */
export async function generatePresentation(options: {
  title: string;
  content: string;
  style?: string;
}): Promise<string> {
  const db = await getDb();
  
  // Get Gamma integration
  const config = await db`
    SELECT * FROM integrations 
    WHERE service = 'gamma' AND status = 'connected'
    LIMIT 1
  `;
  
  if (!config || config.length === 0) {
    throw new Error('Gamma.app integration not configured');
  }
  
  // TODO: Implement Gamma API integration
  console.log('[Gamma] Would generate presentation:', options.title);
  
  return 'presentation-url';
}

/**
 * Generate video using ElevenLabs + video service
 */
export async function generateVideo(options: {
  script: string;
  voiceId?: string;
  style?: string;
}): Promise<string> {
  const db = await getDb();
  
  // Get ElevenLabs integration
  const config = await db`
    SELECT * FROM integrations 
    WHERE service = 'elevenlabs' AND status = 'connected'
    LIMIT 1
  `;
  
  if (!config || config.length === 0) {
    throw new Error('ElevenLabs integration not configured');
  }
  
  // TODO: Implement ElevenLabs + video generation
  console.log('[Video] Would generate video with script length:', options.script.length);
  
  return 'video-url';
}

/**
 * Get generated documents for a project
 */
export async function getProjectDocuments(projectId: string) {
  const db = await getDb();
  
  const documents = await db`
    SELECT * FROM generated_documents
    WHERE "projectId" = ${projectId}
    ORDER BY "generatedAt" DESC
  `;
  
  return documents;
}
