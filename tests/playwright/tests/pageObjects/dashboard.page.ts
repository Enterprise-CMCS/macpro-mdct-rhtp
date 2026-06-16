import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { TIMEOUT_UI } from "../../utils/timeouts";

export type DashboardState = "empty" | "unsubmitted" | "submitted";

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

  async waitForDashboardReady(): Promise<void> {
    const tableBodyRow = this.page.locator("tbody").getByRole("row").first();
    const emptyState = this.page.getByText(
      /Keep track of your|Once a state or territory begins/i
    );

    // Dashboard is ready when either data rows render or empty-state text is visible.
    await Promise.race([
      tableBodyRow.waitFor({ state: "visible", timeout: TIMEOUT_UI }),
      emptyState.first().waitFor({ state: "visible", timeout: TIMEOUT_UI }),
    ]).catch(() => {
      // If neither signal appears, continue and let downstream assertions provide context.
    });
  }

  // ===== Locators (private helpers) =====
  private getStartButton() {
    return this.page.getByRole("button").filter({ hasText: /Start/i }).first();
  }

  private getCopyButton() {
    // Look for buttons with "Copy" text
    return this.page.getByRole("button").filter({ hasText: /Copy/i }).first();
  }

  private getSubmittedStatusCell() {
    return this.page.getByRole("cell", { name: /^Submitted$/i }).first();
  }

  private getUnsubmittedStatusCell() {
    return this.page
      .getByRole("cell", { name: /^(Not started|In progress|In revision)$/i })
      .first();
  }

  // ===== Modal Interactions =====
  async isStartButtonAvailable(): Promise<boolean> {
    const btn = this.getStartButton();
    const visible = await btn.isVisible().catch(() => false);
    if (!visible) return false;
    return btn.isEnabled().catch(() => false);
  }

  async isStartButtonVisible(): Promise<boolean> {
    return this.getStartButton()
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
    await this.getStartButton().click();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  async openCopyModal(): Promise<void> {
    const button = this.getCopyButton();

    // Rely on Playwright's built-in actionability checks for visibility/enabled state.
    await button.click();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  async getDashboardState(): Promise<DashboardState> {
    await this.waitForDashboardReady();

    const [hasSubmitted, hasUnsubmitted] = await Promise.all([
      this.getSubmittedStatusCell()
        .isVisible({ timeout: TIMEOUT_UI })
        .catch(() => false),
      this.getUnsubmittedStatusCell()
        .isVisible({ timeout: TIMEOUT_UI })
        .catch(() => false),
    ]);

    if (hasUnsubmitted) {
      return "unsubmitted";
    }

    if (hasSubmitted) {
      return "submitted";
    }

    return "empty";
  }

  /**
   * Check if there are any submitted reports on the dashboard.
   * Looks for "Submitted" status text in the table.
   */
  async hasSubmittedReports(): Promise<boolean> {
    return (await this.getDashboardState()) === "submitted";
  }

  /**
   * Check if there are any unsubmitted (in progress or not started) reports.
   */
  async hasUnsubmittedReports(): Promise<boolean> {
    return (await this.getDashboardState()) === "unsubmitted";
  }
}
