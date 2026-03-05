# Project Brief: LUaid PWA – Offline-Ready Disaster Relief Platform

## Project Name
LUaid PWA: Offline-Ready Disaster Relief Platform

## Objectives
- Build an installable PWA hosted on Vercel using Vite + React.
- Sync real-time dashboards from Google Sheets.
- Enable offline access and form submissions via IndexedDB and Workbox.
- Integrate multilingual WordPress content via REST API.
- Embed a custom Google Map to visualize relief deployment zones.
- Provide volunteer reporting forms with Background Sync.
- Implement GitHub branching: staging (for approval) and production.
- Establish a CMS with editorial permissions (volunteers, writers, approvers, admins).
- Cache Filipino, Ilocano, and English content for offline use.
- Ensure resilience and usability in low-connectivity environments.

## Key Stakeholders
- Rod (Technical Lead & Architect)
- LUaid.org Management Team (decision makers)
- Community volunteers and field reporters submitting forms
- Contributing writers and Editorial staff managing CMS workflows
- NGOs and donors monitoring dashboards
- End users accessing cached content in disaster zones

## Timeline

**Phase 1 (MVP):**
- Scaffold PWA
- Dashboard-Google Sheets API integration
- Custom map embed
- Staging deploy
- MVP production launch

**Phase 2:**
- Offline form submission to Google Sheets
- User login and authentication
- WordPress user management and CMS backend
- CMS REST sync

**Phase 3:**
- Multilingual setup
- Editorial permissions
- Approval workflow

**Phase 4:**
- Contributor documentation
- User guides

## Specific Requirements and Notes
- Use subdomains: staging.luaid.org, cms.luaid.org, docs.luaid.org.
- Installable PWA front-end hosted on Vercel, backend from Google Sheets and WordPress.
- Google Sheets used for dashboard metrics and volunteer form storage.
- WordPress used for multilingual blogging and editorial management.
- Approval workflow for content and articles.
- GitHub Projects used to manage sharded tasks and PRD prompts.
- Offline reports stored locally, synced to Sheets with Background Sync API.
- Agentic workflow via BMAD + Cursor for modular task generation and approval.
- Placeholder landing site remains unaffected during MVP staging buildout.
- Design and content strategy optimized for offline mobile access, fast/convenient submission of forms/reports in the field, and informative dashboards for transparency and accountability. 