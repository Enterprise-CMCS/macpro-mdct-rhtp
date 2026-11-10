import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterWrappedComponent } from "utils/testing/setupTest";
import { LoginIDM } from "components";
import { testA11y } from "utils/testing/commonTests";

vi.mock("aws-amplify/auth");
vi.mock("utils");

const loginIDMComponent = (
  <RouterWrappedComponent>
    <LoginIDM />
  </RouterWrappedComponent>
);

describe("<LoginIDM />", () => {
  test("LoginIDM is visible", () => {
    render(loginIDMComponent);
    const loginButton = screen.getByRole("button");
    expect(loginButton).toBeVisible();
  });

  test("LoginIDM button calls login and stores redirect URL", async () => {
    render(loginIDMComponent);
    const loginButton = screen.getByRole("button");
    await userEvent.click(loginButton);
    expect(localStorage.getItem("ReturnURL")).toBe("/");
    localStorage.removeItem("ReturnURL");
  });

  testA11y(loginIDMComponent);
});
