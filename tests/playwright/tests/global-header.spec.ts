import { expect } from "@playwright/test";
import { test } from "./fixtures/base";
import { HeaderPage } from "./pageObjects/header.page";

test.describe("global header", () => {
  test.describe("authenticated state user", () => {
    test.beforeEach(async ({ statePage }) => {
      await statePage.page.goto("/");
    });

    test("renders and navigates for state user", async ({ statePage }) => {
      const header = new HeaderPage(statePage.page);

      await header.expectVisible();
      await expect(header.helpLink).toHaveAttribute("href", "/help");

      await header.goToHelp();

      await statePage.page.goto("/");
      await header.goToProfileFromMenu();
    });
  });

  test.describe("authenticated admin user", () => {
    test.beforeEach(async ({ adminPage }) => {
      await adminPage.page.goto("/");
    });

    test("renders and supports account menu for admin", async ({
      adminPage,
    }) => {
      const header = new HeaderPage(adminPage.page);

      await header.expectVisible();
      await header.openAccountMenu();

      await expect(
        adminPage.page.getByRole("menuitem", { name: "Manage Account" })
      ).toBeVisible();
      await expect(
        adminPage.page.getByRole("menuitem", { name: "Log Out" })
      ).toBeVisible();
    });

    test("logs out admin user from header", async ({ adminPage }) => {
      const header = new HeaderPage(adminPage.page);

      await header.logoutFromMenu();
      await expect(header.accountButton).toHaveCount(0);
      await expect(header.nav).toHaveCount(0);
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
    await header.expectHidden();

    await page.close();
    await context.close();
  });
});
