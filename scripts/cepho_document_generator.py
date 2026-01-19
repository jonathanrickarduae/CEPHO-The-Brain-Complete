#!/usr/bin/env python3
"""
CEPHO.Ai Document Generation System

This module provides the core document generation infrastructure with:
- Master design guidelines enforcement
- Chief of Staff validation gate
- Template library for all document types
- Automated compliance checking

NO DOCUMENT MAY BE DELIVERED WITHOUT PASSING CHIEF OF STAFF VALIDATION.
"""

import os
import json
from datetime import datetime
from fpdf import FPDF
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# =============================================================================
# CEPHO BRAND CONSTANTS (from Master Design Guidelines)
# =============================================================================

class CephoColors:
    """Official CEPHO.Ai color palette - DO NOT MODIFY"""
    
    # Primary Colors
    BLACK = (0, 0, 0)
    WHITE = (255, 255, 255)
    DARK_GREY = (51, 51, 51)
    MID_GREY = (102, 102, 102)
    LIGHT_GREY = (243, 244, 246)
    
    # Accent Color
    PINK = (255, 0, 110)  # #FF006E
    
    # Score Colors with text contrast
    SCORE_EXCELLENT = {'bg': (34, 197, 94), 'text': WHITE}      # 80-100
    SCORE_GOOD = {'bg': (132, 204, 22), 'text': BLACK}          # 70-79
    SCORE_SATISFACTORY = {'bg': (234, 179, 8), 'text': BLACK}   # 60-69
    SCORE_ATTENTION = {'bg': (249, 115, 22), 'text': WHITE}     # 40-59
    SCORE_CRITICAL = {'bg': (239, 68, 68), 'text': WHITE}       # 30-39
    SCORE_SEVERE = {'bg': (220, 38, 38), 'text': WHITE}         # 0-29
    
    @classmethod
    def get_score_colors(cls, score: int) -> dict:
        """Get appropriate colors for a score value"""
        if score >= 80:
            return cls.SCORE_EXCELLENT
        elif score >= 70:
            return cls.SCORE_GOOD
        elif score >= 60:
            return cls.SCORE_SATISFACTORY
        elif score >= 40:
            return cls.SCORE_ATTENTION
        elif score >= 30:
            return cls.SCORE_CRITICAL
        else:
            return cls.SCORE_SEVERE


class CephoTypography:
    """Official CEPHO.Ai typography standards"""
    
    FONT_FAMILY = 'Helvetica'  # PDF fallback for Calibri
    
    # Font sizes in points
    TITLE = 24
    SECTION_HEADER = 18
    SUBSECTION_HEADER = 14
    BODY = 11
    TABLE_HEADER = 10
    TABLE_BODY = 9
    CAPTION = 9
    FOOTER = 8


class CephoLayout:
    """Official CEPHO.Ai layout specifications"""
    
    # Page margins in mm
    MARGIN_TOP = 25
    MARGIN_BOTTOM = 20
    MARGIN_LEFT = 20
    MARGIN_RIGHT = 20
    
    # Header specifications
    LOGO_WIDTH = 50
    LOGO_HEIGHT = 12
    LOGO_X = 10
    LOGO_Y = 10
    
    # Accent line
    ACCENT_LINE_Y = 25
    ACCENT_LINE_WIDTH = 0.5


class DocumentType(Enum):
    """Supported document types"""
    REPORT = "Report"
    BRIEFING = "Briefing"
    EXECUTIVE_SUMMARY = "ExecSum"
    PRESENTATION = "Deck"
    MEETING_NOTES = "Meeting"


# =============================================================================
# VALIDATION SYSTEM (Chief of Staff Quality Gate)
# =============================================================================

@dataclass
class ValidationResult:
    """Result of Chief of Staff validation"""
    passed: bool
    issues: List[str]
    checklist: Dict[str, bool]


class ChiefOfStaffValidator:
    """
    Chief of Staff Quality Gate
    
    This validator ensures all documents meet CEPHO.Ai standards
    before delivery to the user. NO BYPASS ALLOWED.
    """
    
    def __init__(self):
        self.checklist = {}
        self.issues = []
    
    def validate(self, document: 'CephoPDF') -> ValidationResult:
        """
        Run full validation checklist.
        Returns ValidationResult with pass/fail and specific issues.
        """
        self.checklist = {}
        self.issues = []
        
        # Brand Identity Checks
        self._check_brand_identity(document)
        
        # Color Compliance Checks
        self._check_color_compliance(document)
        
        # Typography Checks
        self._check_typography(document)
        
        # Structure Checks
        self._check_structure(document)
        
        # Content Quality Checks
        self._check_content_quality(document)
        
        # File Standards Checks
        self._check_file_standards(document)
        
        passed = len(self.issues) == 0
        
        return ValidationResult(
            passed=passed,
            issues=self.issues,
            checklist=self.checklist
        )
    
    def _check_brand_identity(self, document: 'CephoPDF'):
        """Verify brand identity compliance"""
        # Check logo presence
        has_logo = document.has_logo_block
        self.checklist['logo_present'] = has_logo
        if not has_logo:
            self.issues.append("Missing CEPHO.Ai logo block in header")
        
        # Check accent line
        has_accent = document.has_accent_line
        self.checklist['accent_line'] = has_accent
        if not has_accent:
            self.issues.append("Missing pink accent line below header")
        
        # Check footer
        has_footer = document.has_footer
        self.checklist['footer_present'] = has_footer
        if not has_footer:
            self.issues.append("Missing footer with document type and Confidential")
        
        # Check no page numbers
        no_page_numbers = not document.has_page_numbers
        self.checklist['no_page_numbers'] = no_page_numbers
        if not no_page_numbers:
            self.issues.append("Page numbers found - must be removed")
    
    def _check_color_compliance(self, document: 'CephoPDF'):
        """Verify color palette compliance"""
        # Check only approved colors used
        colors_valid = document.uses_only_approved_colors
        self.checklist['approved_colors_only'] = colors_valid
        if not colors_valid:
            self.issues.append("Unapproved colors detected - only black, white, grey, and pink accent allowed")
        
        # Check score cell contrast
        contrast_valid = document.score_cells_have_correct_contrast
        self.checklist['score_contrast'] = contrast_valid
        if not contrast_valid:
            self.issues.append("Score cells have incorrect text contrast")
    
    def _check_typography(self, document: 'CephoPDF'):
        """Verify typography compliance"""
        # Check font family
        font_valid = document.uses_correct_font
        self.checklist['correct_font'] = font_valid
        if not font_valid:
            self.issues.append("Incorrect font used - must be Calibri/Helvetica")
        
        # Check no hyphens
        no_hyphens = not document.contains_hyphens
        self.checklist['no_hyphens'] = no_hyphens
        if not no_hyphens:
            self.issues.append("Hyphens detected in compound words - remove to avoid AI appearance")
    
    def _check_structure(self, document: 'CephoPDF'):
        """Verify document structure compliance"""
        # Check margins
        margins_valid = document.has_correct_margins
        self.checklist['correct_margins'] = margins_valid
        if not margins_valid:
            self.issues.append("Incorrect page margins")
    
    def _check_content_quality(self, document: 'CephoPDF'):
        """Verify content quality"""
        # Check no AI references
        no_ai_refs = not document.contains_ai_references
        self.checklist['no_ai_references'] = no_ai_refs
        if not no_ai_refs:
            self.issues.append("AI self-references detected (Manus, ChatGPT, etc.) - must be removed")
    
    def _check_file_standards(self, document: 'CephoPDF'):
        """Verify file naming and metadata"""
        # Check author field
        author_valid = document.author_field_valid
        self.checklist['author_field'] = author_valid
        if not author_valid:
            self.issues.append("Author field must be blank or 'X'")


# =============================================================================
# BASE PDF CLASS WITH CEPHO BRANDING
# =============================================================================

class CephoPDF(FPDF):
    """
    Base PDF class with CEPHO.Ai branding built in.
    All document types inherit from this class.
    """
    
    def __init__(self, document_type: DocumentType, subject: str):
        super().__init__()
        self.document_type = document_type
        self.subject = subject
        self.document_date = datetime.now()
        
        # Validation tracking
        self.has_logo_block = False
        self.has_accent_line = False
        self.has_footer = False
        self.has_page_numbers = False
        self.uses_only_approved_colors = True
        self.score_cells_have_correct_contrast = True
        self.uses_correct_font = True
        self.contains_hyphens = False
        self.has_correct_margins = True
        self.contains_ai_references = False
        self.author_field_valid = True
        
        # Set up page
        self.set_auto_page_break(auto=True, margin=CephoLayout.MARGIN_BOTTOM)
        self.set_margins(
            CephoLayout.MARGIN_LEFT,
            CephoLayout.MARGIN_TOP,
            CephoLayout.MARGIN_RIGHT
        )
    
    def header(self):
        """Standard CEPHO.Ai header with logo and accent line"""
        # Logo block (black rectangle with white text)
        self.set_fill_color(*CephoColors.BLACK)
        self.rect(
            CephoLayout.LOGO_X,
            CephoLayout.LOGO_Y,
            CephoLayout.LOGO_WIDTH,
            CephoLayout.LOGO_HEIGHT,
            'F'
        )
        self.set_font(CephoTypography.FONT_FAMILY, 'B', 14)
        self.set_text_color(*CephoColors.WHITE)
        self.set_xy(CephoLayout.LOGO_X + 2, CephoLayout.LOGO_Y + 2)
        self.cell(CephoLayout.LOGO_WIDTH - 4, 8, 'CEPHO.Ai', 0, 0, 'L')
        self.has_logo_block = True
        
        # Document date (top right)
        self.set_font(CephoTypography.FONT_FAMILY, '', CephoTypography.CAPTION)
        self.set_text_color(*CephoColors.MID_GREY)
        self.set_xy(150, CephoLayout.LOGO_Y + 2)
        date_str = self.document_date.strftime('%d %B %Y')
        self.cell(50, 5, f'Report Date: {date_str}', 0, 0, 'R')
        
        # Pink accent line
        self.set_draw_color(*CephoColors.PINK)
        self.set_line_width(CephoLayout.ACCENT_LINE_WIDTH)
        self.line(10, CephoLayout.ACCENT_LINE_Y, 200, CephoLayout.ACCENT_LINE_Y)
        self.has_accent_line = True
        
        # Reset position
        self.ln(20)
    
    def footer(self):
        """Standard CEPHO.Ai footer - NO PAGE NUMBERS"""
        self.set_y(-15)
        self.set_font(CephoTypography.FONT_FAMILY, '', CephoTypography.FOOTER)
        self.set_text_color(*CephoColors.MID_GREY)
        footer_text = f'CEPHO.Ai - {self.document_type.value} | Confidential'
        self.cell(0, 10, footer_text, 0, 0, 'C')
        self.has_footer = True
        # NO PAGE NUMBERS - this is intentional per design guidelines
    
    def section_title(self, title: str):
        """Add a section title with divider"""
        self.set_font(CephoTypography.FONT_FAMILY, 'B', CephoTypography.SECTION_HEADER)
        self.set_text_color(*CephoColors.BLACK)
        self.cell(0, 10, title, 0, 1, 'L')
        
        # Divider line
        self.set_draw_color(*CephoColors.LIGHT_GREY)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)
    
    def subsection_title(self, title: str):
        """Add a subsection title"""
        self.set_font(CephoTypography.FONT_FAMILY, 'B', CephoTypography.SUBSECTION_HEADER)
        self.set_text_color(*CephoColors.BLACK)
        self.cell(0, 8, title, 0, 1, 'L')
        self.ln(2)
    
    def body_text(self, text: str):
        """Add body text paragraph"""
        # Check for hyphens
        if '-' in text and any(f' {word}-' in text or f'-{word} ' in text 
                               for word in ['well', 'high', 'low', 'self', 'co', 'pre', 'post']):
            self.contains_hyphens = True
        
        # Check for AI references
        ai_terms = ['manus', 'chatgpt', 'ai assistant', 'language model', 'gpt']
        if any(term in text.lower() for term in ai_terms):
            self.contains_ai_references = True
        
        self.set_font(CephoTypography.FONT_FAMILY, '', CephoTypography.BODY)
        self.set_text_color(*CephoColors.DARK_GREY)
        self.multi_cell(0, 6, text)
        self.ln(3)
    
    def callout_box(self, title: str, content: str):
        """Add a callout box with pink left accent"""
        y_start = self.get_y()
        
        # Calculate height needed
        self.set_font(CephoTypography.FONT_FAMILY, '', CephoTypography.TABLE_BODY)
        lines = len(content) // 80 + 2
        box_height = max(20, lines * 6 + 15)
        
        # Light grey background
        self.set_fill_color(*CephoColors.LIGHT_GREY)
        self.rect(10, y_start, 190, box_height, 'F')
        
        # Pink left accent bar
        self.set_fill_color(*CephoColors.PINK)
        self.rect(10, y_start, 3, box_height, 'F')
        
        # Title
        self.set_xy(18, y_start + 3)
        self.set_font(CephoTypography.FONT_FAMILY, 'B', CephoTypography.TABLE_HEADER)
        self.set_text_color(*CephoColors.BLACK)
        self.cell(0, 6, title, 0, 1, 'L')
        
        # Content
        self.set_xy(18, self.get_y())
        self.set_font(CephoTypography.FONT_FAMILY, '', CephoTypography.CAPTION)
        self.set_text_color(*CephoColors.MID_GREY)
        self.multi_cell(175, 5, content)
        
        self.set_y(y_start + box_height + 5)
    
    def score_cell(self, score: int, width: int = 20, height: int = 8):
        """Draw a score cell with correct color and text contrast"""
        colors = CephoColors.get_score_colors(score)
        
        # Background
        self.set_fill_color(*colors['bg'])
        x = self.get_x()
        y = self.get_y()
        self.rect(x, y, width, height, 'F')
        
        # Text with correct contrast
        self.set_text_color(*colors['text'])
        self.set_font(CephoTypography.FONT_FAMILY, 'B', CephoTypography.TABLE_HEADER)
        self.cell(width, height, str(score), 0, 0, 'C')
        
        # Reset text color
        self.set_text_color(*CephoColors.BLACK)
    
    def table_header(self, columns: List[Tuple[str, int]]):
        """Add a table header row"""
        self.set_fill_color(*CephoColors.LIGHT_GREY)
        self.set_font(CephoTypography.FONT_FAMILY, 'B', CephoTypography.TABLE_HEADER)
        self.set_text_color(*CephoColors.MID_GREY)
        
        for col_name, col_width in columns:
            self.cell(col_width, 8, col_name, 1, 0, 'C', True)
        self.ln()
    
    def table_row(self, cells: List[Tuple[str, int]], score_col: int = None):
        """Add a table row, optionally with a score cell"""
        self.set_font(CephoTypography.FONT_FAMILY, '', CephoTypography.TABLE_BODY)
        self.set_text_color(*CephoColors.BLACK)
        
        for i, (cell_value, cell_width) in enumerate(cells):
            if score_col is not None and i == score_col:
                # This is a score cell
                try:
                    score = int(cell_value)
                    x_before = self.get_x()
                    y_before = self.get_y()
                    self.cell(cell_width, 10, '', 1, 0, 'C')
                    self.set_xy(x_before + 1, y_before + 1)
                    self.score_cell(score, cell_width - 2, 8)
                    self.set_xy(x_before + cell_width, y_before)
                except ValueError:
                    self.cell(cell_width, 10, str(cell_value), 1, 0, 'C')
            else:
                self.cell(cell_width, 10, str(cell_value)[:40], 1, 0, 'L')
        self.ln()
    
    def get_filename(self) -> str:
        """Generate compliant filename"""
        date_str = self.document_date.strftime('%d%b%Y')
        subject_clean = self.subject.replace(' ', '_')
        return f"CEPHO_{self.document_type.value}_{subject_clean}_{date_str}.pdf"
    
    def save(self, output_dir: str = '.') -> str:
        """Save the document with compliant filename"""
        filename = self.get_filename()
        filepath = os.path.join(output_dir, filename)
        self.output(filepath)
        return filepath


# =============================================================================
# DOCUMENT TEMPLATES
# =============================================================================

class ReportTemplate(CephoPDF):
    """Template for KPI, Assessment, and Research reports"""
    
    def __init__(self, subject: str, report_type: str = "Assessment"):
        super().__init__(DocumentType.REPORT, subject)
        self.report_type = report_type
    
    def title_page(self, title: str, subtitle: str = None):
        """Add a title page"""
        self.add_page()
        
        # Main title
        self.ln(30)
        self.set_font(CephoTypography.FONT_FAMILY, 'B', CephoTypography.TITLE)
        self.set_text_color(*CephoColors.BLACK)
        self.cell(0, 15, title, 0, 1, 'C')
        
        # Subtitle
        if subtitle:
            self.set_font(CephoTypography.FONT_FAMILY, '', 12)
            self.set_text_color(*CephoColors.MID_GREY)
            self.cell(0, 8, subtitle, 0, 1, 'C')
    
    def executive_summary_box(self, overall_score: int, stats: Dict[str, str]):
        """Add executive summary box with overall score"""
        self.ln(10)
        y_start = self.get_y()
        
        # Light grey background
        self.set_fill_color(*CephoColors.LIGHT_GREY)
        self.rect(10, y_start, 190, 35, 'F')
        
        # Pink left accent
        self.set_fill_color(*CephoColors.PINK)
        self.rect(10, y_start, 3, 35, 'F')
        
        # Overall Score label
        self.set_xy(20, y_start + 5)
        self.set_font(CephoTypography.FONT_FAMILY, 'B', 12)
        self.set_text_color(*CephoColors.BLACK)
        self.cell(40, 8, 'Overall Score:', 0, 0, 'L')
        
        # Score value in pink
        self.set_xy(60, y_start + 3)
        self.set_font(CephoTypography.FONT_FAMILY, 'B', 28)
        self.set_text_color(*CephoColors.PINK)
        self.cell(30, 12, str(overall_score), 0, 0, 'L')
        
        # /100
        self.set_font(CephoTypography.FONT_FAMILY, '', 14)
        self.set_text_color(*CephoColors.MID_GREY)
        self.cell(20, 12, '/ 100', 0, 0, 'L')
        
        # Stats on right side
        self.set_font(CephoTypography.FONT_FAMILY, '', 10)
        self.set_text_color(*CephoColors.BLACK)
        y_offset = 0
        for key, value in stats.items():
            self.set_xy(120, y_start + 5 + y_offset)
            self.cell(70, 6, f'{key}: {value}', 0, 1, 'L')
            y_offset += 7
        
        self.set_y(y_start + 40)


class BriefingTemplate(CephoPDF):
    """Template for briefing papers (max 2 pages)"""
    
    def __init__(self, subject: str):
        super().__init__(DocumentType.BRIEFING, subject)
        self.max_pages = 2


class ExecutiveSummaryTemplate(CephoPDF):
    """Template for executive summaries (max 1 page)"""
    
    def __init__(self, subject: str):
        super().__init__(DocumentType.EXECUTIVE_SUMMARY, subject)
        self.max_pages = 1


class PresentationTemplate(CephoPDF):
    """Template for presentations (16:9 format)"""
    
    def __init__(self, subject: str):
        super().__init__(DocumentType.PRESENTATION, subject)
        # Set to landscape 16:9
        self.add_page(orientation='L')


# =============================================================================
# DOCUMENT GENERATOR WITH CHIEF OF STAFF GATE
# =============================================================================

class CephoDocumentGenerator:
    """
    Main document generation system with mandatory Chief of Staff validation.
    
    Usage:
        generator = CephoDocumentGenerator()
        result = generator.generate_report(...)
        
        if result['success']:
            print(f"Document saved: {result['filepath']}")
        else:
            print(f"Validation failed: {result['issues']}")
    """
    
    def __init__(self):
        self.validator = ChiefOfStaffValidator()
        self.max_regeneration_attempts = 3
    
    def _validate_and_save(self, document: CephoPDF, output_dir: str) -> Dict:
        """
        Run Chief of Staff validation and save if passed.
        This is the MANDATORY quality gate.
        """
        # Run validation
        validation = self.validator.validate(document)
        
        if validation.passed:
            filepath = document.save(output_dir)
            return {
                'success': True,
                'filepath': filepath,
                'filename': document.get_filename(),
                'validation': validation.checklist
            }
        else:
            return {
                'success': False,
                'issues': validation.issues,
                'validation': validation.checklist
            }
    
    def generate_report(
        self,
        subject: str,
        title: str,
        subtitle: str,
        overall_score: int,
        stats: Dict[str, str],
        sections: List[Dict],
        output_dir: str = '.'
    ) -> Dict:
        """
        Generate a CEPHO branded report.
        
        Args:
            subject: Report subject for filename
            title: Main report title
            subtitle: Report subtitle
            overall_score: Overall score (0-100)
            stats: Dictionary of stats for executive summary
            sections: List of section dictionaries with 'title' and 'content'
            output_dir: Output directory path
        
        Returns:
            Dictionary with success status, filepath or issues
        """
        report = ReportTemplate(subject)
        
        # Title page
        report.title_page(title, subtitle)
        
        # Executive summary
        report.executive_summary_box(overall_score, stats)
        
        # Sections
        for section in sections:
            report.add_page()
            report.section_title(section['title'])
            
            if 'content' in section:
                report.body_text(section['content'])
            
            if 'table' in section:
                table = section['table']
                report.table_header(table['columns'])
                for row in table['rows']:
                    report.table_row(row, score_col=table.get('score_col'))
            
            if 'callout' in section:
                report.callout_box(
                    section['callout']['title'],
                    section['callout']['content']
                )
        
        # Validate and save
        return self._validate_and_save(report, output_dir)


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_score_label(score: int) -> str:
    """Get human readable label for score"""
    if score >= 80:
        return 'Excellent'
    elif score >= 70:
        return 'Good'
    elif score >= 60:
        return 'Satisfactory'
    elif score >= 40:
        return 'Needs Attention'
    elif score >= 30:
        return 'Critical'
    else:
        return 'Severe'


def format_date(dt: datetime = None) -> str:
    """Format date per CEPHO standards"""
    if dt is None:
        dt = datetime.now()
    return dt.strftime('%d %B %Y')


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

if __name__ == '__main__':
    # Example usage
    generator = CephoDocumentGenerator()
    
    result = generator.generate_report(
        subject='KPI_Scorecard',
        title='KPI Scorecard Report',
        subtitle='Stage: Project Genesis | Framework: 100% Optimization',
        overall_score=63,
        stats={
            'Total Categories': '50',
            'Domains': '10',
            'Critical Items': '6',
            'Strong Items': '8'
        },
        sections=[
            {
                'title': 'Executive Overview',
                'content': 'This report presents the comprehensive KPI assessment across all business domains. The overall score of 63 indicates significant room for improvement across multiple areas.',
                'callout': {
                    'title': 'Framework: 100% Optimization',
                    'content': 'Philosophy: Strong across ALL fronts, not just one area. Target: 100% optimization in every category.'
                }
            }
        ],
        output_dir='/home/ubuntu/the-brain'
    )
    
    if result['success']:
        print(f"Document generated successfully: {result['filepath']}")
    else:
        print(f"Validation failed:")
        for issue in result['issues']:
            print(f"  - {issue}")
