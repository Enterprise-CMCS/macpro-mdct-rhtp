import { render, screen } from "@testing-library/react";
import { NotificationsPage } from "./NotificationsPage";

describe("NotificationsPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders for approver user", () => {
    render(<NotificationsPage />);
    expect(
      screen.getByRole("heading", { name: "Notifications Settings" })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Add email" })).toBeVisible();
  });
});
