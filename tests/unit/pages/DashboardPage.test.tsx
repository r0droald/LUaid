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
  getBeneficiariesByBarangay: vi.fn(),
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

// Mock react-router (Header uses useParams/useNavigate)
vi.mock("react-router", () => ({
  useParams: () => ({ locale: "en" }),
  useNavigate: () => vi.fn(),
}));

import {
  getTotalDonations,
  getTotalBeneficiaries,
  getVolunteerCount,
  getDonationsByOrganization,
  getDeploymentHubs,
  getGoodsByCategory,
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
    expect(screen.getByText("Dashboard.loading")).toBeInTheDocument();
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
    expect(screen.getByText("Dashboard.online")).toBeInTheDocument();
  });

  it("renders error state with retry button on fetch failure", async () => {
    vi.mocked(getTotalDonations).mockRejectedValue(new Error("Network error"));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard.loadError")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Dashboard.retry" })).toBeInTheDocument();
  });
});
