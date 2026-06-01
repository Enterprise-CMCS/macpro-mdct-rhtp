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
    return this.page
      .getByRole("button")
      .filter({ hasText: /Copy|Duplicate/i })
      .first();
  }

  // ===== Modal Interactions =====
  async isCreateButtonAvailable(): Promise<boolean> {
    return this.getCreateButton().isVisible();
  }

  async openCreateModal(): Promise<void> {
    // click() implicitly waits for the element to be visible and actionable
    await this.getCreateButton().click();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  async openCopyModal(): Promise<void> {
    await this.getCopyButton().click();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  // ===== Report Count =====
  async getReportCount(): Promise<number> {
    const tbody = this.page.locator("tbody");
    await expect(tbody).toHaveCount(1);
    return await tbody.getByRole("row").count();
  }

  /**
   * Check if there are any submitted reports on the dashboard.
   * Looks for "Submitted" status text in the table.
   */
  async hasSubmittedReports(): Promise<boolean> {
    try {
      const submittedCell = this.page.locator(
        'td:has-text("Submitted"), text="Submitted"'
      );
      return await submittedCell
        .first()
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }

  /**
   * Check if there are any unsubmitted (in progress or not started) reports.
   */
  async hasUnsubmittedReports(): Promise<boolean> {
    try {
      const unsubmittedCell = this.page.locator(
        'td:has-text("Not started"), td:has-text("In progress"), text="Not started", text="In progress"'
      );
      return await unsubmittedCell
        .first()
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }
}
