import { render, screen } from "@testing-library/react";
// components
import { AccessDeniedPage } from "components";
import { testA11y } from "utils/testing/commonTests";

const accessDeniedView = <AccessDeniedPage />;

describe("<AccessDeniedPage />", () => {
  test("Check that page renders", () => {
    render(accessDeniedView);
    const heading = screen.getByRole("heading", { name: "Access Denied" });
    expect(heading).toBeVisible();
  });

  testA11y(accessDeniedView);
});
