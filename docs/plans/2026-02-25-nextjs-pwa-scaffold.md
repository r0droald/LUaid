# Next.js PWA Scaffold Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Initialize the LUaid.org project as a Next.js PWA with App Router, Tailwind CSS, internationalization (English/Filipino/Ilocano), and offline-first service worker — ready for features to plug into.

**Architecture:** Next.js App Router with `src/` directory, Serwist for service worker/PWA, next-intl for i18n with locale-based routing (`/en`, `/fil`, `/ilo`). JavaScript (not TypeScript) for contributor accessibility. Tailwind CSS for styling.

**Tech Stack:** Next.js (App Router), Serwist (@serwist/next), next-intl, Tailwind CSS, ESLint

**Branch:** `feat/nextjs-scaffold` on fork (origin: Jaskey15/LUaid)

**References:**
- Issue #8 on r0droald/LUaid: "React/Next.js Boilerplate PWA scaffold"
- Serwist docs: https://serwist.pages.dev/docs/next/getting-started
- next-intl docs: https://next-intl.dev/docs/getting-started/app-router

---

### Task 1: Initialize Next.js project

**Files:**
- Create: entire `src/` directory via create-next-app

**Step 1: Run create-next-app**

Run the initializer from the repo root. Since the repo already has files (README, LICENSE, etc.), initialize into a temp directory then move files.

```bash
cd /Users/jacobaskey/Development/LUaid
npx create-next-app@latest temp-scaffold --js --eslint --tailwind --app --src-dir --no-turbopack --import-alias "@/*"
```

Prompts to answer:
- TypeScript: **No**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Turbopack: **No** (keep it simple)
- Import alias: `@/*`

**Step 2: Move scaffold files into repo root**

```bash
# Move all files from temp-scaffold into repo root, preserving existing files
cp -r temp-scaffold/* .
cp -r temp-scaffold/.eslintrc.json .
cp temp-scaffold/.gitignore .
cp temp-scaffold/jsconfig.json .
rm -rf temp-scaffold
```

**Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Dev server starts on localhost:3000, default Next.js page renders.

**Step 4: Stop dev server and commit**

```bash
git add -A
git commit -m "feat: initialize Next.js project with App Router, Tailwind CSS, ESLint

Scaffolded via create-next-app with JavaScript, src/ directory,
and @/* import alias. No TypeScript — chosen for contributor
accessibility per team discussion."
```

---

### Task 2: Set up folder structure

**Files:**
- Create: `src/components/.gitkeep`
- Create: `src/lib/.gitkeep`
- Create: `src/hooks/.gitkeep`
- Delete: `src/app/page.js` (will be replaced by i18n routing in Task 5)
- Delete: `src/app/layout.js` (will be replaced by i18n routing in Task 5)

**Step 1: Create directory skeleton**

```bash
mkdir -p src/components src/lib src/hooks
touch src/components/.gitkeep src/lib/.gitkeep src/hooks/.gitkeep
```

Folder purposes:
- `src/app/` — App Router pages and layouts (managed by Next.js)
- `src/components/` — Reusable UI components
- `src/lib/` — Utilities, API clients, helpers
- `src/hooks/` — Custom React hooks

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add folder structure for components, lib, hooks"
```

---

### Task 3: Add PWA web app manifest

**Files:**
- Create: `public/manifest.json`
- Create: `public/icons/icon-192x192.png` (placeholder)
- Create: `public/icons/icon-512x512.png` (placeholder)

**Step 1: Create manifest.json**

```json
{
  "name": "LUaid.org - Humanitarian Dashboard",
  "short_name": "LUaid",
  "description": "Disaster relief transparency and coordination for La Union, Philippines",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Step 2: Create placeholder icons**

Generate simple placeholder PNGs (solid color squares). These will be replaced with real branding later.

**Step 3: Commit**

```bash
git add public/manifest.json public/icons/
git commit -m "feat: add PWA manifest and placeholder icons"
```

---

### Task 4: Configure Serwist service worker

**Files:**
- Modify: `package.json` (add @serwist/next and serwist dependencies)
- Modify: `next.config.mjs` (wrap with withSerwistInit)
- Create: `src/app/sw.js` (service worker)
- Modify: `.gitignore` (add generated sw.js files)

**Step 1: Install Serwist**

```bash
npm install @serwist/next serwist
```

**Step 2: Update next.config.mjs**

```javascript
import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ??
  crypto.randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "src/app/sw.js",
  swDest: "public/sw.js",
});

export default withSerwist({
  // Next.js config options here
});
```

**Step 3: Create service worker (src/app/sw.js)**

```javascript
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
```

**Step 4: Add generated files to .gitignore**

Append to `.gitignore`:
```
# Serwist generated service worker
public/sw.js
public/sw.js.map
public/swe-worker-*.js
public/swe-worker-*.js.map
```

**Step 5: Verify build succeeds**

```bash
npm run build
```

Expected: Build completes, `public/sw.js` is generated.

**Step 6: Commit**

```bash
git add package.json package-lock.json next.config.mjs src/app/sw.js .gitignore
git commit -m "feat: configure Serwist service worker for offline PWA support"
```

---

### Task 5: Set up next-intl internationalization

**Files:**
- Modify: `package.json` (add next-intl dependency)
- Create: `src/i18n/routing.js`
- Create: `src/i18n/request.js`
- Create: `src/middleware.js`
- Create: `messages/en.json`
- Create: `messages/fil.json`
- Create: `messages/ilo.json`
- Create: `src/app/[locale]/layout.js`
- Create: `src/app/[locale]/page.js`
- Delete: `src/app/layout.js` (replaced by [locale] version)
- Delete: `src/app/page.js` (replaced by [locale] version)

**Step 1: Install next-intl**

```bash
npm install next-intl
```

**Step 2: Create routing config (src/i18n/routing.js)**

```javascript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fil", "ilo"],
  defaultLocale: "en",
});
```

**Step 3: Create request config (src/i18n/request.js)**

```javascript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**Step 4: Create middleware (src/middleware.js)**

```javascript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
```

**Step 5: Create message files**

`messages/en.json`:
```json
{
  "App": {
    "title": "LUaid.org",
    "description": "Disaster Relief Transparency"
  },
  "Navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "volunteer": "Volunteer"
  }
}
```

`messages/fil.json`:
```json
{
  "App": {
    "title": "LUaid.org",
    "description": "Transparency sa Disaster Relief"
  },
  "Navigation": {
    "home": "Tahanan",
    "dashboard": "Dashboard",
    "volunteer": "Boluntaryo"
  }
}
```

`messages/ilo.json`:
```json
{
  "App": {
    "title": "LUaid.org",
    "description": "Transparency ti Disaster Relief"
  },
  "Navigation": {
    "home": "Pagtaengan",
    "dashboard": "Dashboard",
    "volunteer": "Boluntario"
  }
}
```

**Step 6: Create locale layout (src/app/[locale]/layout.js)**

Replace the default `src/app/layout.js` with a locale-aware version:

```javascript
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";

export const metadata = {
  title: "LUaid.org - Humanitarian Dashboard",
  description:
    "Disaster relief transparency and coordination for La Union, Philippines",
  manifest: "/manifest.json",
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Step 7: Create locale homepage (src/app/[locale]/page.js)**

A minimal placeholder that proves i18n works:

```javascript
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("App");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="mt-4 text-lg text-gray-400">{t("description")}</p>
    </main>
  );
}
```

**Step 8: Delete old layout.js and page.js from src/app/**

Remove `src/app/layout.js` and `src/app/page.js` — they're replaced by the `[locale]` versions. Keep `src/app/globals.css` and `src/app/sw.js` in place.

**Step 9: Update next.config.mjs for next-intl plugin**

```javascript
import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ??
  crypto.randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "src/app/sw.js",
  swDest: "public/sw.js",
});

export default withSerwist(
  withNextIntl({
    // Next.js config options here
  })
);
```

**Step 10: Verify dev server with i18n**

```bash
npm run dev
```

Expected:
- `localhost:3000` redirects to `localhost:3000/en`
- `localhost:3000/fil` shows Filipino text
- `localhost:3000/ilo` shows Ilocano text

**Step 11: Commit**

```bash
git add -A
git commit -m "feat: set up next-intl with English, Filipino, and Ilocano locales

Locale-based routing under /[locale]/ with middleware for
automatic detection. Message files in /messages/ directory."
```

---

### Task 6: Create offline fallback page

**Files:**
- Create: `src/app/[locale]/~offline/page.js`

**Step 1: Create the offline page**

```javascript
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-bold">You are offline</h1>
      <p className="mt-4 text-lg text-gray-400">
        LUaid.org will reconnect automatically when your internet is restored.
        Previously viewed data is still available.
      </p>
    </main>
  );
}
```

**Step 2: Verify build still succeeds**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/app/\\[locale\\]/~offline/
git commit -m "feat: add offline fallback page for PWA"
```

---

### Task 7: Final cleanup and verification

**Files:**
- Modify: `CLAUDE.md` (update commands section now that project is initialized)
- Verify: `.gitignore` includes all necessary entries

**Step 1: Update CLAUDE.md with accurate commands**

Update the Commands section to reflect the actual scripts from package.json.

**Step 2: Ensure .gitignore covers**

- `node_modules/`
- `.next/`
- `public/sw.js` and related Serwist output
- `.env*.local`
- `.claude/settings.local.json`

**Step 3: Run full build**

```bash
npm run build
```

Expected: Clean build, no errors.

**Step 4: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: update CLAUDE.md and gitignore for initialized project"
```

---

## PR Submission Notes

After all tasks are complete, push to fork and open PR against `r0droald/LUaid:main`:

```bash
git push -u origin feat/nextjs-scaffold
```

**PR title:** "feat: Next.js PWA scaffold with i18n and offline support"

**PR description should mention:**
- References Issue #8
- JavaScript chosen over TypeScript for contributor accessibility (can migrate later)
- i18n pre-configured for English, Filipino, Ilocano
- PWA with service worker and offline fallback
- No features implemented — just the foundation for the backlog items
