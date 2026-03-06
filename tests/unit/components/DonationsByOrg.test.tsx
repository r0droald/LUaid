import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DonationsByOrg from "@/components/DonationsByOrg";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

describe("DonationsByOrg", () => {
  it("renders organization names and amounts", () => {
    render(
      <DonationsByOrg
        donations={[
          { name: "Waves4Water", amount: 500000 },
          { name: "Citizens for LU", amount: 300000 },
        ]}
      />
    );
    expect(screen.getByText("Waves4Water")).toBeInTheDocument();
    expect(screen.getByText("₱500,000")).toBeInTheDocument();
    expect(screen.getByText("Citizens for LU")).toBeInTheDocument();
  });

  it("renders empty state gracefully", () => {
    const { container } = render(<DonationsByOrg donations={[]} />);
    expect(container).toBeTruthy();
  });
});
