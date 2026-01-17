#!/usr/bin/env python3
"""Identify SME experts that need photos generated."""

import os
import re

# All SME experts from the MASTER_SME_TEAM_DOCUMENT.md
SME_EXPERTS = [
    # Investment and Finance (22)
    {"name": "Warren Value", "specialty": "Value Investing", "gender": "male", "age": "70s", "ethnicity": "Caucasian"},
    {"name": "Peter Growth", "specialty": "Venture Capital", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Ray Macro", "specialty": "Macro Economics", "gender": "male", "age": "70s", "ethnicity": "Caucasian"},
    {"name": "Cathie Disrupt", "specialty": "Disruptive Innovation", "gender": "female", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Michael Quant", "specialty": "Quantitative Finance", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Carl Activist", "specialty": "Activist Investing", "gender": "male", "age": "80s", "ethnicity": "Caucasian"},
    {"name": "David Distress", "specialty": "Distressed Investing", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Jamie Banking", "specialty": "Investment Banking", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Stephen Private", "specialty": "Private Equity", "gender": "male", "age": "70s", "ethnicity": "Caucasian"},
    {"name": "John Bonds", "specialty": "Fixed Income", "gender": "male", "age": "70s", "ethnicity": "Caucasian"},
    {"name": "Abigail Wealth", "specialty": "Wealth Management", "gender": "female", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Sallie Fintech", "specialty": "Fintech", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Larry Passive", "specialty": "Index Investing", "gender": "male", "age": "70s", "ethnicity": "Caucasian"},
    {"name": "Ken Hedge", "specialty": "Hedge Funds", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Nassim Risk", "specialty": "Risk Management", "gender": "male", "age": "60s", "ethnicity": "Middle Eastern"},
    {"name": "Mohamed Emerging", "specialty": "Emerging Markets", "gender": "male", "age": "80s", "ethnicity": "Caucasian"},
    {"name": "Jane ESG", "specialty": "ESG Investing", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Thomas Crypto", "specialty": "Cryptocurrency", "gender": "male", "age": "40s", "ethnicity": "Caucasian"},
    {"name": "Sarah Angel", "specialty": "Angel Investing", "gender": "female", "age": "40s", "ethnicity": "Caucasian"},
    {"name": "Robert Real Assets", "specialty": "Real Assets", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Patricia Pension", "specialty": "Pension Investing", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "William Commodities", "specialty": "Commodities", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    
    # Entrepreneurship and Strategy (23)
    {"name": "Elon Moonshot", "specialty": "Moonshot Ventures", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Richard Maverick", "specialty": "Brand Disruption", "gender": "male", "age": "70s", "ethnicity": "Caucasian"},
    {"name": "Jack Global", "specialty": "Platform Business", "gender": "male", "age": "60s", "ethnicity": "East Asian"},
    {"name": "Sara Bootstrap", "specialty": "Bootstrapping", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Reid Network", "specialty": "Network Effects", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Steve Product", "specialty": "Product Vision", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Howard Service", "specialty": "Service Excellence", "gender": "male", "age": "70s", "ethnicity": "Caucasian"},
    {"name": "Michael Franchise", "specialty": "Franchise Models", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Indra Operations", "specialty": "Operations", "gender": "female", "age": "60s", "ethnicity": "South Asian"},
    {"name": "Meg Turnaround", "specialty": "Turnaround", "gender": "female", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Whitney Social", "specialty": "Social Enterprise", "gender": "female", "age": "30s", "ethnicity": "Caucasian"},
    {"name": "Marc SaaS", "specialty": "SaaS Business", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Brian Marketplace", "specialty": "Marketplace", "gender": "male", "age": "40s", "ethnicity": "Caucasian"},
    {"name": "Bernard Luxury", "specialty": "Luxury Brands", "gender": "male", "age": "70s", "ethnicity": "Caucasian"},
    {"name": "Patrick Payments", "specialty": "Payments", "gender": "male", "age": "30s", "ethnicity": "Caucasian"},
    {"name": "Daniel Pivot", "specialty": "Pivots", "gender": "male", "age": "40s", "ethnicity": "Caucasian"},
    {"name": "Anne Corporate", "specialty": "Corporate Innovation", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Travis Blitz", "specialty": "Blitzscaling", "gender": "male", "age": "40s", "ethnicity": "Caucasian"},
    {"name": "Jessica DTC", "specialty": "Direct-to-Consumer", "gender": "female", "age": "40s", "ethnicity": "Caucasian"},
    {"name": "Daymond Hustle", "specialty": "Bootstrapping", "gender": "male", "age": "50s", "ethnicity": "African American"},
    {"name": "Arianna Wellness", "specialty": "Wellness", "gender": "female", "age": "70s", "ethnicity": "Greek"},
    {"name": "Kevin Shark", "specialty": "Deal-Making", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Tim Ferriss", "specialty": "Lifestyle Business", "gender": "male", "age": "40s", "ethnicity": "Caucasian"},
    
    # Healthcare and Biotech (25)
    {"name": "Elizabeth Pharma", "specialty": "Pharmaceutical", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "James Biotech", "specialty": "Biotechnology", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Mary Clinical", "specialty": "Clinical Trials", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "David Medical Device", "specialty": "Medical Devices", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Sarah Digital Health", "specialty": "Digital Health", "gender": "female", "age": "40s", "ethnicity": "Caucasian"},
    {"name": "Michael Hospital", "specialty": "Hospital Systems", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Jennifer Genomics", "specialty": "Genomics", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Robert Regulatory", "specialty": "FDA Regulatory", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Lisa Payer", "specialty": "Payer Strategy", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Thomas Oncology", "specialty": "Oncology", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Patricia Neurology", "specialty": "Neurology", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "William Rare Disease", "specialty": "Rare Diseases", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Karen Mental Health", "specialty": "Mental Health", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Steven Vaccines", "specialty": "Vaccines", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Nancy Nursing", "specialty": "Nursing", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "George Surgical", "specialty": "Surgery", "gender": "male", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Helen Aging", "specialty": "Geriatrics", "gender": "female", "age": "60s", "ethnicity": "Caucasian"},
    {"name": "Richard Cardiology", "specialty": "Cardiology", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Emily Pediatrics", "specialty": "Pediatrics", "gender": "female", "age": "40s", "ethnicity": "Caucasian"},
    {"name": "Daniel Diabetes", "specialty": "Diabetes", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Laura Womens Health", "specialty": "Women's Health", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Mark Cannabis", "specialty": "Medical Cannabis", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Susan Regenerative", "specialty": "Regenerative Medicine", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Andrew AI Health", "specialty": "AI Healthcare", "gender": "male", "age": "40s", "ethnicity": "Caucasian"},
    {"name": "Jessica Public Health", "specialty": "Public Health", "gender": "female", "age": "50s", "ethnicity": "Caucasian"},
    
    # Regional Specialists (29)
    {"name": "Sheikh Khalid Al-Rashid", "specialty": "Gulf Markets", "gender": "male", "age": "50s", "ethnicity": "Arab"},
    {"name": "Fatima Al-Saud", "specialty": "Saudi Arabia", "gender": "female", "age": "40s", "ethnicity": "Arab"},
    {"name": "Rashid Al-Maktoum", "specialty": "Qatar", "gender": "male", "age": "50s", "ethnicity": "Arab"},
    {"name": "Ahmed Hassan", "specialty": "MENA", "gender": "male", "age": "50s", "ethnicity": "Arab"},
    {"name": "Amira Khalil", "specialty": "Levant", "gender": "female", "age": "40s", "ethnicity": "Arab"},
    {"name": "Sarah Cohen", "specialty": "Israel Innovation", "gender": "female", "age": "40s", "ethnicity": "Jewish"},
    {"name": "Priya Sharma", "specialty": "India", "gender": "female", "age": "40s", "ethnicity": "South Asian"},
    {"name": "Li Wei", "specialty": "China", "gender": "male", "age": "50s", "ethnicity": "East Asian"},
    {"name": "Michael Chen", "specialty": "Taiwan", "gender": "male", "age": "50s", "ethnicity": "East Asian"},
    {"name": "Yuki Tanaka", "specialty": "Japan Korea", "gender": "female", "age": "40s", "ethnicity": "East Asian"},
    {"name": "Nguyen Thi Mai", "specialty": "Southeast Asia", "gender": "female", "age": "40s", "ethnicity": "Southeast Asian"},
    {"name": "Raj Malhotra", "specialty": "Singapore", "gender": "male", "age": "50s", "ethnicity": "South Asian"},
    {"name": "Maria Santos", "specialty": "Brazil", "gender": "female", "age": "40s", "ethnicity": "Latin American"},
    {"name": "Carlos Mendoza", "specialty": "Andean Region", "gender": "male", "age": "50s", "ethnicity": "Latin American"},
    {"name": "Isabella Rodriguez", "specialty": "Mexico", "gender": "female", "age": "40s", "ethnicity": "Latin American"},
    {"name": "Patricia Fernandez", "specialty": "Argentina", "gender": "female", "age": "50s", "ethnicity": "Latin American"},
    {"name": "Hans Mueller", "specialty": "Germany", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Pierre Dubois", "specialty": "France", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Sven Eriksson", "specialty": "Nordics", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Thomas Andersson", "specialty": "Finland Baltic", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Jan Kowalski", "specialty": "Central Europe", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Anastasia Papadopoulos", "specialty": "Greece", "gender": "female", "age": "40s", "ethnicity": "Greek"},
    {"name": "Dmitri Volkov", "specialty": "Russia", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Elena Petrova", "specialty": "Ukraine", "gender": "female", "age": "40s", "ethnicity": "Caucasian"},
    {"name": "Oluwaseun Adeyemi", "specialty": "Africa", "gender": "male", "age": "40s", "ethnicity": "African"},
    {"name": "Kofi Asante", "specialty": "West Africa", "gender": "male", "age": "50s", "ethnicity": "African"},
    {"name": "Aisha Okonkwo", "specialty": "East Africa", "gender": "female", "age": "40s", "ethnicity": "African"},
    {"name": "Lucas van der Berg", "specialty": "South Africa", "gender": "male", "age": "50s", "ethnicity": "Caucasian"},
    {"name": "Sophie Tremblay", "specialty": "Canada", "gender": "female", "age": "40s", "ethnicity": "Caucasian"},
]

def name_to_filename(name):
    """Convert expert name to expected filename format."""
    return name.lower().replace(" ", "-").replace("'", "") + ".jpg"

def main():
    avatars_dir = "/home/ubuntu/the-brain/client/public/avatars"
    existing_files = set(os.listdir(avatars_dir))
    
    missing = []
    found = []
    
    for expert in SME_EXPERTS:
        filename = name_to_filename(expert["name"])
        if filename in existing_files:
            found.append(expert)
        else:
            missing.append(expert)
    
    print(f"Total SME Experts: {len(SME_EXPERTS)}")
    print(f"Found photos: {len(found)}")
    print(f"Missing photos: {len(missing)}")
    print("\n--- Missing Photos ---")
    for expert in missing:
        print(f"- {expert['name']} ({expert['specialty']}, {expert['gender']}, {expert['age']}, {expert['ethnicity']})")
    
    # Output JSON for generation
    print("\n--- JSON for Generation ---")
    import json
    print(json.dumps(missing, indent=2))

if __name__ == "__main__":
    main()
