import { expect, Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import { TIMEOUT_AUTOSAVE, TIMEOUT_LOADING } from "../../utils/timeouts";

export type AutosaveRefreshOptions = {
  timeoutMs?: number;
  fallbackSectionId?: string;
};

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

  async navigateToSectionAndBack(
    reportType: string,
    state: string,
    reportId: string,
    toSectionId: string,
    fromSectionId: string
  ): Promise<void> {
    await this.navigateToSection(reportType, state, reportId, toSectionId);
    await this.waitForLoadingComplete();

    if (fromSectionId === toSectionId) {
      return;
    }
    await this.navigateToSection(reportType, state, reportId, fromSectionId);
    await this.waitForLoadingComplete();
  }

  async reloadAndReturnToSection(
    reportType: string,
    state: string,
    reportId: string,
    sectionId: string
  ): Promise<void> {
    await this.page.reload({ waitUntil: "domcontentloaded" });
    await this.waitForLoadingComplete();
    await this.navigateToSection(reportType, state, reportId, sectionId);
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

  getTextField(label: string | RegExp): Locator {
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

  async waitForAutosaveWithSectionRefresh(
    sectionId: string,
    options: AutosaveRefreshOptions = {}
  ): Promise<boolean> {
    const timeoutMs = options.timeoutMs ?? TIMEOUT_AUTOSAVE;
    const fallbackSectionId =
      options.fallbackSectionId ?? "initiative-attachments";
    const waitForAutosaveVisible = async () =>
      this.saveStatusText
        .waitFor({ state: "visible", timeout: timeoutMs })
        .then(() => true)
        .catch(() => false);

    if (await waitForAutosaveVisible()) {
      return true;
    }

    const { reportType, state, reportId } = this.getCurrentRouteParams();
    if (fallbackSectionId !== sectionId) {
      await this.navigateToSection(
        reportType,
        state,
        reportId,
        fallbackSectionId
      );
    }
    await this.navigateToSection(reportType, state, reportId, sectionId);

    return waitForAutosaveVisible();
  }

  waitForSaveResponse() {
    return this.page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        /\/reports\/[^/]+\/[^/]+\/[^/]+$/.test(response.url()) &&
        response.status() >= 200 &&
        response.status() < 300,
      { timeout: TIMEOUT_AUTOSAVE }
    );
  }

  async expectAutosaveIndicator(): Promise<void> {
    await expect(this.saveStatusText).toBeVisible({
      timeout: TIMEOUT_AUTOSAVE,
    });
  }

  async fillTextField(label: string | RegExp, value: string): Promise<void> {
    const field = this.page.getByLabel(label);
    await field.waitFor({ state: "visible", timeout: TIMEOUT_LOADING });
    await field.fill(value);
  }
}
