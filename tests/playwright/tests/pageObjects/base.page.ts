import { Page } from "@playwright/test";
import { TIMEOUT_LOADING, TIMEOUT_NAVIGATION } from "../../utils/timeouts";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ===== Navigation =====
  async navigateTo(route: string): Promise<void> {
    // domcontentloaded is ideal for local dev - fast and reliable
    await this.page.goto(route, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT_NAVIGATION,
    });
  }

  // ===== Page State & Loading =====
  async waitForLoadingComplete(): Promise<void> {
    // Wait for any loading spinners to disappear (if they exist)
    // Use implicit retry logic via waitFor rather than explicit expect
    await this.page
      .getByRole("status")
      .first()
      .waitFor({ state: "hidden", timeout: TIMEOUT_LOADING })
      .catch(() => {
        // No spinner found or already hidden
      });
  }
}
