import { render, screen } from "@testing-library/react";
import { Alert } from "components";
import { testA11y } from "utils/testing/commonTests";

const alertComponent = (
  <Alert title="Test alert!" link="https://example.com">
    This is for testing.
  </Alert>
);

describe("<Alert />", () => {
  test("should render correctly", () => {
    render(alertComponent);
    expect(screen.getByRole("alert")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "https://example.com" })
    ).toHaveAttribute("href", "https://example.com");
    expect(screen.getByRole("alert")).toHaveTextContent("This is for testing.");
    expect(screen.getByRole("img", { name: "Alert" })).toBeVisible();
  });

  test("should hide the icon when appropriate", () => {
    render(<Alert title="mock title" showIcon={false} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  testA11y(alertComponent);
});
