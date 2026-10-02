import { type Locator, type Page } from "@playwright/test";
import { ReportEditorPage } from "./report-editor.page";
import { TIMEOUT_UI } from "../../utils/timeouts";

export type InitiativeMetricData = {
  name: string;
  targetInput: string;
  currentInput: string;
  date: string;
};

export const CHECKPOINT_STAGE_LABELS = [
  "Stage 0: Planning",
  "Stage 1: Project Preparation",
  "Stage 2: Early Implementation",
  "Stage 3: Midway Implementation",
  "Stage 4: Preparing for Completion",
  "Stage 5: Full Implementation",
];

export const GOVERNANCE_CHECKPOINT = /Establish governance/i;

const createAttachmentButtonNames = (prefix: string) => ({
  prefix: new RegExp(`^${prefix}`, "i"),
  exact: (fileName: string) => `${prefix}${fileName}`,
});

export const INITIATIVE_UI_NAMES = {
  rowPattern: /^\d+:\s*.+/,
  button: {
    addInitiative: /^Add initiative$/i,
    addMetric: /^Add Metric$/i,
    editOrAbandonMetric: /^Edit\/Abandon$/i,
    save: /^Save$/i,
    saveChanges: /^Save changes$/i,
    uploadAttachments: /^Upload attachments$/i,
    close: /^Close$/i,
    backToInitiatives: "Back to Initiatives",
    done: /^Done$/i,
    deleteAttachment: /^Delete attachment$/i,
    addComment: /^Add comment$/i,
    editOrView: /^(Edit|View)\b/i,
    edit: /^Edit\b/i,
    manageAttachment: createAttachmentButtonNames("Manage file or info for "),
    commentAttachment: createAttachmentButtonNames("Comment on "),
  },
  field: {
    narrative: /^Narrative/i,
    peopleServed: /Number of people served/i,
    narrativeRequired: /^NarrativeRequired$/i,
    peopleServedRequired: /^Number of people servedRequired$/i,
    metricName: /^Metric name/i,
    metricTarget: /^What is the target for this metric/i,
    metricCurrentValue: /^What is the metric['’]s current value/i,
    metricDate: /^Date of the current value/i,
    initiativeNumber: /^Initiative Number$/i,
    initiativeName: /^Initiative Name$/i,
    comment: /^Comment$/i,
  },
  heading: {
    metrics: /^Track Initiative Performance Metrics\s*Required$/i,
    checkpoints: /^Checkpoints$/i,
    editMetric: /^Edit Metric$/i,
    uploadStatus: /^Upload Status$/i,
    uploadInitiativeAttachments: /Upload Initiative Attachments/i,
    manageAttachment: /^Manage Attachment$/i,
    addCommentToAttachment: /^Add comment to attachment$/i,
    addInitiative: /^Add Initiative$/i,
  },
  column: {
    number: "#",
    status: "Status",
    target: "Target",
    metric: "Metric",
    previousAnnualValue: "Previous annual value",
    currentValue: "Current value",
    currentValueDate: "As of Date MM/DD/YYYY",
    initiative: "Initiative",
    actions: "Actions",
    checkpoint: "Checkpoint",
    readiness: "Ready for CMS Review",
    attachments: "Attachments",
  },
  status: {
    activeOrAbandoned: /^(Active|Abandoned)$/i,
    abandoned: /^Abandoned$/i,
    initiativeRow: /^Status: (Minimum requirements (not )?met|Abandoned)$/i,
    checkpoint:
      /^(Pending Review|Needs Revision|Locked for Scoring|Informational|Archived)$/i,
  },
  label: {
    currentStatus: /Current status/i,
    optionalStatus: /Status\s*\(optional\)/i,
    checkpoint: /Which stage\/checkpoint does this attachment apply to\?/i,
    status: /^Status$/i,
  },
  selector: {
    checkpoint: 'select[name="checkpoint"]',
  },
} as const;

export class ReportInitiativePage extends ReportEditorPage {
  constructor(page: Page) {
    super(page);
  }

  private get dialog(): Locator {
    return this.page.getByRole("dialog");
  }

  get addMetricButton(): Locator {
    return this.page.getByRole("button", {
      name: INITIATIVE_UI_NAMES.button.addMetric,
    });
  }

  get metricsHeading(): Locator {
    return this.page.getByRole("heading", {
      name: INITIATIVE_UI_NAMES.heading.metrics,
    });
  }

  get checkpointsHeading(): Locator {
    return this.page.getByRole("heading", {
      name: INITIATIVE_UI_NAMES.heading.checkpoints,
    });
  }

  get narrativeField(): Locator {
    return this.page.getByRole("textbox", {
      name: INITIATIVE_UI_NAMES.field.narrative,
    });
  }

  get narrativeRequiredLabel(): Locator {
    return this.page
      .locator("label")
      .filter({ hasText: INITIATIVE_UI_NAMES.field.narrativeRequired });
  }

  get peopleServedField(): Locator {
    return this.page.getByRole("textbox", {
      name: INITIATIVE_UI_NAMES.field.peopleServed,
    });
  }

  get peopleServedRequiredLabel(): Locator {
    return this.page
      .locator("label")
      .filter({ hasText: INITIATIVE_UI_NAMES.field.peopleServedRequired });
  }

  get metricsTable(): Locator {
    return this.page.getByRole("table").filter({
      has: this.page.getByRole("columnheader", {
        name: INITIATIVE_UI_NAMES.column.metric,
      }),
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
    await this.addMetricButton.click();
    await this.dialog.waitFor({ state: "visible", timeout: TIMEOUT_UI });
    await this.fillTextField(INITIATIVE_UI_NAMES.field.metricName, metric.name);
    await this.fillTextField(
      INITIATIVE_UI_NAMES.field.metricTarget,
      metric.targetInput
    );
    await this.fillTextField(
      INITIATIVE_UI_NAMES.field.metricCurrentValue,
      metric.currentInput
    );
    await this.fillTextField(INITIATIVE_UI_NAMES.field.metricDate, metric.date);
    await this.dialog
      .getByRole("button", { name: INITIATIVE_UI_NAMES.button.save })
      .click();
    await this.dialog.waitFor({ state: "hidden", timeout: TIMEOUT_UI });
  }

  async editMetric(row: Locator, metric: InitiativeMetricData): Promise<void> {
    await row
      .getByRole("button", {
        name: INITIATIVE_UI_NAMES.button.editOrAbandonMetric,
      })
      .click();
    const dialog = this.dialog;
    await dialog.waitFor({ state: "visible", timeout: TIMEOUT_UI });
    await dialog
      .getByRole("heading", { name: INITIATIVE_UI_NAMES.heading.editMetric })
      .waitFor({ state: "visible", timeout: TIMEOUT_UI });
    await this.fillTextField(INITIATIVE_UI_NAMES.field.metricName, metric.name);
    await this.fillTextField(
      INITIATIVE_UI_NAMES.field.metricTarget,
      metric.targetInput
    );
    await this.fillTextField(
      INITIATIVE_UI_NAMES.field.metricCurrentValue,
      metric.currentInput
    );
    await this.fillTextField(INITIATIVE_UI_NAMES.field.metricDate, metric.date);
    await dialog
      .getByRole("button", { name: INITIATIVE_UI_NAMES.button.save })
      .click();
    await dialog.waitFor({ state: "hidden", timeout: TIMEOUT_UI });
  }

  async abandonMetric(row: Locator): Promise<void> {
    await row
      .getByRole("button", {
        name: INITIATIVE_UI_NAMES.button.editOrAbandonMetric,
      })
      .click();
    const dialog = this.dialog;
    await dialog.waitFor({ state: "visible", timeout: TIMEOUT_UI });
    await dialog
      .getByRole("heading", { name: INITIATIVE_UI_NAMES.heading.editMetric })
      .waitFor({ state: "visible", timeout: TIMEOUT_UI });

    const statusDropdown = dialog.getByLabel(INITIATIVE_UI_NAMES.label.status);
    await statusDropdown.click();
    const abandonedOption = this.page.getByRole("option", {
      name: INITIATIVE_UI_NAMES.status.abandoned,
    });
    await abandonedOption.waitFor({ state: "visible", timeout: TIMEOUT_UI });
    await abandonedOption.click();
    await dialog
      .getByRole("button", { name: INITIATIVE_UI_NAMES.button.save })
      .click();
    await dialog.waitFor({ state: "hidden", timeout: TIMEOUT_UI });
  }

  get initiativesTable(): Locator {
    return this.page.getByRole("table").filter({
      has: this.page.getByRole("columnheader", {
        name: INITIATIVE_UI_NAMES.column.initiative,
      }),
    });
  }

  get openInitiativeHeading(): Locator {
    return this.page
      .getByRole("heading", { name: INITIATIVE_UI_NAMES.rowPattern })
      .first();
  }

  checkpointStage(stageLabel: string): Locator {
    const label = this.page.getByText(stageLabel, { exact: true });
    return label.locator("..").filter({
      has: this.page.getByRole("button", {
        name: INITIATIVE_UI_NAMES.button.uploadAttachments,
      }),
    });
  }

  checkpointTable(stageLabel: string): Locator {
    return this.checkpointStage(stageLabel)
      .getByRole("table")
      .filter({
        has: this.page.getByRole("columnheader", {
          name: INITIATIVE_UI_NAMES.column.checkpoint,
        }),
      });
  }

  checkpointRow(stageLabel: string, checkpointName: string | RegExp): Locator {
    return this.checkpointTable(stageLabel)
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

  async openEditableInitiativeFromTable(
    table: Locator = this.initiativesTable
  ): Promise<string> {
    const editableRows = table
      .locator("tbody")
      .getByRole("row")
      .filter({ hasText: INITIATIVE_UI_NAMES.rowPattern })
      .filter({
        has: this.page.getByRole("link", {
          name: INITIATIVE_UI_NAMES.button.edit,
        }),
      });
    const row = editableRows.first();
    await row.waitFor({ state: "visible", timeout: TIMEOUT_UI });

    const nameLocator = row.getByText(INITIATIVE_UI_NAMES.rowPattern).first();
    const name = ((await nameLocator.textContent()) ?? "").trim();

    const editButton = row.getByRole("link", {
      name: INITIATIVE_UI_NAMES.button.edit,
    });
    await Promise.all([
      this.page.waitForURL(/\/report\/[^/]+\/[^/]+\/[^/]+\/[^/?#]+(\?.*)?$/, {
        timeout: TIMEOUT_UI,
      }),
      editButton.click(),
    ]);

    return name;
  }

  async openCheckpointUploadDrawer(stageLabel: string): Promise<Locator> {
    await this.checkpointStage(stageLabel)
      .getByRole("button", {
        name: INITIATIVE_UI_NAMES.button.uploadAttachments,
      })
      .click();
    await this.dialog.waitFor({ state: "visible", timeout: TIMEOUT_UI });
    return this.dialog;
  }

  async selectCheckpoint(
    drawer: Locator,
    checkpointName: string | RegExp
  ): Promise<void> {
    const dropdown = drawer
      .locator(INITIATIVE_UI_NAMES.selector.checkpoint)
      .first();
    await dropdown.waitFor({ state: "visible", timeout: TIMEOUT_UI });

    const options = dropdown.locator("option").filter({
      hasText: checkpointName,
    });
    await options.first().waitFor({ state: "attached", timeout: TIMEOUT_UI });

    const optionCount = await options.count();
    if (optionCount !== 1) {
      throw new Error(
        `Expected one checkpoint matching "${checkpointName}", found ${optionCount}`
      );
    }

    const value = await options.first().getAttribute("value");
    if (!value) {
      throw new Error(`Checkpoint "${checkpointName}" has no option value`);
    }

    await dropdown.selectOption({ value });
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
    await fileInput.waitFor({ state: "attached", timeout: TIMEOUT_UI });
    await fileInput.setInputFiles(filePath);
    await drawer
      .getByRole("heading", { name: INITIATIVE_UI_NAMES.heading.uploadStatus })
      .waitFor({ state: "visible", timeout: TIMEOUT_UI });
    await drawer
      .getByText(fileName, { exact: true })
      .waitFor({ state: "visible", timeout: TIMEOUT_UI });

    await drawer
      .getByRole("button", { name: INITIATIVE_UI_NAMES.button.done })
      .click();
    await drawer.waitFor({ state: "hidden", timeout: TIMEOUT_UI });

    const attachmentRow = this.checkpointAttachmentRow(stageLabel, fileName);
    return attachmentRow;
  }

  manageAttachmentButton(row: Locator, fileName: string): Locator {
    return row.getByRole("button", {
      name: INITIATIVE_UI_NAMES.button.manageAttachment.exact(fileName),
      exact: true,
    });
  }

  commentAttachmentButton(row: Locator, fileName: string): Locator {
    return row.getByRole("button", {
      name: INITIATIVE_UI_NAMES.button.commentAttachment.exact(fileName),
      exact: true,
    });
  }

  async openManageAttachment(row: Locator, fileName: string): Promise<Locator> {
    const button = this.manageAttachmentButton(row, fileName);
    await button.waitFor({ state: "visible", timeout: TIMEOUT_UI });
    await button.click();
    await this.dialog
      .getByRole("heading", {
        name: INITIATIVE_UI_NAMES.heading.manageAttachment,
      })
      .waitFor({ state: "visible", timeout: TIMEOUT_UI });
    return this.dialog;
  }

  async openCommentDrawer(row: Locator, fileName: string): Promise<Locator> {
    const button = this.commentAttachmentButton(row, fileName);
    await button.waitFor({ state: "visible", timeout: TIMEOUT_UI });
    await button.click();
    await this.dialog
      .getByRole("heading", {
        name: INITIATIVE_UI_NAMES.heading.addCommentToAttachment,
      })
      .waitFor({ state: "visible", timeout: TIMEOUT_UI });
    return this.dialog;
  }

  async closeDrawer(drawer: Locator): Promise<void> {
    await drawer
      .getByRole("contentinfo")
      .getByRole("button", { name: INITIATIVE_UI_NAMES.button.close })
      .click();
    await drawer.waitFor({ state: "hidden", timeout: TIMEOUT_UI });
  }

  async returnToInitiativesDashboard(): Promise<void> {
    const backButton = this.page.getByRole("button", {
      name: INITIATIVE_UI_NAMES.button.backToInitiatives,
    });
    await backButton.waitFor({ state: "visible", timeout: TIMEOUT_UI });
    await Promise.all([
      this.page.waitForURL(
        /\/report\/[^/]+\/[^/]+\/[^/]+\/initiatives(?:\?.*)?$/
      ),
      backButton.click(),
    ]);
  }
}
