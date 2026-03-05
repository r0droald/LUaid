import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("Header", () => {
  it("renders logo, language display, and volunteer button", () => {
    render(<Header />);
    expect(screen.getByText("LUaid.org")).toBeInTheDocument();
    expect(screen.getByText("volunteer")).toBeInTheDocument();
  });
});
