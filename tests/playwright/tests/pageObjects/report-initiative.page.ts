import { expect, type Locator, type Page } from "@playwright/test";
import { ReportEditorPage } from "./report-editor.page";
import { INITIATIVES_SECTION } from "../../utils/report-edit-shared-helpers";
import { TIMEOUT_UI } from "../../utils/timeouts";

export type ReportPeriod = "annual" | "quarterly";

export type InitiativeMetricData = {
  name: string;
  targetInput: string;
  currentInput: string;
  date: string;
};

const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  annual: "Annual Report",
  quarterly: "Quarterly Report",
} as const;

const INITIATIVE_ROW_PATTERN = /^\d+:\s*.+/;
const EDITABLE_STATUS_PATTERN = /^(Not started|In progress|In revision)$/i;
const ADD_METRIC_BUTTON_NAME = /^Add Metric$/i;
const EDIT_OR_ABANDON_BUTTON_NAME = /^Edit\/Abandon$/i;
const SAVE_BUTTON_NAME = /^Save$/i;
const UPLOAD_ATTACHMENTS_BUTTON_NAME = /^Upload attachments$/i;
const CLOSE_BUTTON_NAME = /^Close$/i;
const BACK_TO_INITIATIVES_TEXT = "Back to Initiatives";

export class ReportInitiativePage extends ReportEditorPage {
  constructor(page: Page) {
    super(page);
  }

  private get dialog(): Locator {
    return this.page.getByRole("dialog");
  }

  get addMetricButton(): Locator {
    return this.page.getByRole("button", { name: ADD_METRIC_BUTTON_NAME });
  }

  get metricsHeading(): Locator {
    return this.page.getByRole("heading", {
      name: /^Track Initiative Performance Metrics\s*Required$/i,
    });
  }

  get checkpointsHeading(): Locator {
    return this.page.getByRole("heading", { name: /^Checkpoints$/i });
  }

  get narrativeField(): Locator {
    return this.page.getByRole("textbox", { name: /^Narrative/i });
  }

  get narrativeRequiredLabel(): Locator {
    return this.page
      .locator("label")
      .filter({ hasText: /^NarrativeRequired$/i });
  }

  get peopleServedField(): Locator {
    return this.page.getByRole("textbox", {
      name: /Number of people served/i,
    });
  }

  get peopleServedRequiredLabel(): Locator {
    return this.page
      .locator("label")
      .filter({ hasText: /^Number of people servedRequired$/i });
  }

  get initiativesDashboardTable(): Locator {
    return this.page.getByRole("table").filter({
      has: this.page.getByRole("columnheader", { name: "Initiative" }),
    });
  }

  get metricsTable(): Locator {
    return this.page.getByRole("table").filter({
      has: this.page.getByRole("columnheader", { name: "Metric" }),
    });
  }

  metricRow(metricName: string): Locator {
    return this.metricsTable
      .locator("tbody")
      .getByRole("row")
      .filter({ hasText: metricName })
      .first();
  }

  checkpointReadinessCheckbox(
    stageLabel: string,
    checkpointName: string | RegExp
  ): Locator {
    return this.checkpointRow(stageLabel, checkpointName).getByRole("checkbox");
  }

  async addMetric(metric: InitiativeMetricData): Promise<void> {
    await expect(this.addMetricButton).toBeVisible({ timeout: TIMEOUT_UI });
    await this.addMetricButton.click();

    await expect(this.dialog).toBeVisible({ timeout: TIMEOUT_UI });
    await this.fillTextField(/^Metric name/i, metric.name);
    await this.fillTextField(
      /^What is the target for this metric/i,
      metric.targetInput
    );
    await this.fillTextField(
      /^What is the metric['’]s current value/i,
      metric.currentInput
    );
    await this.fillTextField(/^Date of the current value/i, metric.date);
    await this.dialog.getByRole("button", { name: SAVE_BUTTON_NAME }).click();
    await expect(this.dialog).toBeHidden({ timeout: TIMEOUT_UI });
  }

  async editMetric(row: Locator, metric: InitiativeMetricData): Promise<void> {
    await row
      .getByRole("button", { name: EDIT_OR_ABANDON_BUTTON_NAME })
      .click();
    await expect(
      this.dialog.getByRole("heading", { name: /^Edit Metric$/i })
    ).toBeVisible({ timeout: TIMEOUT_UI });
    await this.fillTextField(/^Metric name/i, metric.name);
    await this.fillTextField(
      /^What is the target for this metric/i,
      metric.targetInput
    );
    await this.fillTextField(
      /^What is the metric['’]s current value/i,
      metric.currentInput
    );
    await this.fillTextField(/^Date of the current value/i, metric.date);
    await this.dialog.getByRole("button", { name: SAVE_BUTTON_NAME }).click();
    await expect(this.dialog).toBeHidden({ timeout: TIMEOUT_UI });
  }

  async abandonMetric(row: Locator): Promise<void> {
    await row
      .getByRole("button", { name: EDIT_OR_ABANDON_BUTTON_NAME })
      .click();
    await expect(
      this.dialog.getByRole("heading", { name: /^Edit Metric$/i })
    ).toBeVisible({ timeout: TIMEOUT_UI });

    const statusDropdown = this.dialog.getByLabel(/^Status$/i);
    await statusDropdown.click();
    const abandonedOption = this.page.getByRole("option", {
      name: /^Abandoned$/i,
    });
    await expect(abandonedOption).toBeVisible({ timeout: TIMEOUT_UI });
    await abandonedOption.click();
    await expect(statusDropdown).toHaveText(/^Abandoned$/i);
    await this.dialog.getByRole("button", { name: SAVE_BUTTON_NAME }).click();
    await expect(this.dialog).toBeHidden({ timeout: TIMEOUT_UI });
  }

  get initiativesTable(): Locator {
    return this.page.getByRole("table").filter({
      has: this.page.getByRole("columnheader", { name: "Initiative" }),
    });
  }

  get openInitiativeHeading(): Locator {
    return this.page
      .getByRole("heading", { name: INITIATIVE_ROW_PATTERN })
      .first();
  }

  checkpointStage(stageLabel: string): Locator {
    const label = this.page.getByText(stageLabel, { exact: true });
    return label.locator("..").filter({
      has: this.page.getByRole("button", {
        name: /^Upload attachments$/i,
      }),
    });
  }

  checkpointTable(stageLabel: string): Locator {
    return this.checkpointStage(stageLabel)
      .getByRole("table")
      .filter({
        has: this.page.getByRole("columnheader", { name: /^Checkpoint$/i }),
      });
  }

  checkpointRow(stageLabel: string, checkpointName: string | RegExp): Locator {
    return this.checkpointTable(stageLabel)
      .locator("tbody")
      .getByRole("row")
      .filter({ hasText: checkpointName })
      .first();
  }

  checkpointRowInTable(
    table: Locator,
    checkpointName: string | RegExp
  ): Locator {
    return table
      .locator("tbody")
      .getByRole("row")
      .filter({ hasText: checkpointName })
      .first();
  }

  checkpointAttachmentRow(stageLabel: string, fileName: string): Locator {
    return this.checkpointTable(stageLabel)
      .locator("tbody")
      .getByRole("row")
      .filter({ hasText: fileName })
      .first();
  }

  async openInitiativeFromList(
    table: Locator = this.initiativesTable
  ): Promise<string> {
    const rows = table
      .locator("tbody")
      .getByRole("row")
      .filter({ hasText: INITIATIVE_ROW_PATTERN });
    await expect
      .poll(() => rows.count(), { timeout: TIMEOUT_UI })
      .toBeGreaterThan(0);

    const nonAbandonedRows = rows.filter({
      hasNotText: /Status:\s*Abandoned/i,
    });
    const row =
      (await nonAbandonedRows.count()) > 0
        ? nonAbandonedRows.first()
        : rows.first();
    const name = (
      (await row.getByText(INITIATIVE_ROW_PATTERN).first().textContent()) ?? ""
    ).trim();
    const editButton = row.getByRole("link", { name: /^(Edit|View)\b/i });
    await expect(editButton).toBeVisible({ timeout: TIMEOUT_UI });
    await editButton.click();
    await expect(this.page).toHaveURL(
      /\/report\/[^/]+\/[^/]+\/[^/]+\/[^/?#]+(\?.*)?$/,
      { timeout: TIMEOUT_UI }
    );

    return name;
  }

  async openReportFromDashboard(period: ReportPeriod): Promise<void> {
    const { reportType, state } = this.getCurrentRouteParams();
    await this.navigateTo(`/report/${reportType}/${state}`);
    await this.waitForLoadingComplete();

    const reportRow = this.page
      .getByRole("table")
      .getByRole("row")
      .filter({ hasText: REPORT_PERIOD_LABELS[period] })
      .filter({
        has: this.page.getByRole("cell", { name: EDITABLE_STATUS_PATTERN }),
      })
      .first();
    await expect(reportRow).toBeVisible({ timeout: TIMEOUT_UI });

    const openReportButton = reportRow
      .getByRole("button", { name: /View .* report/i })
      .first();
    await expect(openReportButton).toBeVisible({ timeout: TIMEOUT_UI });
    await Promise.all([
      this.page.waitForURL(
        /\/report\/[^/]+\/[^/]+\/[^/]+(?:\/[^/]+)?(?:[?#].*)?$/
      ),
      openReportButton.click(),
    ]);
    await this.waitForLoadingComplete();

    const {
      reportType: openedType,
      state: openedState,
      reportId,
    } = this.getCurrentRouteParams();
    await this.navigateToSection(
      openedType,
      openedState,
      reportId,
      INITIATIVES_SECTION
    );
  }

  async openCheckpointUploadDrawer(stageLabel: string): Promise<Locator> {
    await this.checkpointStage(stageLabel)
      .getByRole("button", { name: UPLOAD_ATTACHMENTS_BUTTON_NAME })
      .click();
    await expect(this.dialog).toBeVisible({ timeout: TIMEOUT_UI });
    return this.dialog;
  }

  async selectCheckpoint(
    drawer: Locator,
    checkpointName: string | RegExp
  ): Promise<void> {
    const dropdown = drawer.locator('select[name="checkpoint"]').first();
    await expect(dropdown).toBeAttached();
    await expect(dropdown).toBeEnabled();

    const option = dropdown.locator("option").filter({
      hasText: checkpointName,
    });
    await expect(option).toHaveCount(1, { timeout: TIMEOUT_UI });
    const value = await option.first().getAttribute("value");
    expect(value).toBeTruthy();
    await dropdown.selectOption({ value: value as string });
    await expect(dropdown).toHaveValue(/.+/);
  }

  async uploadCheckpointAttachment(
    stageLabel: string,
    checkpointName: string | RegExp,
    filePath: string,
    fileName: string
  ): Promise<Locator> {
    const drawer = await this.openCheckpointUploadDrawer(stageLabel);
    await this.selectCheckpoint(drawer, checkpointName);

    const fileInput = drawer.locator('input[type="file"]');
    await expect(fileInput).toBeEnabled();
    await fileInput.setInputFiles(filePath);
    await expect(
      drawer.getByRole("heading", { name: /^Upload Status$/i })
    ).toBeVisible({ timeout: TIMEOUT_UI });
    await expect(drawer.getByText(fileName, { exact: true })).toBeVisible({
      timeout: TIMEOUT_UI,
    });

    await drawer.getByRole("button", { name: /^Done$/i }).click();
    await expect(drawer).toBeHidden({ timeout: TIMEOUT_UI });

    const attachmentRow = this.checkpointAttachmentRow(stageLabel, fileName);
    await expect(attachmentRow).toContainText(fileName, {
      timeout: TIMEOUT_UI,
    });

    return attachmentRow;
  }

  manageAttachmentButton(row: Locator, fileName: string): Locator {
    return row.getByRole("button", {
      name: `Manage file or info for ${fileName}`,
      exact: true,
    });
  }

  commentAttachmentButton(row: Locator, fileName: string): Locator {
    return row.getByRole("button", {
      name: `Comment on ${fileName}`,
      exact: true,
    });
  }

  async openManageAttachment(row: Locator, fileName: string): Promise<Locator> {
    const button = this.manageAttachmentButton(row, fileName);
    await expect(button).toBeVisible({ timeout: TIMEOUT_UI });
    await button.click();
    await expect(
      this.dialog.getByRole("heading", { name: /^Manage Attachment$/i })
    ).toBeVisible({ timeout: TIMEOUT_UI });
    return this.dialog;
  }

  async openCommentDrawer(row: Locator, fileName: string): Promise<Locator> {
    const button = this.commentAttachmentButton(row, fileName);
    await expect(button).toBeVisible({ timeout: TIMEOUT_UI });
    await button.click();
    await expect(
      this.dialog.getByRole("heading", {
        name: /^Add comment to attachment$/i,
      })
    ).toBeVisible({ timeout: TIMEOUT_UI });
    return this.dialog;
  }

  async expectVisibleAnnualInitiativeFields(): Promise<void> {
    await expect(this.narrativeRequiredLabel).toBeVisible();
    await expect(this.narrativeField).toBeVisible();
    await expect(this.narrativeField).toHaveValue(/\S+/);
    await expect(this.narrativeField).toBeEditable();
    await expect(this.peopleServedRequiredLabel).toBeVisible();
    await expect(this.peopleServedField).toBeVisible();
    await expect(this.peopleServedField).toBeEditable();
  }

  async expectInitiativesDashboardVisible(): Promise<void> {
    await expect(this.initiativesDashboardTable).toBeVisible({
      timeout: TIMEOUT_UI,
    });
  }

  async closeDrawer(drawer: Locator): Promise<void> {
    await drawer
      .getByRole("contentinfo")
      .getByRole("button", { name: CLOSE_BUTTON_NAME })
      .click();
    await expect(drawer).toBeHidden({ timeout: TIMEOUT_UI });
  }

  async returnToInitiativesDashboard(): Promise<void> {
    const backButton = this.page.getByRole("button", {
      name: BACK_TO_INITIATIVES_TEXT,
    });
    await expect(backButton).toBeVisible({ timeout: TIMEOUT_UI });
    await Promise.all([
      this.page.waitForURL(
        /\/report\/[^/]+\/[^/]+\/[^/]+\/initiatives(?:\?.*)?$/
      ),
      backButton.click(),
    ]);
  }

  async reopenInitiativeFromDashboard(): Promise<string> {
    await expect(this.initiativesTable).toBeVisible({ timeout: TIMEOUT_UI });
    return this.openInitiativeFromList();
  }
}
