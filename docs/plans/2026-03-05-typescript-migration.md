# TypeScript Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the entire LUaid codebase from JavaScript to TypeScript (strict mode) while all existing functionality remains unchanged.

**Architecture:** Rename all `.js`/`.jsx` source and test files to `.ts`/`.tsx`, add proper types, convert config files where supported. The migration is mechanical — no logic changes, no new features.

**Tech Stack:** TypeScript 5.x, Next.js 16.1.6, next-intl 4.x, Serwist 9.x, Vitest 4.x

---

### Task 1: Foundation — Install Dependencies & Create tsconfig.json

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Delete: `jsconfig.json`

**Step 1: Install TypeScript dependencies**

Run:
```bash
cd /Users/jacobaskey/Development/LUaid && npm install --save-dev typescript @types/react @types/react-dom @types/node
```

Expected: Clean install, 4 packages added to devDependencies.

**Step 2: Create `tsconfig.json`**

Write to `/Users/jacobaskey/Development/LUaid/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "public/sw.js"]
}
```

**Step 3: Delete `jsconfig.json`**

Run:
```bash
rm /Users/jacobaskey/Development/LUaid/jsconfig.json
```

**Step 4: Verify TypeScript compiles (will have errors — that's expected)**

Run:
```bash
cd /Users/jacobaskey/Development/LUaid && npx tsc --noEmit 2>&1 | head -20
```

Expected: Errors about missing `.ts` files (since source files haven't been renamed yet). This confirms tsc is working.

**Step 5: Commit**

```bash
cd /Users/jacobaskey/Development/LUaid
git add tsconfig.json package.json package-lock.json
git rm jsconfig.json
git commit -m "chore: add TypeScript dependencies and tsconfig.json"
```

---

### Task 2: Convert Config Files

**Files:**
- Rename: `next.config.mjs` → `next.config.ts`
- Rename: `vitest.config.js` → `vitest.config.ts`

**Step 1: Delete `next.config.mjs` and create `next.config.ts`**

Delete `/Users/jacobaskey/Development/LUaid/next.config.mjs` and write to `/Users/jacobaskey/Development/LUaid/next.config.ts`:

```typescript
import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ??
  crypto.randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwist(
  withNextIntl({
    // Next.js config options here
  })
);
```

Key changes from JS version:
- File extension `.mjs` → `.ts`
- `request.js` → `request.ts` in the plugin path
- `sw.js` → `sw.ts` in swSrc

**Step 2: Delete `vitest.config.js` and create `vitest.config.ts`**

Delete `/Users/jacobaskey/Development/LUaid/vitest.config.js` and write to `/Users/jacobaskey/Development/LUaid/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});
```

Key changes from JS version:
- Removed the entire `treat-js-as-jsx` esbuild plugin (no longer needed with `.tsx` files)
- Setup file reference: `setup.js` → `setup.ts`

**Step 3: Commit**

```bash
cd /Users/jacobaskey/Development/LUaid
git rm next.config.mjs vitest.config.js
git add next.config.ts vitest.config.ts
git commit -m "chore: convert next.config and vitest.config to TypeScript"
```

---

### Task 3: Convert i18n Files & Middleware

**Files:**
- Rename: `src/i18n/routing.js` → `src/i18n/routing.ts`
- Rename: `src/i18n/request.js` → `src/i18n/request.ts`
- Rename: `src/middleware.js` → `src/middleware.ts`
- Create: `src/i18n/types.ts` (next-intl AppConfig augmentation)

**Step 1: Delete `src/i18n/routing.js` and create `src/i18n/routing.ts`**

Write to `/Users/jacobaskey/Development/LUaid/src/i18n/routing.ts`:

```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fil", "ilo"],
  defaultLocale: "en",
});
```

No type changes needed — `defineRouting` infers the types from the config object.

**Step 2: Delete `src/i18n/request.js` and create `src/i18n/request.ts`**

Write to `/Users/jacobaskey/Development/LUaid/src/i18n/request.ts`:

```typescript
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

No type changes needed — `getRequestConfig` and `hasLocale` are fully typed.

**Step 3: Create next-intl AppConfig type augmentation**

Write to `/Users/jacobaskey/Development/LUaid/src/i18n/types.ts`:

```typescript
import { routing } from "@/i18n/routing";
import messages from "../../messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
```

This gives you typed `useTranslations()` — the compiler knows which translation keys exist and flags typos.

**Step 4: Delete `src/middleware.js` and create `src/middleware.ts`**

Write to `/Users/jacobaskey/Development/LUaid/src/middleware.ts`:

```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
```

No type changes needed — `createMiddleware` is fully typed.

**Step 5: Commit**

```bash
cd /Users/jacobaskey/Development/LUaid
git rm src/i18n/routing.js src/i18n/request.js src/middleware.js
git add src/i18n/routing.ts src/i18n/request.ts src/i18n/types.ts src/middleware.ts
git commit -m "chore: convert i18n and middleware to TypeScript"
```

---

### Task 4: Convert Service Worker

**Files:**
- Rename: `src/app/sw.js` → `src/app/sw.ts`

**Step 1: Delete `src/app/sw.js` and create `src/app/sw.ts`**

Write to `/Users/jacobaskey/Development/LUaid/src/app/sw.ts`:

```typescript
/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

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

Key additions from JS version:
- Triple-slash references for web worker global scope
- `PrecacheEntry` and `SerwistGlobalConfig` type imports
- Global augmentation for `__SW_MANIFEST` (this is how Serwist types the injection point)
- Explicit `self` declaration as `ServiceWorkerGlobalScope`

**Step 2: Commit**

```bash
cd /Users/jacobaskey/Development/LUaid
git rm src/app/sw.js
git add src/app/sw.ts
git commit -m "chore: convert service worker to TypeScript"
```

---

### Task 5: Convert Pages & Layout

**Files:**
- Rename: `src/app/[locale]/page.js` → `src/app/[locale]/page.tsx`
- Rename: `src/app/[locale]/layout.js` → `src/app/[locale]/layout.tsx`
- Rename: `src/app/[locale]/~offline/page.js` → `src/app/[locale]/~offline/page.tsx`

**Step 1: Delete `src/app/[locale]/page.js` and create `src/app/[locale]/page.tsx`**

Write to `/Users/jacobaskey/Development/LUaid/src/app/[locale]/page.tsx`:

```tsx
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

No type annotations needed — `useTranslations` is typed via the `AppConfig` augmentation from Task 3.

**Step 2: Delete `src/app/[locale]/layout.js` and create `src/app/[locale]/layout.tsx`**

Write to `/Users/jacobaskey/Development/LUaid/src/app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "LUaid.org - Humanitarian Dashboard",
  description:
    "Disaster relief transparency and coordination for La Union, Philippines",
  manifest: "/manifest.json",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
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

Key additions from JS version:
- `Metadata` type import from Next.js
- `Props` type with `children: React.ReactNode` and `params: Promise<{ locale: string }>`
- Typed `metadata` export

**Step 3: Delete `src/app/[locale]/~offline/page.js` and create `src/app/[locale]/~offline/page.tsx`**

Write to `/Users/jacobaskey/Development/LUaid/src/app/[locale]/~offline/page.tsx`:

```tsx
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

No type annotations needed — no props.

**Step 4: Commit**

```bash
cd /Users/jacobaskey/Development/LUaid
git rm "src/app/[locale]/page.js" "src/app/[locale]/layout.js" "src/app/[locale]/~offline/page.js"
git add "src/app/[locale]/page.tsx" "src/app/[locale]/layout.tsx" "src/app/[locale]/~offline/page.tsx"
git commit -m "chore: convert pages and layout to TypeScript"
```

---

### Task 6: Convert Test Files

**Files:**
- Rename: `tests/setup.js` → `tests/setup.ts`
- Rename: `tests/unit/home.test.jsx` → `tests/unit/home.test.tsx`

**Step 1: Delete `tests/setup.js` and create `tests/setup.ts`**

Write to `/Users/jacobaskey/Development/LUaid/tests/setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

No changes beyond the file extension.

**Step 2: Delete `tests/unit/home.test.jsx` and create `tests/unit/home.test.tsx`**

Write to `/Users/jacobaskey/Development/LUaid/tests/unit/home.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/[locale]/page";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("HomePage", () => {
  it("renders the title and description", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "title"
    );
    expect(screen.getByText("description")).toBeInTheDocument();
  });
});
```

Key change from JS version:
- Added `key: string` type annotation to the mock function parameter

**Step 3: Run tests to verify they pass**

Run:
```bash
cd /Users/jacobaskey/Development/LUaid && npm test
```

Expected: 1 test file, 1 test, all passing.

**Step 4: Commit**

```bash
cd /Users/jacobaskey/Development/LUaid
git rm tests/setup.js tests/unit/home.test.jsx
git add tests/setup.ts tests/unit/home.test.tsx
git commit -m "chore: convert test files to TypeScript"
```

---

### Task 7: Cleanup, CLAUDE.md Update & Full Verification

**Files:**
- Modify: `CLAUDE.md`
- Modify: `eslint.config.mjs` (add `public/sw.js` to ignores if needed)

**Step 1: Update CLAUDE.md code conventions**

In `/Users/jacobaskey/Development/LUaid/CLAUDE.md`, replace the Code Conventions section:

Old:
```markdown
## Code Conventions

- JavaScript with JSDoc type hints (chosen for contributor accessibility; TypeScript migration possible later)
```

New:
```markdown
## Code Conventions

- TypeScript (strict mode) — all source, test, and config files use `.ts`/`.tsx`
```

Also update the Project Structure section — change file extensions in the tree:

Old references like `page.js`, `layout.js`, `sw.js`, `routing.js`, `request.js`, `middleware.js`

New: `page.tsx`, `layout.tsx`, `sw.ts`, `routing.ts`, `request.ts`, `middleware.ts`

**Step 2: Run full verification suite**

Run each in sequence:
```bash
cd /Users/jacobaskey/Development/LUaid && npx tsc --noEmit
```
Expected: No errors (clean compile).

```bash
cd /Users/jacobaskey/Development/LUaid && npm run build
```
Expected: Build succeeds, service worker generated.

```bash
cd /Users/jacobaskey/Development/LUaid && npm test
```
Expected: 1 test file, 1 test, all passing.

```bash
cd /Users/jacobaskey/Development/LUaid && npm run lint
```
Expected: No lint errors.

**Step 3: Commit**

```bash
cd /Users/jacobaskey/Development/LUaid
git add CLAUDE.md eslint.config.mjs
git commit -m "chore: update CLAUDE.md for TypeScript migration"
```

---

## Summary

| Task | Files | What Changes |
|------|-------|-------------|
| 1. Foundation | `tsconfig.json`, `package.json`, delete `jsconfig.json` | Add TS deps, configure compiler |
| 2. Configs | `next.config.ts`, `vitest.config.ts` | Convert configs, remove JSX hack |
| 3. i18n + Middleware | `routing.ts`, `request.ts`, `types.ts`, `middleware.ts` | Rename + add AppConfig augmentation |
| 4. Service Worker | `sw.ts` | Add web worker types, Serwist declarations |
| 5. Pages & Layout | `page.tsx`, `layout.tsx`, `~offline/page.tsx` | Add Metadata type, Props type |
| 6. Tests | `setup.ts`, `home.test.tsx` | Rename + type mock parameter |
| 7. Cleanup | `CLAUDE.md` | Update conventions, full verification |

**Total: ~12 files touched, 7 commits, 0 logic changes.**
