# Security & Privacy Documentation

## Overview

AI Snapshot Generator is a **client-side only application** with **zero server-side data storage**. This document explains the security architecture and data handling practices.

## Architecture

### What is Hosted on Lovable/Servers
- ✅ Static code files (HTML, CSS, JavaScript)
- ✅ Application assets (fonts, icons)
- ❌ **NO database**
- ❌ **NO backend API**
- ❌ **NO data storage layer**
- ❌ **NO server-side processing**

**Analogy:** Lovable hosts this app the same way GitHub Pages or AWS S3 hosts static files—it's pure code delivery, not data processing.

## Data Flow

```
User's Browser          Hosting (Lovable)        Anthropic API
     │                        │                        │
     │ 1. Request app         │                        │
     │ ◄──────────────────────┤                        │
     │    (HTML/JS/CSS)       │                        │
     │                        │                        │
     │ 2. Enter customer data │                        │
     │    (stored in memory)  │                        │
     │                        │                        │
     │ 3. Process data        │                        │
     │    (runs in browser)   │                        │
     │                        │                        │
     │ 4. API call (direct) ──────────────────────────►│
     │                        │   BYPASSES HOSTING     │
     │                        │                        │
     │ 5. Receive results ◄───────────────────────────┤
     │                        │                        │
     │ 6. Generate report     │                        │
     │    (browser-side)      │                        │
     │                        │                        │
     │ 7. Download to device  │                        │
     │    (local file)        │                        │
```

**Key Point:** Customer data never touches the hosting infrastructure. Data flows directly from browser to Anthropic API.

## Data Handling

### Customer Data (PII, Company Info)
- **Storage:** In-memory only (React state)
- **Transmission:** Browser → Anthropic API (direct, encrypted HTTPS)
- **Persistence:** None—data disappears when tab closes
- **Download:** Reports saved to user's local device only

### API Keys
- **Storage:** Browser localStorage (isolated per user)
- **Transmission:** Sent only to Anthropic API in request headers
- **Visibility:** Not visible to hosting infrastructure
- **Scope:** Each user manages their own key

### Generated Reports
- **Format:** HTML files
- **Generation:** Client-side JavaScript
- **Storage:** Downloaded to user's device
- **Server involvement:** None

## Security Features

### ✅ No Persistent Storage
- No database
- No file storage
- No server-side sessions
- No cookies tracking user data

### ✅ Direct API Communication
- Data sent directly from browser to Anthropic
- Encrypted in transit (HTTPS)
- No intermediate storage or logging

### ✅ Client-Side Processing
- All data manipulation happens in browser
- No server-side code execution
- No server access to customer data

### ✅ User-Controlled Data
- Users control all inputs
- Users control all outputs (downloads)
- No data retention on servers

## Third-Party Services

### Anthropic API
- **Purpose:** AI processing of customer data
- **Data sent:** Company information, QA scores, automation metrics
- **Data retention:** Per [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy)
- **Encryption:** HTTPS in transit
- **User control:** Each user uses their own API key

### Hosting (Lovable.dev)
- **Purpose:** Serve static application files
- **Data access:** None—only serves code files
- **Logs:** May log HTTP requests (not application data)
- **Role:** CDN/file server only

## Compliance Statements

### No PII Storage
✅ **Compliant** - Application does not store any Personally Identifiable Information on servers. All PII exists temporarily in user's browser memory only.

### No Customer Data Retention
✅ **Compliant** - No customer data is retained on hosting infrastructure. Data is processed in real-time and discarded.

### Data Sovereignty
✅ **User-Controlled** - Users maintain full control of their data. Data remains on their device except during active API processing.

### GDPR/Privacy
✅ **Privacy-Friendly** - No tracking, no analytics, no persistent identifiers. Each session is independent.

## Comparison to Alternatives

| Feature | This App | Traditional Web App | Desktop App |
|---------|----------|-------------------|-------------|
| Server-side storage | ❌ None | ✅ Yes | ❌ None |
| Database | ❌ None | ✅ Yes | ❌ None |
| Data persistence | ❌ Session only | ✅ Permanent | ✅ Local files |
| Server access to data | ❌ None | ✅ Full | ❌ None |
| Deployment | Static files | Full stack | App bundle |

**This app is architecturally closer to a desktop application than a traditional web application.**

## Security Review Questions

**Q: Where is customer data stored?**
A: In the user's browser memory (RAM) during active use. Nowhere else.

**Q: Can Lovable/hosting provider access customer data?**
A: No. They only serve static code files. No customer data passes through their servers.

**Q: What happens to data when the browser tab closes?**
A: All data is immediately cleared from memory. Nothing persists.

**Q: Are reports stored on servers?**
A: No. Reports are generated client-side and downloaded directly to the user's device.

**Q: What about API keys?**
A: Stored in browser localStorage, isolated per user, never transmitted to hosting infrastructure.

**Q: Is this more secure than a traditional web app?**
A: Yes, from a data storage perspective. Eliminating server-side storage eliminates an entire class of security risks (database breaches, unauthorized access, etc.).

## Verification

To verify these claims, you can:

1. **Inspect Network Traffic:** Use browser DevTools to confirm:
   - Only static files loaded from Lovable
   - API calls go directly to `api.anthropic.com`
   - No data sent to hosting infrastructure

2. **Review Source Code:** Application code is public:
   - [GitHub Repository](https://github.com/MattM-Klaus/ai-snapshot-generator)
   - No backend code exists
   - All processing logic visible in client-side JavaScript

3. **Check localStorage:** Browser storage only contains API key, no customer data

## Contact

For security questions or concerns:
- Review code: https://github.com/MattM-Klaus/ai-snapshot-generator
- Contact: Zendesk AI Specialist Team

---

**Last Updated:** March 23, 2026
**Document Version:** 1.0
