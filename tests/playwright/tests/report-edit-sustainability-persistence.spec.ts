import { test, expect } from "./fixtures/base";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import { verifyReportSectionShell } from "../utils/report-edit-assertions";
import {
  createArtifactId,
  GENERAL_INFORMATION_SECTION,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
} from "../utils/report-edit-shared-helpers";
import {
  ReportSustainabilityPage,
  type SustainabilityFieldEditability,
  type SustainabilityFieldValues,
} from "./pageObjects/report-sustainability.page";
import { SUSTAINABILITY_TEST_DATA } from "../utils/report-edit-submission-helpers";

type SustainabilityEditorSetup = {
  editor: ReportSustainabilityPage;
  fields: SustainabilityFieldEditability;
};

const openSustainabilityEditor = async (
  statePage: Parameters<typeof openReportSectionOrSkip>[0]
): Promise<SustainabilityEditorSetup | undefined> => {
  const reportEditor = await openReportSectionOrSkip(
    statePage,
    "unsubmitted",
    SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
    (reason) => test.skip(true, reason)
  );
  if (!reportEditor) {
    return undefined;
  }

  const editor = new ReportSustainabilityPage(reportEditor.page);
  const fields = await editor.getFieldEditability();

  if (!fields.successStories && !fields.sustainabilityPlanning) {
    test.skip(
      true,
      "No editable Sustainability and Highlights fields available"
    );
    return undefined;
  }

  return { editor, fields };
};

const createSustainabilityValues = (): SustainabilityFieldValues => {
  const runId = createArtifactId();
  return {
    successStories: `${SUSTAINABILITY_TEST_DATA.successStories} ${runId}`,
    sustainabilityPlan: `${SUSTAINABILITY_TEST_DATA.sustainabilityPlan} ${runId}`,
  };
};

test.describe("Report Editing - Sustainability Persistence", () => {
  test("should fill Sustainability and Highlights text areas", async ({
    statePage,
  }) => {
    const setup = await openSustainabilityEditor(statePage);
    if (!setup) {
      return;
    }
    const { editor, fields } = setup;
    const values = createSustainabilityValues();

    await verifyReportSectionShell(editor, {
      sectionId: SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
      heading: "Sustainability and Highlights",
      previousButtonVisibility: "visible",
      continueButtonVisibility: "visible",
    });
    await expect(editor.successStoriesHeading).toBeVisible();
    await expect(editor.sustainabilityPlanningHeading).toBeVisible();
    await editor.fillEditableFields(values, fields);

    if (fields.successStories) {
      await expect(editor.successStoriesField).toHaveValue(
        values.successStories
      );
    }
    if (fields.sustainabilityPlanning) {
      await expect(editor.sustainabilityPlanningField).toHaveValue(
        values.sustainabilityPlan
      );
    }
  });

  test("should update autosave indicator when editing Sustainability and Highlights @regression", async ({
    statePage,
  }) => {
    const setup = await openSustainabilityEditor(statePage);
    if (!setup) {
      return;
    }
    const { editor, fields } = setup;
    const values = createSustainabilityValues();

    await expect(editor.saveStatusText).toBeHidden();
    await editor.fillEditableFields(values, fields);

    await editor.expectAutosaveIndicator();
  });

  test("should edit text fields in Sustainability and Highlights and verify persistence @regression", async ({
    statePage,
  }) => {
    const setup = await openSustainabilityEditor(statePage);
    if (!setup) {
      return;
    }
    const { editor, fields } = setup;
    const values = createSustainabilityValues();
    const { reportType, state, reportId } = editor.getCurrentRouteParams();

    await editor.fillEditableFields(values, fields);

    await editor.navigateToSectionAndBack(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );

    if (fields.successStories) {
      await expect(editor.successStoriesField).toHaveValue(
        values.successStories
      );
    }
    if (fields.sustainabilityPlanning) {
      await expect(editor.sustainabilityPlanningField).toHaveValue(
        values.sustainabilityPlan
      );
    }
  });
});
