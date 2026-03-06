import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusFooter from "@/components/StatusFooter";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

describe("StatusFooter", () => {
  it("renders online status and timestamp", () => {
    render(<StatusFooter />);
    expect(screen.getByText("Dashboard.online")).toBeInTheDocument();
    expect(screen.getByText(/Dashboard\.lastUpdated/)).toBeInTheDocument();
  });
});
