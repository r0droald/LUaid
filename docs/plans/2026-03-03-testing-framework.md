# Testing Framework (Vitest) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Vitest + React Testing Library so contributors can run `npm test` and get fast feedback on component behavior.

**Architecture:** Vitest with jsdom environment for browser API simulation, @vitejs/plugin-react for JSX, and React Testing Library for component assertions. Path alias `@/` resolved via Vite's resolve.alias to match the project's jsconfig.json.

**Tech Stack:** Vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/dom

---

### Task 1: Create feature branch

**Step 1: Create and switch to new branch from current scaffold branch**

```bash
git checkout -b feat/testing-framework
```

**Step 2: Verify branch**

```bash
git branch --show-current
```

Expected: `feat/testing-framework`

---

### Task 2: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Vitest and testing dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom
```

**Step 2: Verify installation**

```bash
npx vitest --version
```

Expected: Version number prints without error.

---

### Task 3: Create Vitest config

**Files:**
- Create: `vitest.config.js`

**Step 1: Create vitest.config.js**

```javascript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
  },
});
```

Notes:
- `resolve.alias` mirrors the `@/*` → `./src/*` mapping in `jsconfig.json`
- `jsdom` provides browser APIs (document, window) for component rendering
- `@vitejs/plugin-react` enables JSX transformation in test files

---

### Task 4: Add test scripts to package.json

**Files:**
- Modify: `package.json` (scripts section)

**Step 1: Add test script**

Add to the `scripts` object in package.json:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Notes:
- `npm test` runs once and exits (CI-friendly, simple for contributors)
- `npm run test:watch` runs in interactive watch mode for active development

**Step 2: Verify script runs (should show "no test files found" or similar)**

```bash
npm test
```

Expected: Vitest runs but finds no tests. Exit code 0 or informational message.

---

### Task 5: Write the smoke test

**Files:**
- Create: `tests/unit/home.test.js`

The homepage component (`src/app/[locale]/page.js`) uses `useTranslations` from `next-intl`. We mock that to isolate the component from the i18n runtime.

**Step 1: Create the test file**

```javascript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/[locale]/page";

vi.mock("next-intl", () => ({
  useTranslations: () => (key) => key,
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

Notes:
- `vi.mock("next-intl")` replaces useTranslations with a function that returns translation keys as-is
- We assert on the translation keys ("title", "description") since we're testing that the component renders and calls translations — not the translations themselves
- Uses `getByRole` for the heading (accessible query) and `getByText` for the paragraph

**Step 2: Run the test**

```bash
npm test
```

Expected: 1 test passes.

**Step 3: Commit**

```bash
git add tests/unit/home.test.js vitest.config.js package.json package-lock.json
git commit -m "feat: add Vitest testing framework with smoke test

- Configure Vitest with jsdom, React plugin, and @/ path alias
- Add React Testing Library for component testing
- Add homepage smoke test verifying render pipeline
- npm test runs once, npm run test:watch for development

Resolves #20"
```

---

### Task 6: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (Commands section)

**Step 1: Add test commands to the Commands section**

After the existing lint command, add:

```bash
# Run tests (once)
npm test

# Run tests (watch mode)
npm run test:watch
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add test commands to CLAUDE.md"
```

---

### Task 7: Push and create PR

**Step 1: Push branch to origin (fork)**

```bash
git push -u origin feat/testing-framework
```

**Step 2: Create PR against upstream main**

PR title: `feat: add Vitest testing framework with smoke test`

PR body should reference:
- Resolves #20
- What's included: Vitest config, React Testing Library, homepage smoke test, npm scripts
- Design decisions: Vitest over Jest (ESM-native, faster), no Playwright yet (contributor accessibility — requires browser binaries), mock strategy for next-intl
- How to use: `npm test` to run, `npm run test:watch` for development
