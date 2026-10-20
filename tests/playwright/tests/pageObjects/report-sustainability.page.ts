import { type Locator, type Page } from "@playwright/test";
import { ReportEditorPage } from "./report-editor.page";
import { TIMEOUT_LOADING } from "../../utils/timeouts";

export const SUCCESS_STORIES_LABEL = /success stories/i;
export const SUSTAINABILITY_PLANNING_LABEL = /sustainability plan/i;

export type SustainabilityFieldEditability = {
  successStories: boolean;
  sustainabilityPlanning: boolean;
};

export type SustainabilityFieldValues = {
  successStories: string;
  sustainabilityPlan: string;
};

export class ReportSustainabilityPage extends ReportEditorPage {
  constructor(page: Page) {
    super(page);
  }

  get successStoriesHeading(): Locator {
    return this.page.getByText("Success Stories", { exact: true });
  }

  get sustainabilityPlanningHeading(): Locator {
    return this.page.getByText("Sustainability Planning", { exact: true });
  }

  get successStoriesField(): Locator {
    return this.getTextField(SUCCESS_STORIES_LABEL);
  }

  get sustainabilityPlanningField(): Locator {
    return this.getTextField(SUSTAINABILITY_PLANNING_LABEL);
  }

  async getFieldEditability(): Promise<SustainabilityFieldEditability> {
    await Promise.all([
      this.successStoriesField.waitFor({
        state: "visible",
        timeout: TIMEOUT_LOADING,
      }),
      this.sustainabilityPlanningField.waitFor({
        state: "visible",
        timeout: TIMEOUT_LOADING,
      }),
    ]);

    const [successStories, sustainabilityPlanning] = await Promise.all([
      this.successStoriesField.isEnabled(),
      this.sustainabilityPlanningField.isEnabled(),
    ]);

    return { successStories, sustainabilityPlanning };
  }

  fillSuccessStories(value: string): Promise<void> {
    return this.fillTextField(SUCCESS_STORIES_LABEL, value);
  }

  fillSustainabilityPlanning(value: string): Promise<void> {
    return this.fillTextField(SUSTAINABILITY_PLANNING_LABEL, value);
  }

  async fillEditableFields(
    values: SustainabilityFieldValues,
    fields: SustainabilityFieldEditability
  ): Promise<void> {
    if (!fields.successStories && !fields.sustainabilityPlanning) {
      return;
    }

    if (fields.successStories) {
      await this.fillSuccessStories(values.successStories);
    }
    if (fields.sustainabilityPlanning) {
      await this.fillSustainabilityPlanning(values.sustainabilityPlan);
    }

    const saveResponse = this.waitForSaveResponse();
    await this.page.keyboard.press("Tab");
    await saveResponse;
  }
}
