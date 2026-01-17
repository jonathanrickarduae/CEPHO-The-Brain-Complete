# Investor Grade Financial Modeling Framework

**Blueprint ID:** CEPHO-BP-015  
**Version:** 2.0  
**Date:** January 2026  
**Status:** Active  
**Category:** Financial Operations

---

## Cover Page Standards

Every financial model produced under this framework must include a cover page with the following elements:

| Element | Description |
|---------|-------------|
| **Company/Project Name** | Prominently displayed at top center |
| **Document Title** | "Financial Model" or "Business Valuation Model" |
| **Date** | Model creation or last update date |
| **Version Number** | v1.0, v1.1, etc. |
| **Prepared By** | Author or firm name |
| **Confidentiality Notice** | Standard disclaimer text |
| **Status** | Draft, Review, or Final |

---

## Part 1: Model Architecture Standards

### 1.1 Tab Structure

Every model follows this standardized tab structure:

| Tab Name | Purpose | Color Code |
|----------|---------|------------|
| **Cover** | Model identification and navigation | Dark Grey |
| **Dashboard** | Executive summary with scenario toggle | Black |
| **Assumptions** | All inputs with source references | Blue |
| **Revenue Build** | Detailed revenue projections | White |
| **Cost Build** | Operating cost detail | White |
| **Model** | Three statement model (P&L, BS, CF) | Grey |
| **DCF** | Discounted cash flow valuation | Grey |
| **Sensitivity** | Data tables and tornado charts | Light Grey |
| **Scenarios** | Side by side scenario comparison | Light Grey |
| **Comps** | Comparable company analysis | Light Grey |
| **Tax & Reg** | Jurisdiction specific rates | White |
| **Audit Trail** | Source index and change log | White |

### 1.2 Formatting Standards

| Element | Standard |
|---------|----------|
| **Input Cells** | Blue font, yellow fill |
| **Formula Cells** | Black font, no fill |
| **Linked Cells** | Green font, no fill |
| **Hard Coded Numbers** | Red font (to be minimized) |
| **Headers** | Bold, grey background |
| **Currency** | No decimals for large numbers, 2 decimals for per unit |
| **Percentages** | 1 decimal place |
| **Dates** | DD-MMM-YYYY format |

### 1.3 Header on Every Tab

Each tab must display a consistent header:

| Row | Content |
|-----|---------|
| Row 1 | Company/Project Name (left aligned) |
| Row 2 | Tab Purpose Description |
| Row 3 | Last Updated: [Date] |
| Row 4 | Blank separator row |

---

## Part 2: Automated Research Triggers

### 2.1 Industry Benchmark Database

At project initiation, the following industry benchmarks must be researched and populated:

| Metric | Description | Source Priority |
|--------|-------------|-----------------|
| **Gross Margin** | Industry average and quartile ranges | IBISWorld, S&P Capital IQ, Industry Reports |
| **EBITDA Margin** | Operating profitability benchmark | Public company filings, Industry associations |
| **SG&A as % Revenue** | Overhead efficiency | Comparable company analysis |
| **Revenue per Employee** | Productivity metric | Industry benchmarks |
| **Customer Churn Rate** | Retention benchmark (if applicable) | SaaS metrics, Industry reports |
| **Customer Acquisition Cost** | Marketing efficiency | Industry benchmarks |
| **Working Capital % Revenue** | Cash cycle efficiency | Public company filings |

### 2.2 Valuation Multiples Lookup

The Comps tab must be populated with current market data:

| Multiple | Application | Data Sources |
|----------|-------------|--------------|
| **EV/Revenue** | High growth, pre-profit companies | Capital IQ, PitchBook, Public filings |
| **EV/EBITDA** | Mature companies, standard valuation | Capital IQ, Bloomberg, Public filings |
| **EV/EBIT** | Capital intensive businesses | Public filings |
| **P/E Ratio** | Profitable public comparables | Yahoo Finance, Bloomberg |
| **Price/Book** | Asset heavy industries | Public filings |

**Minimum Requirements:**
The comparable company analysis must include at least five comparable companies with the following data points: company name, market cap, enterprise value, revenue, EBITDA, and calculated multiples.

### 2.3 Tax and Regulatory Table

A standardized table must be completed for each jurisdiction:

| Field | Description |
|-------|-------------|
| **Country/Region** | Primary operating jurisdiction |
| **Corporate Tax Rate** | Standard rate and any special rates |
| **VAT/GST Rate** | Indirect tax rate |
| **Withholding Tax** | On dividends, interest, royalties |
| **Social Security/Payroll Tax** | Employer contribution rates |
| **Regulatory Fees** | Industry specific licenses, permits |
| **Transfer Pricing Rules** | Intercompany transaction requirements |
| **Tax Incentives** | Free zones, R&D credits, investment allowances |

#### GCC Tax Reference Table

| Jurisdiction | Corporate Tax | VAT | Notes |
|--------------|---------------|-----|-------|
| **UAE** | 9% (above AED 375k) | 5% | Free zone exemptions available |
| **Saudi Arabia** | 20% | 15% | Zakat for Saudi owned entities |
| **Qatar** | 10% | 0% | No VAT currently |
| **Bahrain** | 0% | 10% | No corporate tax |
| **Oman** | 15% | 5% | Standard rate |
| **Kuwait** | 15% | 0% | Foreign companies only |

---

## Part 3: Standard Calculation Library

### 3.1 Core Financial Formulas

| Calculation | Excel Formula | Purpose |
|-------------|---------------|---------|
| **Dynamic Lookup** | `=INDEX(range,MATCH(lookup,column,0),MATCH(lookup,row,0))` | Replace VLOOKUP for flexibility |
| **Scenario Toggle** | `=CHOOSE(ScenarioSelector,Base,Bull,Bear,Stress)` | Switch between scenarios |
| **Conditional Sum** | `=SUMIFS(sum_range,criteria_range1,criteria1,...)` | Revenue by segment, cohort analysis |
| **NPV with Dates** | `=XNPV(rate,cash_flows,dates)` | Accurate present value calculation |
| **IRR with Dates** | `=XIRR(cash_flows,dates)` | Accurate return calculation |
| **Loan Payment** | `=PMT(rate/12,periods*12,-principal)` | Debt schedule |
| **Interest Portion** | `=IPMT(rate/12,period,periods*12,-principal)` | Interest expense calculation |
| **Rolling Average** | `=AVERAGE(OFFSET(start_cell,0,0,1,periods))` | Trailing metrics |

### 3.2 Valuation Formulas

| Calculation | Formula | Notes |
|-------------|---------|-------|
| **WACC** | `=E/(D+E)*Ke + D/(D+E)*Kd*(1-T)` | Weighted average cost of capital |
| **Cost of Equity (CAPM)** | `=Rf + Beta*(Rm-Rf) + Size Premium` | Risk adjusted return |
| **Terminal Value (Perpetuity)** | `=FCF*(1+g)/(WACC-g)` | Gordon growth model |
| **Terminal Value (Exit Multiple)** | `=EBITDA*Exit_Multiple` | Market based approach |
| **Enterprise Value** | `=NPV(WACC,FCFs) + PV(Terminal Value)` | Sum of discounted cash flows |
| **Equity Value** | `=Enterprise Value - Net Debt + Cash` | Value to shareholders |

### 3.3 Operational Metrics Formulas

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **Gross Margin** | `=(Revenue-COGS)/Revenue` | Production efficiency |
| **EBITDA Margin** | `=EBITDA/Revenue` | Operating profitability |
| **Net Margin** | `=Net Income/Revenue` | Bottom line profitability |
| **ROI** | `=(Gain-Cost)/Cost` | Investment return |
| **ROE** | `=Net Income/Shareholders Equity` | Return to equity holders |
| **ROA** | `=Net Income/Total Assets` | Asset efficiency |
| **Current Ratio** | `=Current Assets/Current Liabilities` | Short term liquidity |
| **Quick Ratio** | `=(Cash+Receivables)/Current Liabilities` | Immediate liquidity |
| **DSO** | `=(Avg Receivables/Revenue)*365` | Collection efficiency |
| **DPO** | `=(Avg Payables/COGS)*365` | Payment timing |
| **Inventory Turns** | `=COGS/Avg Inventory` | Stock efficiency |
| **Cash Conversion Cycle** | `=DSO + DIO - DPO` | Working capital cycle |

### 3.4 Breakeven and Payback Formulas

| Calculation | Formula | Application |
|-------------|---------|-------------|
| **Breakeven Units** | `=Fixed Costs/(Price-Variable Cost per Unit)` | Volume required |
| **Breakeven Revenue** | `=Fixed Costs/Contribution Margin %` | Revenue required |
| **Payback Period** | `=Initial Investment/Annual Cash Flow` | Simple payback |
| **Discounted Payback** | Count periods until cumulative PV > 0 | Time value adjusted |

---

## Part 4: SME Escalation Protocol

### 4.1 Trigger Questions

Before finalizing any model, answer the following questions. If "Yes" to any, an SME consultation is required:

| Question | Required SME | Action |
|----------|--------------|--------|
| Does the model involve financial derivatives or hedging instruments? | Quantitative Analyst | Document derivative terms, request pricing model |
| Are there complex revenue recognition rules (multi-element arrangements, long term contracts)? | Technical Accountant | Request revenue recognition memo |
| Does the valuation depend on intellectual property with no market comparables? | IP Valuation Specialist | Request IP valuation report |
| Are there multi-jurisdictional tax implications beyond standard rates? | International Tax Advisor | Request tax structure memo |
| Does the business operate in a heavily regulated industry (healthcare, financial services)? | Industry Regulatory Expert | Request compliance checklist |
| Are there contingent liabilities or earn-out structures? | M&A Legal Counsel | Request legal structure memo |
| Does the model require Monte Carlo simulation for key variables? | Quantitative Analyst | Request simulation parameters |

### 4.2 SME Request Template

When SME input is required, submit the following:

| Field | Content |
|-------|---------|
| **Request ID** | Unique identifier |
| **Date Submitted** | Submission date |
| **Project Name** | Company/project being modeled |
| **Question/Issue** | Specific question requiring expertise |
| **Context** | Background information |
| **Impact on Model** | Which assumptions/outputs are affected |
| **Deadline** | Required response date |
| **Priority** | High, Medium, Low |

---

## Part 5: Dashboard Standards

### 5.1 Required Dashboard Metrics

Every model dashboard must display the following metrics:

| Category | Metrics |
|----------|---------|
| **Valuation** | Enterprise Value, Equity Value, Implied Share Price |
| **Returns** | IRR, ROI, MOIC (Multiple on Invested Capital) |
| **Profitability** | Revenue CAGR, EBITDA Margin (Year 5), Net Margin (Year 5) |
| **Breakeven** | Breakeven Month, Breakeven Revenue |
| **Payback** | Payback Period (months), Discounted Payback |
| **Liquidity** | Minimum Cash Balance, Peak Funding Requirement |
| **Unit Economics** | LTV/CAC Ratio, Gross Margin per Unit |

### 5.2 Dashboard Layout

The dashboard follows a standardized layout:

| Section | Position | Content |
|---------|----------|---------|
| **Header** | Top | Company name, date, scenario selector |
| **Key Metrics Cards** | Row 1 | 4 to 6 headline numbers (EV, IRR, Payback, etc.) |
| **Revenue Chart** | Left Middle | Revenue growth over forecast period |
| **Profitability Chart** | Right Middle | EBITDA and Net Income trend |
| **Scenario Comparison** | Bottom Left | Table comparing Base, Bull, Bear |
| **Sensitivity Summary** | Bottom Right | Key driver impact ranges |

### 5.3 Scenario Toggle

The dashboard must include a scenario selector that updates all metrics:

| Scenario | Definition |
|----------|------------|
| **Base Case** | Most likely outcome based on validated assumptions |
| **Bull Case** | Optimistic assumptions (typically +20% revenue, +5% margin) |
| **Bear Case** | Pessimistic assumptions (typically -20% revenue, -5% margin) |
| **Stress Test** | Extreme downside (typically -40% revenue, breakeven margins) |

---

## Part 6: Workflow Process

### 6.1 Complete Workflow Steps

| Step | Action | Output |
|------|--------|--------|
| 1 | Receive project brief | Requirements document |
| 2 | Create model file with cover page | Initialized Excel file |
| 3 | Research and populate Industry Benchmarks | Completed benchmark table |
| 4 | Research and populate Valuation Multiples | Completed comps table |
| 5 | Research and populate Tax/Regulatory table | Completed tax table |
| 6 | Document all assumptions with sources | Completed assumption register |
| 7 | Run gap analysis | Gap report with research requests |
| 8 | Answer SME escalation questions | SME requests if needed |
| 9 | Build Revenue model | Completed revenue build |
| 10 | Build Cost model | Completed cost build |
| 11 | Build Three Statement model | Linked P&L, BS, CF |
| 12 | Build DCF valuation | Completed DCF with terminal value |
| 13 | Build Sensitivity analysis | Data tables and tornado charts |
| 14 | Build Scenario comparison | Side by side outputs |
| 15 | Build Dashboard | Completed executive dashboard |
| 16 | Perform QA checks | Completed checklist |
| 17 | Generate outputs | Excel, PDF summary, PowerPoint |
| 18 | Deliver to user | Final package |

### 6.2 Quality Assurance Checklist

| Check | Verification |
|-------|--------------|
| Balance sheet balances in all periods | Assets = Liabilities + Equity |
| Cash flow reconciles to balance sheet | Ending cash = BS cash |
| All assumptions have source references | No undocumented inputs |
| Formulas are consistent across periods | Same formula structure |
| Scenarios produce logical results | Bull > Base > Bear |
| Dashboard updates with scenario toggle | All metrics refresh |
| No circular reference errors | Iteration not required |
| Print layout is professional | Headers, footers, page breaks |

---

## Part 7: Integration with Chief of Staff Research

### 7.1 Research to Model Mapping

| Research Deliverable | Model Section | Assumptions Populated |
|---------------------|---------------|----------------------|
| Market Sizing Report | Revenue Build | TAM, SAM, SOM, Market Share |
| Competitive Analysis | Assumptions, Comps | Margins, Pricing, Multiples |
| Customer Research | Revenue Build | ARPU, Churn, LTV, CAC |
| Industry Trends | Growth Rates | Revenue CAGR, Market Growth |
| Regulatory Analysis | Tax & Reg, Risk | Compliance Costs, Barriers |
| Voice Note Transcripts | Audit Trail | Linked to specific assumptions |

### 7.2 Assumption Validation Protocol

Every assumption must be validated against research:

| Validation Level | Requirement |
|------------------|-------------|
| **Level 1: Verified** | Multiple independent sources confirm the figure |
| **Level 2: Supported** | Single credible source supports the figure |
| **Level 3: Estimated** | Management estimate with documented rationale |
| **Level 4: Gap** | No supporting data, research request generated |

---

## Appendix A: Reference Tables

### A.1 Industry Margin Benchmarks (Sample)

| Industry | Gross Margin | EBITDA Margin | Net Margin |
|----------|--------------|---------------|------------|
| Software/SaaS | 70-85% | 20-35% | 15-25% |
| Professional Services | 30-50% | 15-25% | 10-15% |
| Retail | 25-45% | 5-15% | 2-8% |
| Manufacturing | 20-40% | 10-20% | 5-12% |
| Construction | 15-25% | 5-12% | 2-6% |
| Healthcare Services | 40-60% | 15-25% | 8-15% |
| Real Estate | 30-50% | 25-40% | 15-25% |
| Financial Services | 50-70% | 25-40% | 15-30% |

### A.2 Valuation Multiple Ranges (Sample)

| Sector | EV/Revenue | EV/EBITDA | Notes |
|--------|------------|-----------|-------|
| High Growth SaaS | 5x-15x | 20x-40x | ARR based |
| Mature Software | 2x-5x | 10x-15x | Profitable |
| Professional Services | 1x-3x | 8x-12x | People dependent |
| Manufacturing | 0.5x-1.5x | 6x-10x | Asset based |
| Retail | 0.3x-1x | 5x-8x | Inventory heavy |
| Healthcare | 1x-4x | 10x-15x | Regulated |

---

*This framework is designed for use with CEPHO AI to produce consistent, investor grade financial models with full research integration and audit trail capability.*
