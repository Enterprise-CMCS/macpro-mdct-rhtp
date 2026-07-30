import { test, expect } from "./fixtures/base";
import { TIMEOUT_UI } from "../utils/timeouts";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  GENERAL_INFORMATION_SECTION,
  INITIATIVES_SECTION,
} from "../utils/report-edit-helpers";
import { verifyCurrentSection } from "../utils/report-edit-assertions";

test.describe("Report Editing - Initiatives Persistence", () => {
  test("should add an initiative and persist it across section navigation @regression", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      INITIATIVES_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    await verifyCurrentSection(editor, INITIATIVES_SECTION);

    const addInitiativeButton = editor.page.getByRole("button", {
      name: /^Add initiative$/i,
    });
    const canAddInitiative = await addInitiativeButton
      .isVisible()
      .catch(() => false);
    if (!canAddInitiative) {
      test.skip(true, "Add initiative action is not available for this user");
      return;
    }

    const uniqueSuffix = `${Date.now()}`;
    const initiativeNumber = uniqueSuffix.slice(-6);
    const initiativeName = `Initiative ${uniqueSuffix}`;
    const expectedDisplayName = `${initiativeNumber}: ${initiativeName}`;

    // Act
    await addInitiativeButton.click();

    const initiativeModal = editor.page.getByRole("dialog");
    await expect(initiativeModal).toBeVisible({ timeout: TIMEOUT_UI });
    await expect(
      initiativeModal.getByRole("heading", { name: /^Add Initiative$/i })
    ).toBeVisible({ timeout: TIMEOUT_UI });

    await initiativeModal
      .getByRole("textbox", { name: /^Initiative Number$/i })
      .fill(initiativeNumber);
    await initiativeModal
      .getByRole("textbox", { name: /^Initiative Name$/i })
      .fill(initiativeName);

    await initiativeModal.getByRole("button", { name: /^Save$/i }).click();
    await expect(initiativeModal).toBeHidden({ timeout: TIMEOUT_UI });

    await expect(
      editor.page.getByText(expectedDisplayName).first()
    ).toBeVisible({
      timeout: TIMEOUT_UI,
    });

    const { reportType, state, reportId } = editor.getCurrentRouteParams();

    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION
    );
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      INITIATIVES_SECTION
    );

    // Assert
    await verifyCurrentSection(editor, INITIATIVES_SECTION);
    await expect(
      editor.page.getByText(expectedDisplayName).first()
    ).toBeVisible({
      timeout: TIMEOUT_UI,
    });
  });
});
