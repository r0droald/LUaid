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
  getDeploymentMapPoints: vi.fn(),
}));

vi.mock("@/components/maps/DeploymentMap", () => ({
  default: () => <div data-testid="deployment-map" />,
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
  getBeneficiariesByBarangay,
  getDeploymentMapPoints,
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
  vi.mocked(getDeploymentMapPoints).mockResolvedValue([
    { lat: 16.62, lng: 120.35, quantity: 200, unit: "meals", orgName: "Red Cross", categoryName: "Meals" },
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
