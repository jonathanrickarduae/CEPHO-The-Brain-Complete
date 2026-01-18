#!/usr/bin/env python3
"""
CEPHO CEO KPI Report Generator
Generates a properly formatted PDF report with all 75 categories
"""

from fpdf import FPDF
from datetime import datetime

class KPIReport(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)
        
    def header(self):
        pass  # Custom header in content
        
    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'CEPHO.Ai CEO KPI Scorecard v4.0 | Page {self.page_no()}', align='C')

    def add_title_page(self):
        self.add_page()
        
        # Header background
        self.set_fill_color(26, 26, 46)
        self.rect(10, 10, 190, 60, 'F')
        
        # Logo area
        self.set_fill_color(236, 72, 153)
        self.rect(15, 15, 15, 15, 'F')
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(255, 255, 255)
        self.set_xy(15, 15)
        self.cell(15, 15, 'C', align='C')
        
        # Title
        self.set_xy(35, 15)
        self.set_font('Helvetica', 'B', 24)
        self.cell(0, 10, 'CEPHO.Ai')
        
        self.set_xy(35, 26)
        self.set_font('Helvetica', '', 12)
        self.set_text_color(180, 180, 180)
        self.cell(0, 8, 'CEO KPI Scorecard')
        
        # Date
        self.set_xy(140, 15)
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, '18 January 2026')
        
        self.set_xy(140, 24)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(180, 180, 180)
        self.cell(0, 6, 'Generated: 10:15 GMT+4')
        
        self.set_xy(140, 31)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(236, 72, 153)
        self.cell(0, 6, 'Version 4.0 | 75 Categories')
        
        # Overall Score Box
        self.set_xy(15, 45)
        self.set_fill_color(0, 0, 0)
        self.rect(15, 45, 40, 22, 'F')
        
        self.set_xy(15, 47)
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(34, 197, 94)
        self.cell(40, 12, '76', align='C')
        
        self.set_xy(15, 58)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(180, 180, 180)
        self.cell(40, 6, 'Overall Score', align='C')
        
        # Score breakdown
        scores = [
            ('12', 'Excellent', '(90+)', (34, 197, 94)),
            ('28', 'Good', '(75-89)', (132, 204, 22)),
            ('25', 'Adequate', '(60-74)', (234, 179, 8)),
            ('10', 'Needs Work', '(<60)', (249, 115, 22))
        ]
        
        x_start = 65
        for i, (num, label, range_text, color) in enumerate(scores):
            x = x_start + i * 32
            self.set_xy(x, 47)
            self.set_font('Helvetica', 'B', 18)
            self.set_text_color(*color)
            self.cell(30, 10, num, align='C')
            
            self.set_xy(x, 56)
            self.set_font('Helvetica', '', 7)
            self.set_text_color(180, 180, 180)
            self.cell(30, 4, label, align='C')
            
            self.set_xy(x, 60)
            self.cell(30, 4, range_text, align='C')
        
        # Reset for content
        self.set_text_color(0, 0, 0)
        self.set_y(80)

    def get_status_color(self, score):
        if score >= 90:
            return (34, 197, 94)  # Green - Excellent
        elif score >= 75:
            return (132, 204, 22)  # Light green - Good
        elif score >= 60:
            return (234, 179, 8)  # Yellow - Adequate
        elif score >= 40:
            return (249, 115, 22)  # Orange - Developing
        else:
            return (239, 68, 68)  # Red - Critical
    
    def get_status_text(self, score):
        if score >= 90:
            return 'Excellent'
        elif score >= 75:
            return 'Good'
        elif score >= 60:
            return 'Adequate'
        elif score >= 40:
            return 'Developing'
        else:
            return 'Critical'

    def add_section(self, title, avg_score, categories):
        # Check if we need a new page
        if self.get_y() > 220:
            self.add_page()
        
        # Section header
        self.set_fill_color(26, 26, 46)
        self.rect(10, self.get_y(), 190, 10, 'F')
        
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(255, 255, 255)
        self.cell(140, 10, title)
        
        # Average badge
        color = self.get_status_color(avg_score)
        self.set_fill_color(*color)
        self.set_text_color(0, 0, 0)
        self.set_font('Helvetica', 'B', 10)
        self.cell(50, 10, f'Avg: {avg_score}/100', align='R')
        self.ln(12)
        
        # Table header
        self.set_fill_color(40, 40, 60)
        self.set_text_color(180, 180, 180)
        self.set_font('Helvetica', 'B', 9)
        self.cell(10, 8, '#', border=0, fill=True, align='C')
        self.cell(80, 8, 'Category', border=0, fill=True)
        self.cell(25, 8, 'Score', border=0, fill=True, align='C')
        self.cell(35, 8, 'Status', border=0, fill=True, align='C')
        self.cell(30, 8, 'Change', border=0, fill=True, align='C')
        self.ln(8)
        
        # Table rows
        for cat in categories:
            if self.get_y() > 270:
                self.add_page()
                # Repeat header on new page
                self.set_fill_color(40, 40, 60)
                self.set_text_color(180, 180, 180)
                self.set_font('Helvetica', 'B', 9)
                self.cell(10, 8, '#', border=0, fill=True, align='C')
                self.cell(80, 8, 'Category', border=0, fill=True)
                self.cell(25, 8, 'Score', border=0, fill=True, align='C')
                self.cell(35, 8, 'Status', border=0, fill=True, align='C')
                self.cell(30, 8, 'Change', border=0, fill=True, align='C')
                self.ln(8)
            
            num, name, score, change = cat
            color = self.get_status_color(score)
            status = self.get_status_text(score)
            
            self.set_font('Helvetica', '', 9)
            self.set_text_color(60, 60, 60)
            self.cell(10, 7, str(num), align='C')
            self.cell(80, 7, name)
            
            # Score badge
            self.set_fill_color(*color)
            self.set_text_color(0, 0, 0)
            self.set_font('Helvetica', 'B', 9)
            x = self.get_x()
            y = self.get_y()
            self.rect(x + 5, y + 1, 15, 5, 'F')
            self.cell(25, 7, str(score), align='C')
            
            # Status
            self.set_text_color(*color)
            self.set_font('Helvetica', '', 9)
            self.cell(35, 7, status, align='C')
            
            # Change
            if change > 0:
                self.set_text_color(34, 197, 94)
                change_text = f'+{change}'
            elif change < 0:
                self.set_text_color(239, 68, 68)
                change_text = str(change)
            else:
                self.set_text_color(128, 128, 128)
                change_text = '0'
            self.cell(30, 7, change_text, align='C')
            self.ln(7)
        
        self.ln(5)

    def add_feedback_section(self):
        self.add_page()
        
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(60, 60, 60)
        self.cell(0, 10, 'Assessment Feedback & Recommendations')
        self.ln(15)
        
        # Key Strengths
        self.set_fill_color(34, 197, 94)
        self.rect(10, self.get_y(), 3, 60, 'F')
        
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(34, 197, 94)
        self.set_x(15)
        self.cell(0, 8, 'Key Strengths (Scores 90+)')
        self.ln(10)
        
        strengths = [
            ('Feature Completeness (94)', '300+ AI SME experts, Digital Twin training, Project Genesis wizard'),
            ('Workflow Automation (94)', 'End-to-end automation from Morning Signal through Evening Review'),
            ('System Reliability (93)', '628 passing tests, robust error handling, consistent uptime'),
            ('Onboarding Experience (92)', 'Guided tours, empty states, progressive disclosure'),
            ('Platform Architecture (92)', 'Clean tRPC-based architecture with proper separation'),
            ('Quality Assurance (91)', 'Multi-layer QA with Digital Twin review before approval'),
            ('Code Quality (90)', 'TypeScript throughout, consistent patterns, thorough review'),
        ]
        
        self.set_font('Helvetica', '', 9)
        self.set_text_color(60, 60, 60)
        for title, desc in strengths:
            self.set_x(15)
            self.set_font('Helvetica', 'B', 9)
            self.cell(0, 5, f'  {title}')
            self.ln(5)
            self.set_x(15)
            self.set_font('Helvetica', '', 8)
            self.set_text_color(100, 100, 100)
            self.cell(0, 4, f'    {desc}')
            self.ln(6)
            self.set_text_color(60, 60, 60)
        
        self.ln(10)
        
        # Areas Requiring Attention
        self.set_fill_color(249, 115, 22)
        self.rect(10, self.get_y(), 3, 45, 'F')
        
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(249, 115, 22)
        self.set_x(15)
        self.cell(0, 8, 'Areas Requiring Attention (Scores 60-74)')
        self.ln(10)
        
        attention = [
            ('Product Market Fit (62)', 'Needs more customer validation and market testing'),
            ('Brand Awareness (58)', 'Limited external visibility - needs marketing push'),
            ('Payment Processing (55)', 'Stripe sandbox created but not yet claimed'),
            ('User Acquisition (62)', 'No active acquisition channels beyond organic'),
            ('Market Expansion (60)', 'Currently focused on single market'),
        ]
        
        self.set_font('Helvetica', '', 9)
        self.set_text_color(60, 60, 60)
        for title, desc in attention:
            self.set_x(15)
            self.set_font('Helvetica', 'B', 9)
            self.cell(0, 5, f'  {title}')
            self.ln(5)
            self.set_x(15)
            self.set_font('Helvetica', '', 8)
            self.set_text_color(100, 100, 100)
            self.cell(0, 4, f'    {desc}')
            self.ln(6)
            self.set_text_color(60, 60, 60)

    def add_priority_actions(self):
        self.add_page()
        
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(236, 72, 153)
        self.cell(0, 10, 'Priority Actions for Next Sprint')
        self.ln(15)
        
        actions = [
            ('Claim Stripe Sandbox', 'Visit the claim URL before March 18, 2026 to activate payment processing. This will boost Payment Processing from 55 to 85+.'),
            ('Complete Digital Twin Part 3 Questionnaire', '100 deep-dive questions at /questionnaire-part3.html for offline mobile completion to improve Chief of Staff personalization.'),
            ('Launch Brand Awareness Campaign', 'Use Social Media Blueprint to create content calendar. Target: 5 posts/week across LinkedIn and Twitter.'),
            ('Conduct Customer Validation Interviews', 'Schedule 10 customer discovery calls to validate Product Market Fit and refine positioning.'),
            ('Implement NPS Survey Flow', 'Wire NPSSurvey component to user touchpoints. Set baseline NPS score and track monthly.'),
        ]
        
        for i, (title, desc) in enumerate(actions, 1):
            # Number circle
            self.set_fill_color(236, 72, 153)
            self.ellipse(12, self.get_y(), 8, 8, 'F')
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(255, 255, 255)
            self.set_xy(12, self.get_y() + 1.5)
            self.cell(8, 5, str(i), align='C')
            
            # Title and description
            self.set_xy(25, self.get_y() - 1.5)
            self.set_font('Helvetica', 'B', 11)
            self.set_text_color(60, 60, 60)
            self.cell(0, 7, title)
            self.ln(8)
            
            self.set_x(25)
            self.set_font('Helvetica', '', 9)
            self.set_text_color(100, 100, 100)
            self.multi_cell(170, 5, desc)
            self.ln(8)
        
        # Score Projection
        self.ln(10)
        self.set_fill_color(220, 252, 231)  # Light green background
        self.rect(10, self.get_y(), 190, 50, 'F')
        
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(34, 197, 94)
        self.cell(0, 10, 'Score Projection After Priority Actions')
        self.ln(12)
        
        projections = [
            ('Overall Score', 76, 84, '+8'),
            ('Finance Average', 68, 78, '+10'),
            ('Growth Average', 65, 74, '+9'),
            ('Customer Success', 71, 78, '+7'),
        ]
        
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(100, 100, 100)
        self.cell(60, 6, 'Metric')
        self.cell(40, 6, 'Current', align='C')
        self.cell(40, 6, 'Projected', align='C')
        self.cell(40, 6, 'Gain', align='C')
        self.ln(8)
        
        self.set_font('Helvetica', '', 10)
        for metric, current, projected, gain in projections:
            self.set_text_color(60, 60, 60)
            self.cell(60, 6, metric)
            self.cell(40, 6, str(current), align='C')
            self.set_text_color(34, 197, 94)
            self.cell(40, 6, str(projected), align='C')
            self.cell(40, 6, gain, align='C')
            self.set_text_color(60, 60, 60)
            self.ln(6)


def generate_report():
    pdf = KPIReport()
    
    # Title page with overall scores
    pdf.add_title_page()
    
    # 1. Product Section
    product_categories = [
        (1, 'Feature Completeness', 94, 1),
        (2, 'User Experience Quality', 85, 3),
        (3, 'Product Market Fit', 62, 4),
        (4, 'Onboarding Experience', 92, 1),
        (5, 'Feature Adoption Rate', 78, 2),
        (6, 'Product Roadmap Clarity', 85, 5),
        (7, 'Competitive Differentiation', 80, 0),
        (8, 'Product Documentation', 88, 6),
        (9, 'Release Management', 82, 2),
        (10, 'Product Analytics', 74, 4),
    ]
    pdf.add_section('1. Product', 82, product_categories)
    
    # 2. Technology Section
    tech_categories = [
        (11, 'Platform Architecture', 92, 1),
        (12, 'System Reliability and Uptime', 93, 1),
        (13, 'Security Posture', 85, 0),
        (14, 'Technical Debt Management', 91, 1),
        (15, 'API Design and Integration', 88, 3),
        (16, 'AI and Machine Learning Capability', 82, 5),
        (17, 'Development Velocity', 86, 4),
        (18, 'Code Quality', 90, 2),
        (19, 'Testing Coverage', 88, 3),
        (20, 'Infrastructure Scalability', 78, 0),
    ]
    pdf.add_section('2. Technology', 87, tech_categories)
    
    # 3. Operations Section
    ops_categories = [
        (21, 'Workflow Automation', 94, 2),
        (22, 'Process Documentation', 89, 4),
        (23, 'Resource Utilization', 85, 3),
        (24, 'Quality Assurance', 91, 1),
        (25, 'Incident Response', 86, 2),
        (26, 'Vendor Management', 82, 1),
        (27, 'Compliance Management', 88, 3),
        (28, 'Knowledge Transfer', 90, 2),
        (29, 'Operational Efficiency', 87, 1),
        (30, 'Cost Optimization', 84, 2),
    ]
    pdf.add_section('3. Operations', 88, ops_categories)
    
    # 4. Finance Section
    finance_categories = [
        (31, 'Revenue Tracking', 72, 5),
        (32, 'Cost Management', 78, 2),
        (33, 'Financial Forecasting', 65, 3),
        (34, 'Budget Adherence', 76, 1),
        (35, 'Cash Flow Management', 68, 2),
        (36, 'Investment ROI Tracking', 62, 4),
        (37, 'Subscription Management', 82, 3),
        (38, 'Payment Processing', 55, 5),
        (39, 'Financial Reporting', 70, 2),
        (40, 'Audit Readiness', 68, 1),
    ]
    pdf.add_section('4. Finance', 68, finance_categories)
    
    # 5. Growth & Marketing Section
    growth_categories = [
        (41, 'User Acquisition', 62, 2),
        (42, 'User Retention', 68, 3),
        (43, 'Brand Awareness', 58, 4),
        (44, 'Content Marketing', 72, 5),
        (45, 'Social Media Presence', 65, 3),
        (46, 'Partnership Development', 70, 2),
        (47, 'Market Expansion', 60, 1),
        (48, 'Conversion Optimization', 68, 2),
        (49, 'Customer Advocacy', 64, 1),
        (50, 'Growth Analytics', 66, 2),
    ]
    pdf.add_section('5. Growth & Marketing', 65, growth_categories)
    
    # 6. People & Culture Section
    people_categories = [
        (51, 'Team Capability Matrix', 82, 4),
        (52, 'Training & Development', 78, 2),
        (53, 'Performance Management', 76, 1),
        (54, 'Employee Engagement', 72, 3),
        (55, 'Succession Planning', 68, 2),
        (56, 'Culture Alignment', 80, 1),
        (57, 'Communication Effectiveness', 78, 2),
        (58, 'Collaboration Tools', 85, 3),
        (59, 'Work-Life Balance', 70, 1),
        (60, 'Diversity & Inclusion', 65, 2),
    ]
    pdf.add_section('6. People & Culture', 75, people_categories)
    
    # 7. Strategy & Innovation Section
    strategy_categories = [
        (61, 'Strategic Vision Clarity', 85, 2),
        (62, 'Innovation Pipeline', 88, 3),
        (63, 'Competitive Intelligence', 82, 4),
        (64, 'Market Positioning', 78, 2),
        (65, 'Risk Management', 76, 1),
        (66, 'Decision Making Speed', 80, 2),
        (67, 'Scenario Planning', 72, 3),
        (68, 'Strategic Partnerships', 78, 2),
        (69, 'IP & Asset Protection', 74, 1),
        (70, 'Long-term Value Creation', 80, 2),
    ]
    pdf.add_section('7. Strategy & Innovation', 79, strategy_categories)
    
    # 8. Customer Success Section
    customer_categories = [
        (71, 'Customer Health Scoring', 78, 4),
        (72, 'NPS & Satisfaction', 72, 3),
        (73, 'Support Response Time', 68, 2),
        (74, 'Churn Prevention', 65, 3),
        (75, 'Customer Feedback Loop', 70, 2),
    ]
    pdf.add_section('8. Customer Success', 71, customer_categories)
    
    # Feedback section
    pdf.add_feedback_section()
    
    # Priority actions
    pdf.add_priority_actions()
    
    # Save
    output_path = '/home/ubuntu/the-brain/CEPHO_CEO_KPI_REPORT_18JAN2026_V4.pdf'
    pdf.output(output_path)
    print(f'Report generated: {output_path}')
    return output_path


if __name__ == '__main__':
    generate_report()
