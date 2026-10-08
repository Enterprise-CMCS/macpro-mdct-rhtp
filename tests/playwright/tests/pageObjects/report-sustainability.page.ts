import { type Locator, type Page } from "@playwright/test";
import { ReportEditorPage } from "./report-editor.page";

export const SUCCESS_STORIES_LABEL = /success stories/i;
export const SUSTAINABILITY_PLANNING_LABEL = /sustainability planning/i;

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

  fillSuccessStories(value: string): Promise<void> {
    return this.fillTextField(SUCCESS_STORIES_LABEL, value);
  }

  fillSustainabilityPlanning(value: string): Promise<void> {
    return this.fillTextField(SUSTAINABILITY_PLANNING_LABEL, value);
  }
}
