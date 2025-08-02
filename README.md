# LUaid.org - LU Disaster and Relief Operations
A Progressive Web App for LU Disaster and Relief Operations. This is an open-source project built to track and visualize donations, volunteer deployments, and aid distribution in the wake of Typhoon Emong in La Union, Philippines. Functionality covers field operability, editorial flow, and real-time transparency. It is designed to be resilient, modular, high impact and accessible even in low-connectivity zones. We publish this software in the hopes of being useful for disaster relief operations in your location.

## Features
- Zero-budget deployment by stitching together free-tier services/tools to support volunteer-driven initiatives
- Offline-syncing Progressive Web App with offline form submissions and data caching for quick access on any device with or without internet
- Realtime dashboards for donations, deployments, and aid requests/feedback
- Map integration to visualize field operations
- Multilanguage to support local dialects
- CMS with WYSIWYG editor for easy content uploading/editing in multiple languages
- User authentication and permissioning system for volunteers submitting field reports, writers' articles and site copywriting, and approvers for content submitted.
- Approval workflow for publishing and editing content

## Get Involved
We welcome contributions from developers, designers, organizers, content creators and volunteers. Check the [Projects](#) and [Issues](#) tabs to find tasks related to the building and running of LUaid.org that you'd like to help with.

## Architecture & Tech Stack
- Frontend PWA (Vercel-hosted, offline-capable)
  - React/Next.js
  - Caches data in IndexedDB/localStorage/JSON for dashboard/reports from Google Sheets via Sheets API, and website content from Wordpress CMS Backend via REST API (stored as JSON per language)
  - Syncs periodically and fallbacks gracefully when offline
  - Displays map view (embedded Google Maps/Leaflet)
  - Serves blog/article content from WordPress API
  - Serves multilingual content (i18n/WPML/Polylang) from offline cache
  - Serves media(images) via Service Worker Cache API and syncs with Lazy-load + precache
  - Updates in background when online, without interrupting the user
  - Provides volunteer form interface that stores inputs locally when offline, then syncs to Google Sheets
- Google Sheets
  - Serves as a lightweight database for relief operations transparency dashboard & reports
  - Powers dashboard metrics and is cached for offline viewing
  - Updated from PWA frontend form submissions from volunteers in the field
- WordPress CMS Backend (cms.LUaid.org)
  - WYSIWYG editorial UI for writers and content approvers
  - User login/authentication and permission levels (e.g. volunteer, writer, admin)
  - Multilanguage support for content and dashboard UI (via WPML or Polylang)
  - REST API (or GraphQL via WPGraphQL) exposing articles and metadata
  - Free hosting on InfinityFree/AccuWeb/Wordpress.com/Freehostia/000webhost

## License
This repository's source code is available under the [MIT License](LICENSE). Please feel free to use, modify, distribute and contribute to this project. We encourage community collaboration and repurposing of this work. Copyright © 2025 LUaid.org
