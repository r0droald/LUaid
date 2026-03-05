import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/[locale]/page";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("HomePage", () => {
  it("renders the title and description", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "title"
    );
    expect(screen.getByText("description")).toBeInTheDocument();
  });
});
