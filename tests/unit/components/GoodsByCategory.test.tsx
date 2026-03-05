import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GoodsByCategory from "@/components/GoodsByCategory";

describe("GoodsByCategory", () => {
  it("renders category names and totals", () => {
    render(
      <GoodsByCategory
        categories={[
          { name: "Water Filtration", icon: "💧", total: 6780 },
          { name: "Meals", icon: "🍽️", total: 15420 },
        ]}
      />
    );
    expect(screen.getByText("Water Filtration")).toBeInTheDocument();
    expect(screen.getByText("6,780")).toBeInTheDocument();
    expect(screen.getByText("Meals")).toBeInTheDocument();
  });
});
