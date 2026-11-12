import { test, expect } from "./fixtures/base";
import { AdminDashboardPage } from "./pageObjects/admin-dashboard.page";
import { reportType, stateAbbreviation } from "../utils/consts";
import { escapeRegExp } from "../utils/report-edit-shared-helpers";

test.describe("Admin Dashboard", () => {
  let dashboard: AdminDashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    dashboard = new AdminDashboardPage(adminPage.page);
    await dashboard.navigateToAdminDashboard();
  });

  test("should display the admin dashboard", async () => {
    await expect(dashboard.adminPageHeading).toBeVisible();
  });

  test("should open and close the first annual report dialog", async ({
    adminPage,
  }) => {
    const dialog = adminPage.page.getByRole("dialog", {
      name: "Start First Annual Report",
      exact: true,
    });

    await dashboard.clickStartFirstAnnualReportButton();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /^Close(?:\s+Close)?$/i }).click();
    await expect(dialog).toBeHidden();
  });

  test("should open report after clicking the view report button", async ({
    adminPage,
  }) => {
    const reportName = await dashboard.getReportName(
      stateAbbreviation,
      "Quarterly"
    );
    const expectedReportUrl = new RegExp(
      `/report/${escapeRegExp(reportType)}/${escapeRegExp(stateAbbreviation)}/[^/?#]+(?:/[^?#]*)?(?:[?#].*)?$`
    );

    await dashboard.clickViewReportButton(reportName);
    await expect(adminPage.page).toHaveURL(expectedReportUrl);
    await expect(
      adminPage.page.getByText(reportName, { exact: true })
    ).toBeVisible();
  });

  test("should open comment/status dialog after clicking the comment/status button", async ({
    adminPage,
  }) => {
    const reportName = await dashboard.getReportName(
      stateAbbreviation,
      "Annual"
    );
    const dialog = adminPage.page.getByRole("dialog", {
      name: "Add comment to report",
      exact: true,
    });

    await dashboard.clickCommentStatusButton(reportName);
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(`Report: ${reportName}`, { exact: true })
    ).toBeVisible();
  });
});
