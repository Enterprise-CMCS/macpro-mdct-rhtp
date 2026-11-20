import { test, expect } from "./fixtures/report-fixtures";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import {
  AOR_NAME_LABEL,
  GENERAL_INFORMATION_SECTION,
} from "../utils/report-edit-shared-helpers";

test("state user and admin can open the same seeded A1", async ({
  annualReport,
  statePage,
  adminPage,
}) => {
  const { id, state } = annualReport;

  const stateEditor = new ReportEditorPage(statePage.page);
  await stateEditor.navigateToSection(
    "RHTP",
    state,
    id,
    GENERAL_INFORMATION_SECTION
  );
  await expect(stateEditor.getTextField(AOR_NAME_LABEL)).toBeEditable();

  const adminEditor = new ReportEditorPage(adminPage.page);
  await adminEditor.navigateToSection(
    "RHTP",
    state,
    id,
    GENERAL_INFORMATION_SECTION
  );
  await expect(adminEditor.getTextField(AOR_NAME_LABEL)).toBeVisible();
});

test.skip(
  process.env.E2E_SEED_TARGET !== "localstack",
  "Localstack opt-in only"
);
