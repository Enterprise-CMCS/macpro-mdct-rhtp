import { test } from "./fixtures/base";
import { HeaderPage } from "./pageObjects/header.page";
import {
  verifyHeaderVisible,
  verifyHeaderHidden,
  verifyMenuItemsVisible,
  verifyLogoutCompleted,
  verifyHeaderNavigation,
} from "../utils/header-assertions";

test.describe("global header", () => {
  test.describe("authenticated state user", () => {
    test.beforeEach(async ({ statePage }) => {
      await statePage.page.goto("/");
    });

    test("renders and navigates for state user", async ({ statePage }) => {
      const header = new HeaderPage(statePage.page);
      await verifyHeaderNavigation(header);
    });

    test("renders and supports account menu for state user", async ({
      statePage,
    }) => {
      const header = new HeaderPage(statePage.page);

      await verifyHeaderVisible(header);
      await header.openAccountMenu();
      await verifyMenuItemsVisible(header);
    });

    test("logs out state user from header", async ({ statePage }) => {
      const header = new HeaderPage(statePage.page);

      await header.logout();
      await verifyLogoutCompleted(header);
    });
  });

  test.describe("authenticated admin user", () => {
    test.beforeEach(async ({ adminPage }) => {
      await adminPage.page.goto("/");
    });

    test("renders and navigates for admin", async ({ adminPage }) => {
      const header = new HeaderPage(adminPage.page);
      await verifyHeaderNavigation(header);
    });

    test("renders and supports account menu for admin", async ({
      adminPage,
    }) => {
      const header = new HeaderPage(adminPage.page);

      await verifyHeaderVisible(header);
      await header.openAccountMenu();
      await verifyMenuItemsVisible(header);
    });

    test("logs out admin user from header", async ({ adminPage }) => {
      const header = new HeaderPage(adminPage.page);

      await header.logout();
      await verifyLogoutCompleted(header);
    });
  });

  test("does not render for unauthenticated users", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [],
      },
    });

    const page = await context.newPage();
    await page.goto("/");

    const header = new HeaderPage(page);
    await verifyHeaderHidden(header);

    await page.close();
    await context.close();
  });
});
