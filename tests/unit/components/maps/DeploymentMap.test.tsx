import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DeploymentMap from "@/components/maps/DeploymentMap";

vi.mock("react-leaflet", () => ({
  MapContainer: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div
      data-testid="map-container"
      data-center={JSON.stringify(props.center)}
      data-zoom={String(props.zoom)}
    >
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({
    children,
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div data-testid="map-marker">{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-popup">{children}</div>
  ),
}));

vi.mock("leaflet", () => ({
  default: { divIcon: vi.fn(() => ({})) },
  divIcon: vi.fn(() => ({})),
}));

const mockPoints = [
  {
    lat: 16.62,
    lng: 120.35,
    quantity: 200,
    unit: "meals",
    orgName: "Red Cross",
    categoryName: "Meals",
  },
  {
    lat: 16.65,
    lng: 120.38,
    quantity: 6,
    unit: "filters",
    orgName: "Waves4Water",
    categoryName: "Water Filtration",
  },
];

describe("DeploymentMap", () => {
  it("renders a map container", () => {
    render(<DeploymentMap points={mockPoints} />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("renders a marker for each deployment point", () => {
    render(<DeploymentMap points={mockPoints} />);
    expect(screen.getAllByTestId("map-marker")).toHaveLength(2);
  });

  it("renders popup content with organization and category", () => {
    render(<DeploymentMap points={mockPoints} />);
    expect(screen.getByText("Red Cross")).toBeInTheDocument();
    expect(screen.getByText("Meals")).toBeInTheDocument();
    expect(screen.getByText("Waves4Water")).toBeInTheDocument();
    expect(screen.getByText("Water Filtration")).toBeInTheDocument();
  });

  it("renders quantity and unit in popup", () => {
    render(<DeploymentMap points={mockPoints} />);
    expect(screen.getByText(/200 meals/)).toBeInTheDocument();
    expect(screen.getByText(/6 filters/)).toBeInTheDocument();
  });

  it("renders empty map when no points provided", () => {
    render(<DeploymentMap points={[]} />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.queryAllByTestId("map-marker")).toHaveLength(0);
  });
});
