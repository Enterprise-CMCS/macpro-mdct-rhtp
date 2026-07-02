import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterWrappedComponent } from "utils/testing/setupTest";
import { LoginIDM } from "components";
import { testA11y } from "utils/testing/commonTests";
import { getReturnUrl } from "utils";

vi.mock("aws-amplify/auth");
vi.mock("utils");
const mockGetReturnUrl = vi.mocked(getReturnUrl);

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

  test("LoginIDM button calls login and checks for redirect", async () => {
    render(loginIDMComponent);
    const loginButton = screen.getByRole("button");
    await userEvent.click(loginButton);
    expect(mockGetReturnUrl).toHaveBeenCalled();
  });

  testA11y(loginIDMComponent);
});
