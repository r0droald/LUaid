import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DeploymentHubs from "@/components/DeploymentHubs";

describe("DeploymentHubs", () => {
  it("renders hub names with deployment counts", () => {
    render(
      <DeploymentHubs
        hubs={[
          { name: "Waves for Water", municipality: "San Juan, La Union", count: 45 },
          { name: "Art Relief Mobile Kitchen", municipality: "Bacnotan, La Union", count: 38 },
        ]}
      />
    );
    expect(screen.getByText("Waves for Water")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("San Juan, La Union")).toBeInTheDocument();
  });
});
