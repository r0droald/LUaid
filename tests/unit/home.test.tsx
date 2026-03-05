import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/queries", () => ({
  getTotalDonations: vi.fn(),
  getTotalBeneficiaries: vi.fn(),
  getVolunteerCount: vi.fn(),
  getDonationsByOrganization: vi.fn(),
  getDeploymentHubs: vi.fn(),
  getGoodsByCategory: vi.fn(),
  getBeneficiariesByBarangay: vi.fn(),
}));

describe("DashboardPage", () => {
  it("module exports a function", async () => {
    const mod = await import("@/app/[locale]/page");
    expect(typeof mod.default).toBe("function");
  });
});
