---
name: cepho-data-room
description: Secure investor-grade data room (BP-014) with access control, audit trails, and document management
homepage: https://cepho.ai/blueprints/bp-014
metadata:
  openclaw:
    emoji: "🔐"
    requires:
      env: ["CEPHO_API_URL", "CEPHO_API_KEY"]
    primaryEnv: "CEPHO_API_KEY"
---

# CEPHO Data Room (BP-014)

Secure **investor-grade data room** with granular access control, audit trails, and professional document management.

## Overview

BP-014 Data Room provides:
- **Secure Document Storage** - Encrypted, versioned
- **Access Control** - Role-based permissions
- **Audit Trails** - Complete activity logging
- **Document Organization** - Structured folders
- **Expiry Management** - Time-limited access
- **Watermarking** - Document protection

## Setup

```bash
export CEPHO_API_URL="https://cepho-the-brain-complete.onrender.com"
export CEPHO_API_KEY="your-cepho-api-key"
```

## Create Data Room

```bash
curl -X POST "$CEPHO_API_URL/api/trpc/blueprints.execute" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "blueprintId": "BP-014",
    "projectId": "proj_abc123",
    "securityLevel": "investor_grade",
    "name": "TechCo Series A Data Room",
    "description": "Investor due diligence materials"
  }'
```

## Manage Access

### Grant Access

```bash
curl -X POST "$CEPHO_API_URL/api/trpc/dataRoom.grantAccess" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "dataRoomId": "dr_123",
    "email": "investor@vc.com",
    "role": "viewer",
    "permissions": ["view", "download"],
    "expiry": "90d",
    "requireNDA": true
  }'
```

### Revoke Access

```bash
curl -X POST "$CEPHO_API_URL/api/trpc/dataRoom.revokeAccess" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "dataRoomId": "dr_123",
    "email": "investor@vc.com"
  }'
```

## Upload Documents

```bash
curl -X POST "$CEPHO_API_URL/api/trpc/dataRoom.uploadDocument" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -F "file=@business_plan.pdf" \
  -F "dataRoomId=dr_123" \
  -F "folder=financials" \
  -F "watermark=true"
```

## Get Audit Trail

```bash
curl "$CEPHO_API_URL/api/trpc/dataRoom.getAuditTrail?dataRoomId=dr_123" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

**Response:**
```json
{
  "dataRoomId": "dr_123",
  "events": [
    {
      "timestamp": "2026-02-11T10:30:00Z",
      "user": "investor@vc.com",
      "action": "viewed",
      "document": "business_plan.pdf",
      "duration": "15min"
    },
    {
      "timestamp": "2026-02-11T10:45:00Z",
      "user": "investor@vc.com",
      "action": "downloaded",
      "document": "financial_model.xlsx"
    }
  ],
  "summary": {
    "totalViews": 24,
    "totalDownloads": 8,
    "uniqueVisitors": 3,
    "mostViewedDocument": "business_plan.pdf"
  }
}
```

## Conversational Usage

```
You: "Create investor data room for TechCo Series A"

CEPHO: "🔐 Creating secure data room (BP-014)...
        
        ✅ Data Room Created
        Name: TechCo Series A
        Security: Investor Grade
        Encryption: AES-256
        
        Default Folders:
        📁 Company Overview
        📁 Financials
        📁 Legal Documents
        📁 Market Research
        📁 Product & Technology
        📁 Team & Organization
        
        Ready to upload documents or grant access?"

---

You: "Grant view access to investor@vc.com for 90 days"

CEPHO: "✅ Access Granted
        
        User: investor@vc.com
        Role: Viewer
        Permissions: View, Download
        Expiry: 90 days (May 12, 2026)
        NDA: Required
        
        Access link sent to investor@vc.com
        
        I'll track all activity and notify you of views/downloads"

---

You: "Show me who viewed the business plan"

CEPHO: "📊 Business Plan Activity:
        
        Total Views: 24
        Unique Viewers: 3
        
        Recent Activity:
        - investor@vc.com: Viewed 15min (Feb 11, 10:30)
        - partner@vc.com: Viewed 8min (Feb 10, 14:20)
        - advisor@firm.com: Viewed 22min (Feb 9, 16:45)
        
        Downloads: 2
        - investor@vc.com (Feb 11)
        - advisor@firm.com (Feb 9)"
```

---

**Created by:** CEPHO.AI  
**Version:** 1.0
