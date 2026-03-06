# Dashboard Route & RLS Policies Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the dashboard to feature parity by wiring up the 7 existing presentation components with live Supabase data and enabling anon read access via RLS policies.

**Architecture:** A single `DashboardPage` component fetches all data via `Promise.all` in a `useEffect`, then passes results as props to the 7 existing presentation components. RLS policies grant read-only `SELECT` access to the `anon` role on all 5 tables. This is the minimal scaffolding — future PRs will add React Context, offline caching (IndexedDB), and progressive loading per Rod's architecture doc.

**Tech Stack:** React 19, react-router v7, Vitest + React Testing Library, Supabase (Postgres RLS)

---

### Task 1: Create feature branch

**Step 1: Create and switch to feature branch**

```bash
git checkout -b feat/dashboard-route-rls
```

---

### Task 2: Write the DashboardPage test

**Files:**
- Create: `tests/unit/pages/DashboardPage.test.tsx`

**Step 1: Write the failing test**

This test mocks all 8 query functions and verifies the page renders all 7 components with the fetched data.

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardPage } from "@/pages/DashboardPage";

// Mock queries module
vi.mock("@/lib/queries", () => ({
  getTotalDonations: vi.fn(),
  getTotalBeneficiaries: vi.fn(),
  getVolunteerCount: vi.fn(),
  getDonationsByOrganization: vi.fn(),
  getDeploymentHubs: vi.fn(),
  getGoodsByCategory: vi.fn(),
  getDeploymentMapPoints: vi.fn(),
  getBeneficiariesByBarangay: vi.fn(),
}));

// Mock react-i18next (Header uses it)
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

import {
  getTotalDonations,
  getTotalBeneficiaries,
  getVolunteerCount,
  getDonationsByOrganization,
  getDeploymentHubs,
  getGoodsByCategory,
  getDeploymentMapPoints,
  getBeneficiariesByBarangay,
} from "@/lib/queries";

const mockQueries = () => {
  vi.mocked(getTotalDonations).mockResolvedValue(500000);
  vi.mocked(getTotalBeneficiaries).mockResolvedValue(1200);
  vi.mocked(getVolunteerCount).mockResolvedValue(50);
  vi.mocked(getDonationsByOrganization).mockResolvedValue([
    { name: "Red Cross", amount: 300000 },
    { name: "LGU", amount: 200000 },
  ]);
  vi.mocked(getDeploymentHubs).mockResolvedValue([
    { name: "Hub A", municipality: "San Fernando", count: 5 },
  ]);
  vi.mocked(getGoodsByCategory).mockResolvedValue([
    { name: "Meals", icon: null, total: 800 },
  ]);
  vi.mocked(getDeploymentMapPoints).mockResolvedValue([]);
  vi.mocked(getBeneficiariesByBarangay).mockResolvedValue([
    { name: "Catbangen", municipality: "San Fernando", beneficiaries: 400 },
  ]);
};

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueries();
  });

  it("shows loading state initially", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders dashboard components after data loads", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("₱500,000")).toBeInTheDocument();
    });

    // SummaryCards
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();

    // DonationsByOrg
    expect(screen.getByText("Red Cross")).toBeInTheDocument();
    expect(screen.getByText("LGU")).toBeInTheDocument();

    // DeploymentHubs
    expect(screen.getByText("Hub A")).toBeInTheDocument();

    // GoodsByCategory
    expect(screen.getByText("Meals")).toBeInTheDocument();

    // AidDistributionMap (barangays)
    expect(screen.getByText(/Catbangen/)).toBeInTheDocument();

    // StatusFooter
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("renders error state with retry button on fetch failure", async () => {
    vi.mocked(getTotalDonations).mockRejectedValue(new Error("Network error"));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/pages/DashboardPage.test.tsx`
Expected: FAIL — module `@/pages/DashboardPage` does not exist

---

### Task 3: Implement DashboardPage

**Files:**
- Create: `src/pages/DashboardPage.tsx`

**Step 1: Implement the page component**

```tsx
import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import SummaryCards from "@/components/SummaryCards";
import DonationsByOrg from "@/components/DonationsByOrg";
import DeploymentHubs from "@/components/DeploymentHubs";
import GoodsByCategory from "@/components/GoodsByCategory";
import AidDistributionMap from "@/components/AidDistributionMap";
import StatusFooter from "@/components/StatusFooter";
import {
  getTotalDonations,
  getTotalBeneficiaries,
  getVolunteerCount,
  getDonationsByOrganization,
  getDeploymentHubs,
  getGoodsByCategory,
  getBeneficiariesByBarangay,
} from "@/lib/queries";

type DashboardData = {
  totalDonations: number;
  totalBeneficiaries: number;
  volunteerCount: number;
  donationsByOrg: { name: string; amount: number }[];
  deploymentHubs: { name: string; municipality: string; count: number }[];
  goodsByCategory: { name: string; icon: string | null; total: number }[];
  barangays: { name: string; municipality: string; beneficiaries: number }[];
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        totalDonations,
        totalBeneficiaries,
        volunteerCount,
        donationsByOrg,
        deploymentHubs,
        goodsByCategory,
        barangays,
      ] = await Promise.all([
        getTotalDonations(),
        getTotalBeneficiaries(),
        getVolunteerCount(),
        getDonationsByOrganization(),
        getDeploymentHubs(),
        getGoodsByCategory(),
        getBeneficiariesByBarangay(),
      ]);

      setData({
        totalDonations,
        totalBeneficiaries,
        volunteerCount,
        donationsByOrg,
        deploymentHubs,
        goodsByCategory,
        barangays,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading dashboard…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-400">Failed to load dashboard data</p>
        <button
          onClick={fetchData}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <Header />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <SummaryCards
          totalDonations={data.totalDonations}
          totalBeneficiaries={data.totalBeneficiaries}
          volunteerCount={data.volunteerCount}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DonationsByOrg donations={data.donationsByOrg} />
          <DeploymentHubs hubs={data.deploymentHubs} />
        </div>
        <GoodsByCategory categories={data.goodsByCategory} />
        <AidDistributionMap barangays={data.barangays} />
      </main>
      <StatusFooter />
    </div>
  );
}
```

**Step 2: Run tests to verify they pass**

Run: `npm test -- tests/unit/pages/DashboardPage.test.tsx`
Expected: All 3 tests PASS

**Step 3: Commit**

```bash
git add src/pages/DashboardPage.tsx tests/unit/pages/DashboardPage.test.tsx
git commit -m "feat: add DashboardPage with data fetching and tests"
```

---

### Task 4: Update router and delete HomePage

**Files:**
- Modify: `src/router.tsx`
- Delete: `src/pages/HomePage.tsx`
- Modify: `tests/unit/home.test.tsx` → rename to `tests/unit/pages/DashboardPage.test.tsx` (already created in Task 2)

**Step 1: Update router.tsx**

Replace the HomePage import and route with DashboardPage:

```tsx
import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { DashboardPage } from "./pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/en" replace />,
  },
  {
    path: "/:locale",
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
    ],
  },
]);
```

**Step 2: Delete HomePage and its test**

```bash
rm src/pages/HomePage.tsx
rm tests/unit/home.test.tsx
```

**Step 3: Run all tests to verify nothing is broken**

Run: `npm test`
Expected: All tests PASS (existing component tests + new DashboardPage test)

**Step 4: Verify build**

Run: `npm run build`
Expected: Clean build, no TypeScript errors

**Step 5: Commit**

```bash
git add src/router.tsx tests/unit/pages/DashboardPage.test.tsx
git rm src/pages/HomePage.tsx tests/unit/home.test.tsx
git commit -m "feat: wire dashboard as index route, remove HomePage placeholder"
```

---

### Task 5: Add RLS policies

**Files:**
- Create: `supabase/rls-policies.sql`

**Step 1: Write the RLS migration**

```sql
-- RLS Policies: Public read access for dashboard
-- LUaid serves open relief data — all dashboard tables are publicly readable.
-- Write policies will be added when authenticated forms are implemented.

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_organizations" ON organizations
  FOR SELECT USING (true);

-- Aid categories
ALTER TABLE aid_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_aid_categories" ON aid_categories
  FOR SELECT USING (true);

-- Barangays
ALTER TABLE barangays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_barangays" ON barangays
  FOR SELECT USING (true);

-- Donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_donations" ON donations
  FOR SELECT USING (true);

-- Deployments
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_deployments" ON deployments
  FOR SELECT USING (true);
```

**Step 2: Commit**

```bash
git add supabase/rls-policies.sql
git commit -m "feat: add anon read RLS policies for all dashboard tables"
```

---

### Task 6: Final verification

**Step 1: Run full test suite**

Run: `npm test`
Expected: All tests PASS

**Step 2: Run linter**

Run: `npm run lint`
Expected: No errors

**Step 3: Run production build**

Run: `npm run build`
Expected: Clean build, no errors

---

## Notes for future PRs

- **Offline caching:** Add React Context + IndexedDB layer between DashboardPage and queries.ts (per Rod's architecture doc)
- **Progressive loading:** Replace `Promise.all` with per-section hooks for progressive rendering
- **Component directories:** Move dashboard components into `src/components/dashboard/` when `forms/`, `maps/`, `shared/` are populated
- **`getDeploymentMapPoints`:** Not used in the current page (AidDistributionMap uses barangay data, not raw lat/lng points). Will be needed when the interactive Leaflet map is implemented (Issue #7).
