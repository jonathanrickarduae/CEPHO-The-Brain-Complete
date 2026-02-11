# Project Genesis - Test Scenario

## Purpose
This document provides a mock project walkthrough to test the Project Genesis questionnaire and document generation flow without using real business data.

---

## Test Scenario: "TechFlow Solutions"

### Phase 1: Basic Info
| Field | Test Value |
|-------|------------|
| Company Name | TechFlow Solutions |
| One-Line Description | AI-powered workflow automation for SMEs |
| Industry | Technology |
| Stage | MVP |

### Phase 2: People
| Founder | Role | Email | Shareholding |
|---------|------|-------|--------------|
| Alex Thompson | CEO | alex@techflow.test | 60% |
| Sarah Mitchell | CTO | sarah@techflow.test | 40% |

**Advisors:**
- Dr. James Wilson (Technical Advisor)
- Maria Garcia (Commercial Advisor)

### Phase 3: Business
| Field | Test Value |
|-------|------------|
| Target Market | UK SMEs with 10-250 employees |
| Revenue Model | SaaS/Subscription |
| Current Revenue | £50,000 ARR |
| Funding Target | £500,000 |
| Use of Funds | Product development (40%), Sales (30%), Operations (30%) |

### Phase 4: Legal
| Field | Test Value |
|-------|------------|
| Jurisdiction | United Kingdom |
| Existing Company | Yes |
| Existing Contracts | Customer contracts (5), Supplier agreement (1) |

### Phase 5: Due Diligence
**Known Risks:**
- Key person dependency on CTO
- Single cloud provider (AWS)
- Limited IP protection

**Supplier Dependencies:**
- AWS for infrastructure
- Stripe for payments
- SendGrid for email

**Regulatory Requirements:**
- GDPR compliance
- ICO registration

---

## Expected Outputs

### Documents to be Generated:
1. ✅ Non-Disclosure Agreement (NDA)
2. ✅ One-Page Teaser
3. ✅ Two-Pager Summary
4. ✅ Investment Deck (Draft)
5. ✅ Financial Model Template
6. ✅ DCF Valuation Model
7. ✅ Data Room Checklist
8. ✅ Risk Register Template
9. ✅ Articles of Association (Draft) - UK specific
10. ✅ Shareholder Agreement (Draft) - UK specific

### Action Items to be Created:
1. Register at Companies House
2. Send NDA for signature
3. Schedule founder call
4. Complete KYC checklist
5. Set up data room
6. Upload logo
7. Open business bank account
8. Register for VAT

---

## Test Checklist

- [ ] Navigate to Project Genesis from sidebar
- [ ] Complete Phase 1 (Basic Info) with test data
- [ ] Complete Phase 2 (People) - add both founders
- [ ] Complete Phase 3 (Business) with test data
- [ ] Complete Phase 4 (Legal) with test data
- [ ] Complete Phase 5 (Due Diligence) with test data
- [ ] Click "Generate Documents" on Phase 6
- [ ] Verify all 10 documents are generated
- [ ] Verify all 8 action items are created
- [ ] Test document download (mock)
- [ ] Test action item status toggle

---

## Notes for Testing

1. **No real data**: Use only the test values above
2. **Email addresses**: Use .test domain (RFC 2606 reserved)
3. **Amounts**: Use realistic but fictional figures
4. **Timing**: Document generation should take ~5-10 seconds
5. **Reset**: Refresh page to start fresh test

---

## Future Enhancements to Test

- [ ] Explainer video generation
- [ ] Real document export (PDF/DOCX)
- [ ] SignNow/DocuSign integration
- [ ] Calendar integration for scheduling
- [ ] Data room folder creation
- [ ] Brand kit application to documents
