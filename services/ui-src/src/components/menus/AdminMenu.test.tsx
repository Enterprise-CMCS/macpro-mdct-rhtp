import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminMenu } from "components";
import { testA11y } from "utils/testing/commonTests";
import { RouterWrappedComponent } from "utils/testing/mockRouter";

const menuComponent = (
  <RouterWrappedComponent>
    <AdminMenu />
  </RouterWrappedComponent>
);

describe("<Menu />", () => {
  test("should contain a working link to the banner editor", async () => {
    render(menuComponent);
    await userEvent.click(screen.getByRole("button", { name: "admin menu" }));

    const bannerButton = screen.getByText("Banner Editor");
    await userEvent.click(bannerButton);

    expect(window.location.pathname).toEqual("/admin");
  });

  testA11y(menuComponent);
});
