import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ===== Navigation =====
  async navigateToDashboard(reportType: string, state: string): Promise<void> {
    const route = `/report/${reportType}/${state}`;
    await this.navigateTo(route);
    await this.waitForLoadingComplete();
  }

  // ===== Modal Interactions =====
  async openCreateModal(): Promise<void> {
    // Look for "Start RHTP Report" or similar create button
    const createButton = this.page
      .getByRole("button")
      .filter({ hasText: /Start|New|Create/ })
      .first();
    await createButton.click();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  async openCopyModal(): Promise<void> {
    // Look for "Copy RHTP Submission" button
    const copyButton = this.page
      .getByRole("button")
      .filter({ hasText: /Copy/ })
      .first();
    await copyButton.click();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  // ===== Report Count =====
  async getReportCount(): Promise<number> {
    // Wait for the tbody element to exist (indicates table has loaded)
    const tbody = this.page.locator("tbody");
    await expect(tbody).toHaveCount(1);

    // Count only data rows in the tbody using Playwright semantic queries
    const dataRows = this.page.locator("tbody").getByRole("row");
    return await dataRows.count();
  }
}
