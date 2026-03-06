import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SummaryCards from "@/components/SummaryCards";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

const defaultProps = {
  totalDonations: 2847500,
  totalBeneficiaries: 12847,
  volunteerCount: 234,
  orgCount: 9,
  locationCount: 10,
  deploymentCount: 55,
};

describe("SummaryCards", () => {
  it("renders all three summary values", () => {
    render(<SummaryCards {...defaultProps} />);
    expect(screen.getByText("₱2,847,500")).toBeInTheDocument();
    expect(screen.getByText("12,847")).toBeInTheDocument();
    expect(screen.getByText("234")).toBeInTheDocument();
  });

  it("renders translated labels", () => {
    render(
      <SummaryCards
        {...defaultProps}
        totalDonations={0}
        totalBeneficiaries={0}
        volunteerCount={0}
      />
    );
    expect(screen.getByText("Dashboard.totalDonations")).toBeInTheDocument();
    expect(screen.getByText("Dashboard.totalBeneficiaries")).toBeInTheDocument();
    expect(screen.getByText("Dashboard.volunteerCount")).toBeInTheDocument();
  });
});
