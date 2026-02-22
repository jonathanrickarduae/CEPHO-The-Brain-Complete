import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

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
 * Generate PDF from Victoria's Brief data using Markdown + Pandoc/WeasyPrint
 */
export async function generateBriefPDF(briefData: BriefData): Promise<string> {
  try {
    // Create Markdown content
    const markdown = generateBriefMarkdown(briefData);
    
    // Write to temporary file
    const tempMdPath = join(tmpdir(), `victoria-brief-${Date.now()}.md`);
    const tempPdfPath = join(tmpdir(), `victoria-brief-${Date.now()}.pdf`);
    
    await writeFile(tempMdPath, markdown, 'utf-8');
    
    // Convert to PDF using manus-md-to-pdf utility
    try {
      await execAsync(`manus-md-to-pdf "${tempMdPath}" "${tempPdfPath}"`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('PDF generation utility failed. Ensure manus-md-to-pdf is available.');
    }
    
    // Clean up markdown file
    await unlink(tempMdPath);
    
    // Return path to PDF (caller should handle file serving/cleanup)
    return tempPdfPath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Generate Markdown content from brief data
 */
function generateBriefMarkdown(data: BriefData): string {
  const sections: string[] = [];
  
  // Header
  sections.push(`# Victoria's Morning Brief`);
  sections.push(`**${data.date}**\n`);
  
  // Overview
  sections.push(`## Overview`);
  sections.push(`${data.overviewSummary.headline}\n`);
  sections.push(`**Energy Focus:** ${data.overviewSummary.energyFocus}\n`);
  
  // Schedule
  if (data.schedule && data.schedule.length > 0) {
    sections.push(`## Today's Schedule`);
    sections.push('');
    for (const item of data.schedule) {
      sections.push(`### ${item.time} - ${item.title}`);
      sections.push(`**Type:** ${item.type}`);
      if (item.location) sections.push(`**Location:** ${item.location}`);
      if (item.attendees && item.attendees.length > 0) {
        sections.push(`**Attendees:** ${item.attendees.join(', ')}`);
      }
      sections.push('');
    }
  }
  
  // Priorities
  if (data.priorities && data.priorities.length > 0) {
    sections.push(`## Top Priorities`);
    sections.push('');
    for (let i = 0; i < data.priorities.length; i++) {
      const priority = data.priorities[i];
      sections.push(`### ${i + 1}. ${priority.title}`);
      sections.push(`${priority.description}`);
      sections.push(`**Urgency:** ${priority.urgency} | **Estimated Time:** ${priority.estimatedTime}`);
      sections.push('');
    }
  }
  
  // Insights
  if (data.insights && data.insights.length > 0) {
    sections.push(`## Key Insights`);
    sections.push('');
    for (const insight of data.insights) {
      sections.push(`**${insight.category}:** ${insight.message}`);
      sections.push('');
    }
  }
  
  // Emails
  if (data.emails && data.emails.urgent && data.emails.urgent.length > 0) {
    sections.push(`## Urgent Emails (${data.emails.urgent.length})`);
    sections.push('');
    for (const email of data.emails.urgent) {
      sections.push(`### From: ${email.from}`);
      sections.push(`**Subject:** ${email.subject}`);
      sections.push(`**Preview:** ${email.preview}`);
      sections.push(`**Suggested Response:** ${email.suggestedResponse}`);
      sections.push('');
    }
  }
  
  return sections.join('\n');
}
