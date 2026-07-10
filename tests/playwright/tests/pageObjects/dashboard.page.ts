import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { TIMEOUT_LOADING, TIMEOUT_UI } from "../../utils/timeouts";

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
    return this.page
      .getByRole("button", { name: /^Start .* Report$/i })
      .first();
  }

  private getCopyButton() {
    return this.page
      .getByRole("button", { name: /^Copy .* Submission$/i })
      .first();
  }

  private getSubmittedStatusCell() {
    return this.page.getByRole("cell", { name: /^Submitted$/i }).first();
  }

  private getUnsubmittedStatusCell() {
    return this.page
      .getByRole("cell", { name: /^(Not started|In progress|In revision)$/i })
      .first();
  }

  private getViewReportButton() {
    return this.page.getByRole("button", { name: /^View .* report$/i }).first();
  }

  private getReportActionButtonForStatus(statusPattern: RegExp) {
    const row = this.page
      .locator("tbody tr")
      .filter({ has: this.page.getByRole("cell", { name: statusPattern }) })
      .first();
    return row.getByRole("button", { name: /^View .* report$/i }).first();
  }

  private getReportActionButtonsForStatus(statusPattern: RegExp) {
    const rows = this.page
      .locator("tbody tr")
      .filter({ has: this.page.getByRole("cell", { name: statusPattern }) });
    return rows.getByRole("button", { name: /^View .* report$/i });
  }

  async getEditableReportCount(): Promise<number> {
    await this.waitForDashboardReady();
    return this.getReportActionButtonsForStatus(
      /^(Not started|In progress|In revision)$/i
    ).count();
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
    await this.waitForDashboardReady();

    // Wait for the button to be enabled — canCreateReport is async (set after reports API resolves)
    const btn = this.getStartButton();
    await btn.waitFor({ state: "visible", timeout: TIMEOUT_UI });
    await expect(btn).toBeEnabled({ timeout: TIMEOUT_UI });
    await btn.click();

    // Wait for modal to appear with extended timeout
    await expect(this.page.getByRole("dialog")).toBeVisible({
      timeout: TIMEOUT_LOADING,
    });
  }

  async openCopyModal(): Promise<void> {
    const button = this.getCopyButton();

    // Rely on Playwright's built-in actionability checks for visibility/enabled state.
    await expect(button).toBeVisible({ timeout: TIMEOUT_UI });
    await expect(button).toBeEnabled({ timeout: TIMEOUT_UI });
    await button.click();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  async openEditableReportByIndex(index = 0): Promise<void> {
    const editButtons = this.getReportActionButtonsForStatus(
      /^(Not started|In progress|In revision)$/i
    );
    const editableCount = await editButtons.count();

    // Prefer an explicitly editable row; fallback to first visible report action.
    const editButton =
      editableCount > 0
        ? editButtons.nth(Math.min(index, editableCount - 1))
        : this.getReportActionButtonForStatus(
            /^(Not started|In progress|In revision)$/i
          );
    const fallbackButton = this.page
      .getByRole("button", { name: /^View .* report$/i })
      .first();

    const targetButton = (await editButton.isVisible().catch(() => false))
      ? editButton
      : fallbackButton;

    await Promise.all([
      this.page.waitForURL(/\/report\/[^/]+\/[^/]+\/[^/]+(?:\/[^/]+)?/),
      targetButton.click(),
    ]);
    await this.waitForLoadingComplete();
  }

  async openFirstEditableReport(): Promise<void> {
    await this.openEditableReportByIndex(0);
  }

  async openFirstSubmittedReport(): Promise<void> {
    const viewButton = this.getReportActionButtonForStatus(/^Submitted$/i);
    const fallbackButton = this.page
      .getByRole("button", { name: /^View .* report$/i })
      .first();

    const targetButton = (await viewButton.isVisible().catch(() => false))
      ? viewButton
      : fallbackButton;

    await Promise.all([
      this.page.waitForURL(/\/report\/[^/]+\/[^/]+\/[^/]+(?:\/[^/]+)?/),
      targetButton.click(),
    ]);
    await this.waitForLoadingComplete();
  }

  async getDashboardState(): Promise<DashboardState> {
    await this.waitForDashboardReady();

    const [hasSubmitted, hasUnsubmitted, hasViewReportButton, hasCopyButton] =
      await Promise.all([
        this.getSubmittedStatusCell()
          .isVisible({ timeout: TIMEOUT_UI })
          .catch(() => false),
        this.getUnsubmittedStatusCell()
          .isVisible({ timeout: TIMEOUT_UI })
          .catch(() => false),
        this.getViewReportButton()
          .isVisible({ timeout: TIMEOUT_UI })
          .catch(() => false),
        this.getCopyButton()
          .isVisible({ timeout: TIMEOUT_UI })
          .catch(() => false),
      ]);

    if (hasUnsubmitted) {
      return "unsubmitted";
    }

    if (hasSubmitted) {
      return "submitted";
    }

    // Fallback: action button state can be a more reliable signal than status-cell text.
    if (hasViewReportButton) {
      return hasCopyButton ? "submitted" : "unsubmitted";
    }

    const firstRowText = await this.page
      .locator("tbody tr")
      .first()
      .textContent()
      .catch(() => null);

    if (firstRowText) {
      if (/\b(Not started|In progress|In revision)\b/i.test(firstRowText)) {
        return "unsubmitted";
      }

      if (/\bSubmitted\b/i.test(firstRowText)) {
        return "submitted";
      }
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
