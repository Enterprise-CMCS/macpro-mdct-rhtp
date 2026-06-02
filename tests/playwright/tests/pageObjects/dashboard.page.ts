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

  // ===== Locators (private helpers) =====
  private getCreateButton() {
    // Prefer specific pattern first, fall back to generic
    const specific = this.page
      .getByRole("button")
      .filter({ hasText: /Start.*Report|Add.*Report/i });
    const generic = this.page
      .getByRole("button")
      .filter({ hasText: /Start|New|Create/i });
    // Return the first visible match
    return specific.or(generic).first();
  }

  private getCopyButton() {
    return this.page.getByRole("button").filter({ hasText: /Copy/i }).first();
  }

  // ===== Modal Interactions =====
  async isCreateButtonAvailable(): Promise<boolean> {
    const btn = this.getCreateButton();
    const visible = await btn.isVisible().catch(() => false);
    if (!visible) return false;
    const enabled = await btn.isEnabled().catch(() => false);
    return enabled;
  }

  async isCreateButtonVisible(): Promise<boolean> {
    return await this.getCreateButton()
      .isVisible()
      .catch(() => false);
  }

  async isCopyButtonAvailable(): Promise<boolean> {
    const btn = this.getCopyButton();
    const visible = await btn.isVisible().catch(() => false);
    if (!visible) return false;
    const enabled = await btn.isEnabled().catch(() => false);
    return enabled;
  }

  async isCopyButtonVisible(): Promise<boolean> {
    return await this.getCopyButton()
      .isVisible()
      .catch(() => false);
  }

  async openCreateModal(): Promise<void> {
    // click() implicitly waits for the element to be visible and actionable
    await this.getCreateButton().click();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  async openCopyModal(): Promise<void> {
    const button = this.getCopyButton();

    // Check if button exists and is enabled before clicking (with 3 second timeout)
    const isEnabled = await button
      .isEnabled({ timeout: 3000 })
      .catch(() => false);
    if (!isEnabled) {
      throw new Error(
        "Copy button is disabled or not found - unsubmitted report may exist"
      );
    }

    await button.click({ timeout: 5000 });
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  // ===== Report Count =====
  async getReportCount(): Promise<number> {
    // Try to find table body rows - handle both table and non-table structures
    try {
      const tbody = this.page.locator("tbody").first();
      const isVisible = await tbody
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      if (isVisible) {
        return await tbody.getByRole("row").count();
      }
    } catch {
      // tbody doesn't exist, try alternative selectors
    }

    // Fallback: look for any row-like elements (table or div-based)
    try {
      const rows = this.page.locator("[role='row']");
      const count = await rows.count();
      return Math.max(count, 0);
    } catch {
      return 0;
    }
  }

  /**
   * Check if there are any submitted reports on the dashboard.
   * Looks for "Submitted" status text in the table.
   */
  async hasSubmittedReports(): Promise<boolean> {
    return await this.page
      .locator("td")
      .filter({ hasText: /^Submitted$/i })
      .first()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Check if there are any unsubmitted (in progress or not started) reports.
   */
  async hasUnsubmittedReports(): Promise<boolean> {
    return await this.page
      .locator("td")
      .filter({ hasText: /^(Not started|In progress)$/i })
      .first()
      .isVisible()
      .catch(() => false);
  }
}
