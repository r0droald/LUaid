import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GoodsByCategory from "@/components/GoodsByCategory";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

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
