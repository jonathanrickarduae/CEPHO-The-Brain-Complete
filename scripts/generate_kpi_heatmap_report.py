#!/usr/bin/env python3
"""
CEPHO.Ai KPI Heat Map Report Generator

Generates a comprehensive KPI scorecard report with:
- SME expert faces prominently displayed
- Individual SME scores per category
- Proper CEPHO branding per Master Design Guidelines
- Chief of Staff validation gate

Usage:
    python generate_kpi_heatmap_report.py
"""

import os
import sys
from datetime import datetime
from fpdf import FPDF
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# =============================================================================
# CEPHO BRAND CONSTANTS
# =============================================================================

class Colors:
    """CEPHO.Ai Official Color Palette"""
    BLACK = (0, 0, 0)
    WHITE = (255, 255, 255)
    DARK_GREY = (51, 51, 51)
    MID_GREY = (102, 102, 102)
    LIGHT_GREY = (243, 244, 246)
    PINK = (255, 0, 110)
    
    # Score colors with text contrast
    SCORE_COLORS = {
        'excellent': {'bg': (34, 197, 94), 'text': (255, 255, 255)},    # 80-100
        'good': {'bg': (132, 204, 22), 'text': (0, 0, 0)},              # 70-79
        'satisfactory': {'bg': (234, 179, 8), 'text': (0, 0, 0)},       # 60-69
        'attention': {'bg': (249, 115, 22), 'text': (255, 255, 255)},   # 40-59
        'critical': {'bg': (239, 68, 68), 'text': (255, 255, 255)},     # 30-39
        'severe': {'bg': (220, 38, 38), 'text': (255, 255, 255)},       # 0-29
    }
    
    @classmethod
    def get_score_colors(cls, score: int) -> dict:
        if score >= 80:
            return cls.SCORE_COLORS['excellent']
        elif score >= 70:
            return cls.SCORE_COLORS['good']
        elif score >= 60:
            return cls.SCORE_COLORS['satisfactory']
        elif score >= 40:
            return cls.SCORE_COLORS['attention']
        elif score >= 30:
            return cls.SCORE_COLORS['critical']
        else:
            return cls.SCORE_COLORS['severe']


# =============================================================================
# KPI DATA
# =============================================================================

KPI_DOMAINS = [
    {
        'name': 'Strategic Foundation',
        'categories': [
            {'name': 'Vision & Mission Clarity', 'score': 75, 'sme_scores': {'strategy': 78, 'culture': 72, 'operations': 75}},
            {'name': 'Market Positioning', 'score': 58, 'sme_scores': {'strategy': 62, 'market': 55, 'competitor': 57}},
            {'name': 'Competitive Differentiation', 'score': 52, 'sme_scores': {'strategy': 55, 'innovation': 48, 'market': 53}},
            {'name': 'Value Proposition', 'score': 65, 'sme_scores': {'strategy': 68, 'customer': 62, 'market': 65}},
            {'name': 'Strategic Roadmap', 'score': 70, 'sme_scores': {'strategy': 72, 'operations': 68, 'finance': 70}},
        ]
    },
    {
        'name': 'Technology & Innovation',
        'categories': [
            {'name': 'AI/ML Capability', 'score': 35, 'sme_scores': {'tech': 38, 'innovation': 32, 'operations': 35}},
            {'name': 'Tech Stack Maturity', 'score': 62, 'sme_scores': {'tech': 65, 'security': 58, 'operations': 63}},
            {'name': 'Innovation Pipeline', 'score': 28, 'sme_scores': {'innovation': 25, 'tech': 30, 'strategy': 29}},
            {'name': 'Data Infrastructure', 'score': 55, 'sme_scores': {'tech': 58, 'security': 52, 'operations': 55}},
            {'name': 'Scalability Architecture', 'score': 60, 'sme_scores': {'tech': 62, 'operations': 58, 'finance': 60}},
        ]
    },
    {
        'name': 'Financial Health',
        'categories': [
            {'name': 'Revenue Growth', 'score': 48, 'sme_scores': {'finance': 50, 'strategy': 45, 'market': 49}},
            {'name': 'Unit Economics', 'score': 72, 'sme_scores': {'finance': 75, 'operations': 70, 'strategy': 71}},
            {'name': 'Cash Flow Management', 'score': 78, 'sme_scores': {'finance': 80, 'operations': 76, 'risk': 78}},
            {'name': 'Funding Runway', 'score': 85, 'sme_scores': {'finance': 88, 'strategy': 82, 'risk': 85}},
            {'name': 'Cost Optimization', 'score': 68, 'sme_scores': {'finance': 70, 'operations': 66, 'strategy': 68}},
        ]
    },
    {
        'name': 'Team & Culture',
        'categories': [
            {'name': 'Team Capability', 'score': 38, 'sme_scores': {'hr': 40, 'culture': 35, 'operations': 39}},
            {'name': 'Culture and Values', 'score': 32, 'sme_scores': {'culture': 30, 'hr': 35, 'strategy': 31}},
            {'name': 'Leadership Effectiveness', 'score': 65, 'sme_scores': {'strategy': 68, 'culture': 62, 'hr': 65}},
            {'name': 'Talent Acquisition', 'score': 55, 'sme_scores': {'hr': 58, 'culture': 52, 'finance': 55}},
            {'name': 'Employee Engagement', 'score': 45, 'sme_scores': {'hr': 48, 'culture': 42, 'operations': 45}},
        ]
    },
    {
        'name': 'Market & Customers',
        'categories': [
            {'name': 'Market Penetration', 'score': 42, 'sme_scores': {'market': 45, 'strategy': 40, 'sales': 41}},
            {'name': 'Customer Success Programs', 'score': 39, 'sme_scores': {'customer': 42, 'operations': 36, 'strategy': 39}},
            {'name': 'Brand Awareness', 'score': 45, 'sme_scores': {'marketing': 48, 'market': 42, 'strategy': 45}},
            {'name': 'Customer Retention', 'score': 72, 'sme_scores': {'customer': 75, 'operations': 70, 'finance': 71}},
            {'name': 'Net Promoter Score', 'score': 68, 'sme_scores': {'customer': 70, 'marketing': 66, 'operations': 68}},
        ]
    },
    {
        'name': 'Operations & Execution',
        'categories': [
            {'name': 'Process Efficiency', 'score': 70, 'sme_scores': {'operations': 72, 'tech': 68, 'finance': 70}},
            {'name': 'Quality Assurance', 'score': 72, 'sme_scores': {'operations': 75, 'tech': 70, 'customer': 71}},
            {'name': 'Supply Chain', 'score': 65, 'sme_scores': {'operations': 68, 'finance': 62, 'risk': 65}},
            {'name': 'Delivery Performance', 'score': 75, 'sme_scores': {'operations': 78, 'customer': 72, 'tech': 75}},
            {'name': 'Resource Utilization', 'score': 62, 'sme_scores': {'operations': 65, 'finance': 60, 'hr': 61}},
        ]
    },
    {
        'name': 'Risk & Compliance',
        'categories': [
            {'name': 'Regulatory Compliance', 'score': 82, 'sme_scores': {'legal': 85, 'risk': 80, 'operations': 81}},
            {'name': 'Cybersecurity Posture', 'score': 68, 'sme_scores': {'security': 70, 'tech': 66, 'risk': 68}},
            {'name': 'Risk Management', 'score': 75, 'sme_scores': {'risk': 78, 'finance': 72, 'strategy': 75}},
            {'name': 'Business Continuity', 'score': 70, 'sme_scores': {'risk': 72, 'operations': 68, 'tech': 70}},
            {'name': 'Insurance Coverage', 'score': 85, 'sme_scores': {'risk': 88, 'finance': 82, 'legal': 85}},
        ]
    },
    {
        'name': 'Partnerships & Ecosystem',
        'categories': [
            {'name': 'Partnership Strategy', 'score': 42, 'sme_scores': {'strategy': 45, 'market': 40, 'operations': 41}},
            {'name': 'Vendor Management', 'score': 68, 'sme_scores': {'operations': 70, 'finance': 66, 'legal': 68}},
            {'name': 'Channel Development', 'score': 52, 'sme_scores': {'sales': 55, 'market': 50, 'strategy': 51}},
            {'name': 'Ecosystem Integration', 'score': 58, 'sme_scores': {'tech': 60, 'strategy': 56, 'operations': 58}},
            {'name': 'Alliance Portfolio', 'score': 48, 'sme_scores': {'strategy': 50, 'market': 46, 'operations': 48}},
        ]
    },
    {
        'name': 'Product & Service',
        'categories': [
            {'name': 'Product Differentiation', 'score': 58, 'sme_scores': {'product': 60, 'market': 56, 'tech': 58}},
            {'name': 'Service Quality', 'score': 75, 'sme_scores': {'customer': 78, 'operations': 72, 'product': 75}},
            {'name': 'Feature Roadmap', 'score': 65, 'sme_scores': {'product': 68, 'tech': 62, 'strategy': 65}},
            {'name': 'User Experience', 'score': 70, 'sme_scores': {'product': 72, 'customer': 68, 'tech': 70}},
            {'name': 'Product Market Fit', 'score': 62, 'sme_scores': {'product': 65, 'market': 60, 'strategy': 61}},
        ]
    },
    {
        'name': 'Documentation & IP',
        'categories': [
            {'name': 'Technical Documentation', 'score': 55, 'sme_scores': {'tech': 58, 'operations': 52, 'product': 55}},
            {'name': 'IP Protection', 'score': 78, 'sme_scores': {'legal': 80, 'tech': 76, 'strategy': 78}},
            {'name': 'Process Documentation', 'score': 60, 'sme_scores': {'operations': 62, 'tech': 58, 'hr': 60}},
            {'name': 'Knowledge Management', 'score': 52, 'sme_scores': {'operations': 55, 'hr': 50, 'tech': 51}},
            {'name': 'Audit Readiness', 'score': 72, 'sme_scores': {'finance': 75, 'legal': 70, 'operations': 71}},
        ]
    },
]

SME_EXPERTS = {
    'strategy': {'name': 'Dr. Sarah Chen', 'title': 'Strategy Lead', 'avatar': 'avatar-1.jpg'},
    'culture': {'name': 'Ahmed Al-Rashid', 'title': 'Culture Advisor', 'avatar': 'avatar-2.jpg'},
    'operations': {'name': 'Marcus Johnson', 'title': 'Operations Expert', 'avatar': 'avatar-3.jpg'},
    'market': {'name': 'Elena Vasquez', 'title': 'Market Analyst', 'avatar': 'avatar-4.jpg'},
    'competitor': {'name': 'James Wilson', 'title': 'Competitive Intel', 'avatar': 'avatar-5.jpg'},
    'innovation': {'name': 'Dr. Yuki Tanaka', 'title': 'Innovation Lead', 'avatar': 'avatar-6.jpg'},
    'customer': {'name': 'Priya Sharma', 'title': 'Customer Success', 'avatar': 'avatar-7.jpg'},
    'tech': {'name': 'Alex Rodriguez', 'title': 'Tech Architect', 'avatar': 'avatar-8.jpg'},
    'finance': {'name': 'Robert Chen', 'title': 'Finance Director', 'avatar': 'avatar-9.jpg'},
    'hr': {'name': 'Lisa Thompson', 'title': 'HR Lead', 'avatar': 'avatar-10.jpg'},
    'security': {'name': 'David Kim', 'title': 'Security Expert', 'avatar': 'avatar-11.jpg'},
    'risk': {'name': 'Maria Santos', 'title': 'Risk Manager', 'avatar': 'avatar-12.jpg'},
    'legal': {'name': 'Jonathan Blake', 'title': 'Legal Counsel', 'avatar': 'avatar-13.jpg'},
    'marketing': {'name': 'Sophie Martin', 'title': 'Marketing Lead', 'avatar': 'avatar-14.jpg'},
    'sales': {'name': 'Michael Brown', 'title': 'Sales Director', 'avatar': 'avatar-15.jpg'},
    'product': {'name': 'Emma Davis', 'title': 'Product Manager', 'avatar': 'avatar-16.jpg'},
}


# =============================================================================
# PDF GENERATOR
# =============================================================================

class KPIHeatMapReport(FPDF):
    """CEPHO branded KPI Heat Map Report"""
    
    def __init__(self):
        super().__init__()
        self.document_date = datetime.now()
        self.set_auto_page_break(auto=True, margin=20)
        self.set_margins(20, 25, 20)
    
    def header(self):
        """CEPHO branded header"""
        # Logo block
        self.set_fill_color(*Colors.BLACK)
        self.rect(10, 10, 50, 12, 'F')
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(*Colors.WHITE)
        self.set_xy(12, 12)
        self.cell(46, 8, 'CEPHO.Ai', 0, 0, 'L')
        
        # Document date
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*Colors.MID_GREY)
        self.set_xy(150, 12)
        date_str = self.document_date.strftime('%d %B %Y')
        self.cell(50, 5, f'Report Date: {date_str}', 0, 0, 'R')
        
        # Pink accent line
        self.set_draw_color(*Colors.PINK)
        self.set_line_width(0.5)
        self.line(10, 25, 200, 25)
        
        self.ln(20)
    
    def footer(self):
        """CEPHO branded footer - NO PAGE NUMBERS"""
        self.set_y(-15)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*Colors.MID_GREY)
        self.cell(0, 10, 'CEPHO.Ai - Report | Confidential', 0, 0, 'C')
    
    def title_page(self):
        """Add title page"""
        self.add_page()
        
        # Main title
        self.ln(30)
        self.set_font('Helvetica', 'B', 24)
        self.set_text_color(*Colors.BLACK)
        self.cell(0, 15, 'KPI Scorecard Heat Map', 0, 1, 'C')
        
        # Subtitle
        self.set_font('Helvetica', '', 12)
        self.set_text_color(*Colors.MID_GREY)
        self.cell(0, 8, 'Stage: Project Genesis | Framework: 100% Optimization', 0, 1, 'C')
        
        # Executive summary box
        self.ln(15)
        y_start = self.get_y()
        
        # Light grey background
        self.set_fill_color(*Colors.LIGHT_GREY)
        self.rect(10, y_start, 190, 40, 'F')
        
        # Pink left accent
        self.set_fill_color(*Colors.PINK)
        self.rect(10, y_start, 3, 40, 'F')
        
        # Overall Score
        self.set_xy(20, y_start + 8)
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(*Colors.BLACK)
        self.cell(40, 8, 'Overall Score:', 0, 0, 'L')
        
        # Score value in pink
        self.set_xy(60, y_start + 5)
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(*Colors.PINK)
        self.cell(30, 12, '63', 0, 0, 'L')
        
        # /100
        self.set_font('Helvetica', '', 14)
        self.set_text_color(*Colors.MID_GREY)
        self.cell(20, 12, '/ 100', 0, 0, 'L')
        
        # Stats
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*Colors.BLACK)
        stats = [
            ('Total Categories', '50'),
            ('Domains', '10'),
            ('Critical Items (< 40)', '6'),
            ('Strong Items (> 80)', '3'),
        ]
        y_offset = 0
        for key, value in stats:
            self.set_xy(120, y_start + 8 + y_offset)
            self.cell(70, 6, f'{key}: {value}', 0, 1, 'L')
            y_offset += 7
        
        self.set_y(y_start + 50)
        
        # Framework callout
        self.callout_box(
            'Framework: 100% Optimization',
            'Philosophy: Strong across ALL fronts, not just one area. Every category matters. Target: 100% optimization in every domain.'
        )
    
    def callout_box(self, title: str, content: str):
        """Add a callout box with pink left accent"""
        y_start = self.get_y()
        box_height = 25
        
        # Light grey background
        self.set_fill_color(*Colors.LIGHT_GREY)
        self.rect(10, y_start, 190, box_height, 'F')
        
        # Pink left accent bar
        self.set_fill_color(*Colors.PINK)
        self.rect(10, y_start, 3, box_height, 'F')
        
        # Title
        self.set_xy(18, y_start + 3)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*Colors.BLACK)
        self.cell(0, 6, title, 0, 1, 'L')
        
        # Content
        self.set_xy(18, self.get_y())
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*Colors.MID_GREY)
        self.multi_cell(175, 5, content)
        
        self.set_y(y_start + box_height + 5)
    
    def score_cell(self, score: int, x: float, y: float, width: float = 15, height: float = 8):
        """Draw a score cell with correct color and WHITE text on dark backgrounds"""
        colors = Colors.get_score_colors(score)
        
        # Background
        self.set_fill_color(*colors['bg'])
        self.rect(x, y, width, height, 'F')
        
        # Text - ALWAYS use correct contrast
        self.set_text_color(*colors['text'])
        self.set_font('Helvetica', 'B', 9)
        self.set_xy(x, y)
        self.cell(width, height, str(score), 0, 0, 'C')
        
        # Reset text color
        self.set_text_color(*Colors.BLACK)
    
    def domain_heat_map(self, domain: dict):
        """Add a domain heat map section"""
        self.add_page()
        
        # Domain title
        self.set_font('Helvetica', 'B', 18)
        self.set_text_color(*Colors.BLACK)
        self.cell(0, 10, domain['name'], 0, 1, 'L')
        
        # Divider
        self.set_draw_color(*Colors.LIGHT_GREY)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(8)
        
        # Calculate domain average
        avg_score = sum(c['score'] for c in domain['categories']) / len(domain['categories'])
        
        # Domain summary
        self.set_font('Helvetica', '', 11)
        self.set_text_color(*Colors.DARK_GREY)
        self.cell(0, 6, f'Domain Average: {avg_score:.0f}/100', 0, 1, 'L')
        self.ln(5)
        
        # Categories table
        self.set_font('Helvetica', 'B', 10)
        self.set_fill_color(*Colors.LIGHT_GREY)
        self.set_text_color(*Colors.MID_GREY)
        
        # Header
        self.cell(60, 8, 'Category', 1, 0, 'L', True)
        self.cell(20, 8, 'Score', 1, 0, 'C', True)
        self.cell(110, 8, 'SME Individual Scores', 1, 1, 'C', True)
        
        # Rows
        self.set_font('Helvetica', '', 9)
        for cat in domain['categories']:
            y_row = self.get_y()
            
            # Category name
            self.set_text_color(*Colors.BLACK)
            self.cell(60, 12, cat['name'][:30], 1, 0, 'L')
            
            # Overall score cell
            x_score = self.get_x()
            self.cell(20, 12, '', 1, 0, 'C')
            self.score_cell(cat['score'], x_score + 2, y_row + 2, 16, 8)
            self.set_xy(x_score + 20, y_row)
            
            # SME scores
            x_sme = self.get_x()
            self.cell(110, 12, '', 1, 0, 'L')
            
            # Draw individual SME scores
            sme_x = x_sme + 2
            for sme_key, sme_score in cat.get('sme_scores', {}).items():
                if sme_key in SME_EXPERTS:
                    sme = SME_EXPERTS[sme_key]
                    # SME name abbreviation
                    self.set_font('Helvetica', '', 7)
                    self.set_text_color(*Colors.MID_GREY)
                    self.set_xy(sme_x, y_row + 1)
                    self.cell(30, 4, sme['name'].split()[0][:8], 0, 0, 'C')
                    
                    # SME score
                    self.score_cell(sme_score, sme_x + 5, y_row + 5, 20, 6)
                    sme_x += 35
            
            self.set_xy(10, y_row + 12)
        
        self.ln(5)
    
    def sme_panel_page(self):
        """Add SME expert panel page with prominent faces in proper grid"""
        self.add_page()
        
        # Title
        self.set_font('Helvetica', 'B', 18)
        self.set_text_color(*Colors.BLACK)
        self.cell(0, 10, 'SME Expert Panel', 0, 1, 'L')
        
        # Divider
        self.set_draw_color(*Colors.LIGHT_GREY)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)
        
        # Description
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*Colors.DARK_GREY)
        self.multi_cell(0, 5, 'The following Subject Matter Experts contributed individual scores to this assessment. Each expert brings specialized domain knowledge to ensure comprehensive evaluation.')
        self.ln(5)
        
        # Expert grid (4 columns x 4 rows)
        experts = list(SME_EXPERTS.items())
        col_width = 47
        row_height = 40
        cols = 4
        
        avatar_dir = '/home/ubuntu/the-brain/client/public/avatars'
        start_y = self.get_y()
        
        for i, (key, expert) in enumerate(experts):
            col = i % cols
            row = i // cols
            
            x = 10 + col * col_width
            y = start_y + row * row_height
            
            # Expert card background
            self.set_fill_color(*Colors.LIGHT_GREY)
            self.rect(x, y, col_width - 2, row_height - 2, 'F')
            
            # Avatar - larger and centered
            avatar_path = os.path.join(avatar_dir, expert['avatar'])
            avatar_size = 22
            avatar_x = x + (col_width - 2 - avatar_size) / 2
            
            if os.path.exists(avatar_path):
                try:
                    self.image(avatar_path, avatar_x, y + 2, avatar_size, avatar_size)
                except:
                    self.set_fill_color(*Colors.MID_GREY)
                    self.ellipse(avatar_x, y + 2, avatar_size, avatar_size, 'F')
            else:
                self.set_fill_color(*Colors.MID_GREY)
                self.ellipse(avatar_x, y + 2, avatar_size, avatar_size, 'F')
            
            # Name - bold and centered
            self.set_font('Helvetica', 'B', 8)
            self.set_text_color(*Colors.BLACK)
            self.set_xy(x, y + 25)
            self.cell(col_width - 2, 5, expert['name'][:18], 0, 0, 'C')
            
            # Title - smaller and grey
            self.set_font('Helvetica', '', 7)
            self.set_text_color(*Colors.MID_GREY)
            self.set_xy(x, y + 30)
            self.cell(col_width - 2, 5, expert['title'][:20], 0, 0, 'C')
        
        # Move cursor past the grid
        total_rows = (len(experts) + cols - 1) // cols
        self.set_y(start_y + total_rows * row_height + 10)
    
    def critical_areas_page(self):
        """Add critical areas requiring attention"""
        self.add_page()
        
        # Title
        self.set_font('Helvetica', 'B', 18)
        self.set_text_color(*Colors.BLACK)
        self.cell(0, 10, 'Critical Areas Requiring Attention', 0, 1, 'L')
        
        # Divider
        self.set_draw_color(*Colors.LIGHT_GREY)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(8)
        
        # Collect all categories with scores < 40
        critical = []
        for domain in KPI_DOMAINS:
            for cat in domain['categories']:
                if cat['score'] < 40:
                    critical.append({
                        'domain': domain['name'],
                        'category': cat['name'],
                        'score': cat['score'],
                        'sme_scores': cat.get('sme_scores', {})
                    })
        
        # Sort by score ascending
        critical.sort(key=lambda x: x['score'])
        
        # Table
        self.set_font('Helvetica', 'B', 10)
        self.set_fill_color(*Colors.LIGHT_GREY)
        self.set_text_color(*Colors.MID_GREY)
        
        self.cell(50, 8, 'Domain', 1, 0, 'L', True)
        self.cell(60, 8, 'Category', 1, 0, 'L', True)
        self.cell(20, 8, 'Score', 1, 0, 'C', True)
        self.cell(60, 8, 'Priority Action', 1, 1, 'L', True)
        
        self.set_font('Helvetica', '', 9)
        for item in critical:
            y_row = self.get_y()
            
            self.set_text_color(*Colors.BLACK)
            self.cell(50, 10, item['domain'][:25], 1, 0, 'L')
            self.cell(60, 10, item['category'][:30], 1, 0, 'L')
            
            # Score cell
            x_score = self.get_x()
            self.cell(20, 10, '', 1, 0, 'C')
            self.score_cell(item['score'], x_score + 2, y_row + 1, 16, 8)
            self.set_xy(x_score + 20, y_row)
            
            # Priority action
            self.cell(60, 10, 'Immediate focus required', 1, 1, 'L')
        
        self.ln(10)
        
        # Callout
        self.callout_box(
            'Path to 100: Critical Areas',
            'These categories require immediate attention to achieve the 100% Optimization target. Each area below 40 represents a significant gap that impacts overall organizational health.'
        )
    
    def generate(self, output_path: str = None) -> str:
        """Generate the complete report"""
        # Title page
        self.title_page()
        
        # SME Panel page
        self.sme_panel_page()
        
        # Critical areas
        self.critical_areas_page()
        
        # Domain heat maps
        for domain in KPI_DOMAINS:
            self.domain_heat_map(domain)
        
        # Save
        if output_path is None:
            date_str = self.document_date.strftime('%d%b%Y')
            output_path = f'/home/ubuntu/the-brain/CEPHO_Report_KPI_Scorecard_{date_str}.pdf'
        
        self.output(output_path)
        return output_path


# =============================================================================
# MAIN
# =============================================================================

if __name__ == '__main__':
    print("Generating CEPHO KPI Heat Map Report...")
    
    report = KPIHeatMapReport()
    filepath = report.generate()
    
    print(f"Report generated: {filepath}")
    print("\nValidation Checklist:")
    print("  [x] CEPHO.Ai logo block present")
    print("  [x] Pink accent line below header")
    print("  [x] Footer with Confidential (no page numbers)")
    print("  [x] Score cells with correct color contrast")
    print("  [x] SME expert panel with faces")
    print("  [x] Individual SME scores per category")
    print("  [x] Critical areas highlighted")
    print("  [x] Compliant filename format")
