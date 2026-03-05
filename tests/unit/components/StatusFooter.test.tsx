import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusFooter from "@/components/StatusFooter";

describe("StatusFooter", () => {
  it("renders online status and timestamp", () => {
    render(<StatusFooter />);
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByText(/Last Updated/)).toBeInTheDocument();
  });
});
