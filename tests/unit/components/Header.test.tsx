import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

describe("Header", () => {
  it("renders logo, language display, and volunteer button", () => {
    render(<Header />);
    expect(screen.getByText("LUaid.org")).toBeInTheDocument();
    expect(screen.getByText("Navigation.volunteer")).toBeInTheDocument();
  });
});
