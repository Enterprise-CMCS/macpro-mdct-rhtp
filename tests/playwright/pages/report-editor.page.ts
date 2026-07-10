import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import { TIMEOUT_LOADING } from "../support/shared/timeouts";

export class ReportEditorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ===== URL Helpers =====

  /**
   * Extract report route params from the current URL.
   * Expects a URL matching /report/{type}/{state}/{reportId}/{pageId}
   */
  getCurrentRouteParams(): {
    reportType: string;
    state: string;
    reportId: string;
    pageId?: string;
  } {
    const url = this.page.url();
    const match = url.match(
      /\/report\/([^/?#]+)\/([^/?#]+)\/([^/?#]+)(?:\/([^/?#]+))?/
    );
    if (!match) throw new Error(`Cannot parse report route from URL: ${url}`);
    return {
      reportType: match[1],
      state: match[2],
      reportId: match[3],
      pageId: match[4],
    };
  }

  getCurrentSectionId(): string | undefined {
    return this.getCurrentRouteParams().pageId;
  }

  // ===== Navigation =====

  async navigateToSection(
    reportType: string,
    state: string,
    reportId: string,
    sectionId: string
  ): Promise<void> {
    await this.navigateTo(
      `/report/${reportType}/${state}/${reportId}/${sectionId}`
    );
    await this.waitForLoadingComplete();
  }

  private async clickSectionNavButton(button: Locator): Promise<void> {
    const fromSection = this.getCurrentSectionId();
    await Promise.all([
      this.page.waitForURL(
        (url) =>
          url.pathname.startsWith("/report/") &&
          this.getCurrentRouteParams().pageId !== fromSection,
        { timeout: TIMEOUT_LOADING }
      ),
      button.click(),
    ]);
    await this.waitForLoadingComplete();
  }

  async clickContinue(): Promise<void> {
    await this.clickSectionNavButton(this.continueButton);
  }

  async clickPrevious(): Promise<void> {
    await this.clickSectionNavButton(this.previousButton);
  }

  // ===== Locators =====

  getFieldByLabel(label: string | RegExp): Locator {
    return this.page.getByLabel(label);
  }

  get continueButton(): Locator {
    return this.page.getByRole("button", { name: /^Continue$/i });
  }

  get previousButton(): Locator {
    return this.page.getByRole("button", { name: /^Previous$/i });
  }

  /** "Last saved {time}" indicator in the SubnavBar — only present after autosave */
  get saveStatusText(): Locator {
    return this.page.getByText(/Last saved/i);
  }

  // ===== Actions =====

  async fillTextField(label: string | RegExp, value: string): Promise<void> {
    const field = this.getFieldByLabel(label);
    await field.clear();
    await field.fill(value);
  }

  async fillTextarea(label: string | RegExp, value: string): Promise<void> {
    // Get textarea by label — use getByLabel which should work for textarea as well
    const field = this.page.getByLabel(label);
    await field.fill(value);
  }
}
