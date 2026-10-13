import { test, expect, type Locator } from "./fixtures/base";
import {
  openEditableReportSectionForPeriodOrSkip,
  openReportSectionOrSkip,
} from "../utils/report-edit-arrange";
import {
  createRunScopedInitiativeValues,
  INITIATIVES_SECTION,
  INITIATIVE_ATTACHMENTS_SECTION,
  GENERAL_INFORMATION_SECTION,
} from "../utils/report-edit-shared-helpers";
import {
  skipIfUnavailable,
  verifyCurrentSection,
  verifyReportSectionShell,
} from "../utils/report-edit-assertions";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import type { ReportPeriod } from "./pageObjects/dashboard.page";
import { INITIATIVE_UI_NAMES } from "./pageObjects/report-initiative.page";
import { TIMEOUT_UI } from "../utils/timeouts";

const getStatusIcon = (row: Locator): Locator => row.getByRole("img");

const getStatusText = (row: Locator): Locator =>
  row.getByText(INITIATIVE_UI_NAMES.status.initiativeRow);

const getInitiativeName = (row: Locator): Locator =>
  row.getByRole("cell").filter({
    hasText: INITIATIVE_UI_NAMES.rowPattern,
  });

const getInitiativeRows = (table: Locator): Locator =>
  table.getByRole("row").filter({
    hasText: INITIATIVE_UI_NAMES.rowPattern,
  });

const getEditButton = (row: Locator): Locator =>
  row.getByRole("link", { name: INITIATIVE_UI_NAMES.button.editOrView });

const verifyInitiativesTableHeaders = async (table: Locator): Promise<void> => {
  await expect(
    table.getByRole("columnheader", {
      name: INITIATIVE_UI_NAMES.column.status,
    })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", {
      name: INITIATIVE_UI_NAMES.column.initiative,
    })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", {
      name: INITIATIVE_UI_NAMES.column.actions,
    })
  ).toBeVisible();
};

const waitForInitiativeRows = async (table: Locator, timeout: number) => {
  await expect
    .poll(() => getInitiativeRows(table).count(), { timeout })
    .toBeGreaterThan(0);

  return getInitiativeRows(table);
};

const openInitiativesEditor = async (
  statePage: Parameters<typeof openReportSectionOrSkip>[0],
  period?: ReportPeriod
): Promise<ReportEditorPage> => {
  const skip = (reason: string) => test.skip(true, reason);
  const result = period
    ? await openEditableReportSectionForPeriodOrSkip(
        statePage,
        period,
        INITIATIVES_SECTION,
        skip
      )
    : await openReportSectionOrSkip(
        statePage,
        "unsubmitted",
        INITIATIVES_SECTION,
        skip
      );

  if (!result) {
    throw new Error(
      "openInitiativesEditor returned undefined without skipping the test"
    );
  }

  return result;
};

test.describe("Report Editing - Initiatives", () => {
  test.describe("Shared behavior", () => {
    test("should have the correct URL, heading, and navigation buttons @regression", async ({
      statePage,
    }) => {
      const editor = await openInitiativesEditor(statePage);
      await verifyReportSectionShell(editor, {
        sectionId: INITIATIVES_SECTION,
        heading: /^Initiatives$/i,
        previousButtonVisibility: "visible",
        continueButtonVisibility: "visible",
      });
    });

    test("should navigate into an initiative when Edit is clicked @regression", async ({
      statePage,
    }) => {
      const editor = await openInitiativesEditor(statePage);
      const table = editor.page.getByRole("table");
      const dataRows = await waitForInitiativeRows(table, TIMEOUT_UI);

      const editButton = getEditButton(dataRows.first());
      await expect(editButton).toBeVisible({ timeout: TIMEOUT_UI });
      await editButton.click();

      // URL should move to an initiative sub-page, away from the initiatives list.
      await expect(editor.page).toHaveURL(
        /\/report\/[^/]+\/[^/]+\/[^/]+\/[^/?#]+(\?.*)?$/,
        {
          timeout: TIMEOUT_UI,
        }
      );
    });

    test("should add an initiative and persist it across section navigation @regression", async ({
      statePage,
    }) => {
      const editor = await openInitiativesEditor(statePage);
      const addInitiativeButton = editor.page.getByRole("button", {
        name: INITIATIVE_UI_NAMES.button.addInitiative,
      });
      const addInitiativeUnavailable = await skipIfUnavailable(
        () => addInitiativeButton.isVisible(),
        (reason) => test.skip(true, reason),
        "Add initiative action is not available for this user"
      );
      if (addInitiativeUnavailable) {
        return;
      }

      const { initiativeNumber, initiativeName, expectedDisplayName } =
        createRunScopedInitiativeValues("initiatives-persistence");

      await addInitiativeButton.click();

      const initiativeModal = editor.page.getByRole("dialog");
      await expect(initiativeModal).toBeVisible({ timeout: TIMEOUT_UI });
      await expect(
        initiativeModal.getByRole("heading", {
          name: INITIATIVE_UI_NAMES.heading.addInitiative,
        })
      ).toBeVisible({ timeout: TIMEOUT_UI });

      await initiativeModal
        .getByRole("textbox", {
          name: INITIATIVE_UI_NAMES.field.initiativeNumber,
        })
        .fill(initiativeNumber);
      await initiativeModal
        .getByRole("textbox", {
          name: INITIATIVE_UI_NAMES.field.initiativeName,
        })
        .fill(initiativeName);

      await initiativeModal
        .getByRole("button", { name: INITIATIVE_UI_NAMES.button.save })
        .click();
      await expect(initiativeModal).toBeHidden({ timeout: TIMEOUT_UI });
      await expect(
        editor.page.getByText(expectedDisplayName).first()
      ).toBeVisible({ timeout: TIMEOUT_UI });

      const { reportType, state, reportId } = editor.getCurrentRouteParams();
      await editor.navigateToSectionAndBack(
        reportType,
        state,
        reportId,
        GENERAL_INFORMATION_SECTION,
        INITIATIVES_SECTION
      );

      await verifyCurrentSection(editor, INITIATIVES_SECTION);
      await expect(
        editor.page.getByText(expectedDisplayName).first()
      ).toBeVisible({ timeout: TIMEOUT_UI });
    });

    test("should navigate to the previous section when Previous is clicked @regression", async ({
      statePage,
    }) => {
      const editor = await openInitiativesEditor(statePage);
      await editor.clickPrevious();
      await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    });

    test("should navigate to the next section when Continue is clicked @regression", async ({
      statePage,
    }) => {
      const editor = await openInitiativesEditor(statePage);
      await editor.clickContinue();
      await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);
    });
  });

  test.describe("Annual Initiatives Table", () => {
    test("should display the annual initiatives table @regression", async ({
      statePage,
    }) => {
      const editor = await openInitiativesEditor(statePage, "annual");
      const table = editor.page.getByRole("table");
      await expect(table).toBeVisible();
      await verifyInitiativesTableHeaders(table);
    });

    test("should display annual name, status icon, status text, and Edit CTA for each initiative @regression", async ({
      statePage,
    }) => {
      const editor = await openInitiativesEditor(statePage, "annual");
      const table = editor.page.getByRole("table");
      await expect(table).toBeVisible({ timeout: TIMEOUT_UI });

      const dataRows = await waitForInitiativeRows(table, TIMEOUT_UI);
      const rowCount = await dataRows.count();

      for (let index = 0; index < rowCount; index += 1) {
        const row = dataRows.nth(index);
        const statusText = getStatusText(row);
        await expect(getInitiativeName(row)).toBeVisible();
        await expect(statusText).toBeVisible();

        const statusValue = (await statusText.textContent())?.trim() ?? "";
        if (/Abandoned/i.test(statusValue)) {
          await expect(getStatusIcon(row)).toHaveCount(0);
        } else {
          await expect(getStatusIcon(row)).toBeVisible();
        }

        await expect(getEditButton(row)).toBeVisible();
      }
    });
  });

  test.describe("Quarterly Initiatives Table", () => {
    const period: ReportPeriod = "quarterly";

    test("should display initiative names and actions without annual status UI @regression", async ({
      statePage,
    }) => {
      const editor = await openInitiativesEditor(statePage, period);
      const table = editor.page.getByRole("table");
      await expect(table).toBeVisible({ timeout: TIMEOUT_UI });
      await expect(table.getByRole("columnheader")).toHaveText([
        INITIATIVE_UI_NAMES.column.initiative,
        INITIATIVE_UI_NAMES.column.actions,
      ]);

      const dataRows = await waitForInitiativeRows(table, TIMEOUT_UI);
      const rowCount = await dataRows.count();

      for (let index = 0; index < rowCount; index += 1) {
        const row = dataRows.nth(index);
        await expect(getInitiativeName(row)).toBeVisible();
        await expect(getStatusText(row)).toHaveCount(0);
        await expect(getEditButton(row)).toBeVisible();
      }
    });
  });
});
