import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AidDistributionMap from "@/components/AidDistributionMap";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

describe("AidDistributionMap", () => {
  it("renders barangay names and beneficiary counts", () => {
    render(
      <AidDistributionMap
        barangays={[
          { name: "Urbiztondo", municipality: "San Juan", beneficiaries: 1245 },
          { name: "Poblacion", municipality: "San Juan", beneficiaries: 987 },
        ]}
      />
    );
    expect(screen.getByText(/Urbiztondo/)).toBeInTheDocument();
    expect(screen.getByText("1,245")).toBeInTheDocument();
    expect(screen.getByText(/Poblacion/)).toBeInTheDocument();
  });
});
