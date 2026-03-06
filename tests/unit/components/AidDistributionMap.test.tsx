import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AidDistributionMap from "@/components/AidDistributionMap";

vi.mock("@/components/maps/DeploymentMap", () => ({
  default: ({ points }: { points: unknown[] }) => (
    <div data-testid="deployment-map">Map with {points.length} points</div>
  ),
}));

const mockBarangays = [
  { name: "Urbiztondo", municipality: "San Juan", beneficiaries: 1245 },
  { name: "Poblacion", municipality: "San Juan", beneficiaries: 987 },
];

const mockPoints = [
  {
    lat: 16.62,
    lng: 120.35,
    quantity: 200,
    unit: "meals",
    orgName: "Red Cross",
    categoryName: "Meals",
  },
];

describe("AidDistributionMap", () => {
  it("renders barangay names and beneficiary counts", () => {
    render(
      <AidDistributionMap
        barangays={mockBarangays}
        deploymentPoints={mockPoints}
      />
    );
    expect(screen.getByText(/Urbiztondo/)).toBeInTheDocument();
    expect(screen.getByText("1,245")).toBeInTheDocument();
    expect(screen.getByText(/Poblacion/)).toBeInTheDocument();
  });

  it("renders DeploymentMap when deployment points exist", () => {
    render(
      <AidDistributionMap
        barangays={mockBarangays}
        deploymentPoints={mockPoints}
      />
    );
    expect(screen.getByTestId("deployment-map")).toBeInTheDocument();
  });

  it("renders placeholder when no deployment points", () => {
    render(
      <AidDistributionMap barangays={mockBarangays} deploymentPoints={[]} />
    );
    expect(screen.queryByTestId("deployment-map")).not.toBeInTheDocument();
    expect(screen.getByText(/no deployment data/i)).toBeInTheDocument();
  });
});
