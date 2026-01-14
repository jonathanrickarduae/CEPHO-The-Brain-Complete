#!/usr/bin/env python3
"""
Extract all AI-SME bios and thinking styles from aiExperts.ts
and generate a comprehensive PDF for use as a prompt tool.
"""

import re
import json
from fpdf import FPDF
from datetime import datetime

# Read the TypeScript file
with open('/home/ubuntu/the-brain/client/src/data/aiExperts.ts', 'r') as f:
    content = f.read()

# Extract all expert objects using regex
expert_pattern = r'\{\s*id:\s*[\'"]([^"\']+)[\'"],\s*name:\s*[\'"]([^"\']+)[\'"],\s*avatar:\s*[\'"]([^"\']+)[\'"],\s*specialty:\s*[\'"]([^"\']+)[\'"],\s*category:\s*[\'"]([^"\']+)[\'"],\s*compositeOf:\s*\[([^\]]+)\],\s*bio:\s*[\'"]([^"\']+)[\'"],\s*strengths:\s*\[([^\]]+)\],\s*weaknesses:\s*\[([^\]]+)\],\s*thinkingStyle:\s*[\'"]([^"\']+)[\'"]'

# Also match the multi-line format
expert_pattern_multiline = r"id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*avatar:\s*'([^']+)',\s*specialty:\s*'([^']+)',\s*category:\s*'([^']+)',\s*compositeOf:\s*\[([^\]]+)\],\s*bio:\s*'([^']+)',\s*strengths:\s*\[([^\]]+)\],\s*weaknesses:\s*\[([^\]]+)\],\s*thinkingStyle:\s*'([^']+)'"

experts = []

# Find all matches
matches = re.findall(expert_pattern, content, re.DOTALL)
matches_multiline = re.findall(expert_pattern_multiline, content, re.DOTALL)

all_matches = matches + matches_multiline

for match in all_matches:
    expert_id, name, avatar, specialty, category, composite_of, bio, strengths, weaknesses, thinking_style = match
    
    # Clean up the arrays
    composite_list = [s.strip().strip("'\"") for s in composite_of.split(',')]
    strengths_list = [s.strip().strip("'\"") for s in strengths.split(',')]
    weaknesses_list = [s.strip().strip("'\"") for s in weaknesses.split(',')]
    
    experts.append({
        'id': expert_id,
        'name': name,
        'avatar': avatar,
        'specialty': specialty,
        'category': category,
        'compositeOf': composite_list,
        'bio': bio,
        'strengths': strengths_list,
        'weaknesses': weaknesses_list,
        'thinkingStyle': thinking_style
    })

# Remove duplicates based on ID
seen_ids = set()
unique_experts = []
for expert in experts:
    if expert['id'] not in seen_ids:
        seen_ids.add(expert['id'])
        unique_experts.append(expert)

experts = unique_experts

# Sort by category then name
experts.sort(key=lambda x: (x['category'], x['name']))

print(f"Found {len(experts)} unique AI-SME experts")

# Create PDF
class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 12)
        self.cell(0, 10, 'CEPHO AI-SME Expert Directory', 0, 1, 'C')
        self.ln(5)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 14)
        self.set_fill_color(240, 240, 240)
        self.cell(0, 10, title, 0, 1, 'L', True)
        self.ln(4)

    def expert_entry(self, expert):
        # Name and specialty
        self.set_font('Helvetica', 'B', 11)
        name_text = f"{expert['name']} - {expert['specialty']}"
        self.cell(0, 7, name_text, 0, 1)
        
        # Category
        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, f"Category: {expert['category']}", 0, 1)
        self.set_text_color(0, 0, 0)
        
        # Composite of
        self.set_font('Helvetica', 'B', 9)
        self.cell(0, 5, 'Inspired By:', 0, 1)
        self.set_font('Helvetica', '', 9)
        composite_text = ', '.join(expert['compositeOf'])
        self.multi_cell(0, 5, composite_text)
        
        # Bio
        self.set_font('Helvetica', 'B', 9)
        self.cell(0, 5, 'Bio:', 0, 1)
        self.set_font('Helvetica', '', 9)
        self.multi_cell(0, 5, expert['bio'])
        
        # Thinking Style (most important for prompts)
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(0, 100, 0)
        self.cell(0, 5, 'Thinking Style:', 0, 1)
        self.set_font('Helvetica', '', 9)
        self.multi_cell(0, 5, expert['thinkingStyle'])
        self.set_text_color(0, 0, 0)
        
        # Strengths
        self.set_font('Helvetica', 'B', 9)
        self.cell(0, 5, 'Strengths:', 0, 1)
        self.set_font('Helvetica', '', 9)
        strengths_text = ', '.join(expert['strengths'])
        self.multi_cell(0, 5, strengths_text)
        
        # Weaknesses
        self.set_font('Helvetica', 'B', 9)
        self.cell(0, 5, 'Weaknesses:', 0, 1)
        self.set_font('Helvetica', '', 9)
        weaknesses_text = ', '.join(expert['weaknesses'])
        self.multi_cell(0, 5, weaknesses_text)
        
        self.ln(5)
        # Add separator line
        self.set_draw_color(200, 200, 200)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

# Create the PDF
pdf = PDF()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()

# Title page content
pdf.set_font('Helvetica', 'B', 24)
pdf.cell(0, 20, 'AI-SME Expert Directory', 0, 1, 'C')
pdf.set_font('Helvetica', '', 12)
pdf.cell(0, 10, 'Comprehensive Guide to AI Expert Personas', 0, 1, 'C')
pdf.cell(0, 10, f'Total Experts: {len(experts)}', 0, 1, 'C')
pdf.cell(0, 10, f'Generated: {datetime.now().strftime("%B %d, %Y")}', 0, 1, 'C')
pdf.ln(10)

pdf.set_font('Helvetica', '', 10)
pdf.multi_cell(0, 6, 
    'This document contains all AI-SME (Subject Matter Expert) personas from the CEPHO platform. '
    'Each expert has a unique thinking style, strengths, and approach that can be used as prompts '
    'for AI systems to adopt specific expert perspectives.\n\n'
    'Use these personas to:\n'
    '- Guide AI responses with specific expertise\n'
    '- Adopt particular thinking frameworks\n'
    '- Get diverse perspectives on problems\n'
    '- Simulate expert consultations'
)

pdf.ln(10)

# Table of Contents
pdf.set_font('Helvetica', 'B', 14)
pdf.cell(0, 10, 'Categories', 0, 1)
pdf.set_font('Helvetica', '', 10)

categories = {}
for expert in experts:
    cat = expert['category']
    if cat not in categories:
        categories[cat] = []
    categories[cat].append(expert)

for cat, cat_experts in sorted(categories.items()):
    pdf.cell(0, 6, f"- {cat} ({len(cat_experts)} experts)", 0, 1)

# Add experts by category
current_category = None
for expert in experts:
    if expert['category'] != current_category:
        current_category = expert['category']
        pdf.add_page()
        pdf.chapter_title(current_category)
    
    # Check if we need a new page
    if pdf.get_y() > 240:
        pdf.add_page()
        pdf.chapter_title(f"{current_category} (continued)")
    
    pdf.expert_entry(expert)

# Save the PDF
output_path = '/home/ubuntu/the-brain/AI_SME_Expert_Directory.pdf'
pdf.output(output_path)
print(f"PDF saved to: {output_path}")

# Also save as JSON for reference
json_path = '/home/ubuntu/the-brain/AI_SME_Experts.json'
with open(json_path, 'w') as f:
    json.dump(experts, f, indent=2)
print(f"JSON saved to: {json_path}")
