import { test } from "../fixtures/base";
import { FooterPage } from "../pages/footer.page";
import {
  verifyFooterVisible,
  verifyFooterHidden,
  verifyFooterNavigation,
} from "../support/assertions/footer.assertions";

test.describe("global footer", () => {
  test.describe("authenticated state user", () => {
    test.beforeEach(async ({ statePage }) => {
      await statePage.page.goto("/");
    });

    test("renders for state user", async ({ statePage }) => {
      const footer = new FooterPage(statePage.page);
      await verifyFooterVisible(footer);
    });

    test("navigates via Contact Us link for state user", async ({
      statePage,
    }) => {
      const footer = new FooterPage(statePage.page);
      await verifyFooterNavigation(footer);
    });
  });

  test.describe("authenticated admin user", () => {
    test.beforeEach(async ({ adminPage }) => {
      await adminPage.page.goto("/");
    });

    test("renders for admin user", async ({ adminPage }) => {
      const footer = new FooterPage(adminPage.page);
      await verifyFooterVisible(footer);
    });

    test("navigates via Contact Us link for admin user", async ({
      adminPage,
    }) => {
      const footer = new FooterPage(adminPage.page);
      await verifyFooterNavigation(footer);
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

    const footer = new FooterPage(page);
    await verifyFooterHidden(footer);

    await context.close();
  });
});
