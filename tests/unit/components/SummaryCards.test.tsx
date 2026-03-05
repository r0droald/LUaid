import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SummaryCards from "@/components/SummaryCards";

describe("SummaryCards", () => {
  it("renders all three summary values", () => {
    render(
      <SummaryCards
        totalDonations={2847500}
        totalBeneficiaries={12847}
        volunteerCount={234}
      />
    );
    expect(screen.getByText("₱2,847,500")).toBeInTheDocument();
    expect(screen.getByText("12,847")).toBeInTheDocument();
    expect(screen.getByText("234")).toBeInTheDocument();
  });
});
