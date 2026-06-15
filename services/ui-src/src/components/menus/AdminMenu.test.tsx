import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminMenu } from "components";
import { useStore } from "utils";
import { testA11y } from "utils/testing/commonTests";
import { RouterWrappedComponent } from "utils/testing/mockRouter";
import {
  mockAdminUserStore,
  mockApproverUserStore,
} from "utils/testing/setupTest";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;

const menuComponent = (
  <RouterWrappedComponent>
    <AdminMenu />
  </RouterWrappedComponent>
);

describe("<Menu />", () => {
  beforeEach(() => {
    mockedUseStore.mockReturnValue(mockAdminUserStore);
  });
  test("should contain a working link to the banner editor", async () => {
    render(menuComponent);
    await userEvent.click(screen.getByRole("button", { name: "admin menu" }));

    const bannerButton = screen.getByRole("button", { name: "Banner Editor" });
    await userEvent.click(bannerButton);

    expect(window.location.pathname).toEqual("/admin");
  });

  test("should not show notifications link for non-approver user", async () => {
    render(menuComponent);
    await userEvent.click(screen.getByRole("button", { name: "admin menu" }));

    const notificationsButton = screen.queryByRole("button", {
      name: "Notifications",
    });
    expect(notificationsButton).not.toBeInTheDocument();
  });

  test("should contain a working link to the notifications editor for approver user", async () => {
    mockedUseStore.mockReturnValue(mockApproverUserStore);
    render(menuComponent);
    await userEvent.click(screen.getByRole("button", { name: "admin menu" }));

    const notificationsButton = screen.getByRole("button", {
      name: "Notifications",
    });
    await userEvent.click(notificationsButton);

    expect(window.location.pathname).toEqual("/notifications");
  });

  testA11y(menuComponent);
});
