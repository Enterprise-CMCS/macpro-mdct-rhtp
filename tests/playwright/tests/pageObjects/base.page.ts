import { Page } from "@playwright/test";

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
      timeout: 30000,
    });
  }

  // ===== Page State & Loading =====
  async waitForLoadingComplete(): Promise<void> {
    // Wait for any loading spinners to disappear (if they exist)
    // Use implicit retry logic via waitFor rather than explicit expect
    await this.page
      .getByRole("status")
      .first()
      .waitFor({ state: "hidden", timeout: 15000 })
      .catch(() => {
        // No spinner found or already hidden - that's fine
      });
  }
}
