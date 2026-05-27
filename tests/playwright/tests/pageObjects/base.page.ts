import { Page, expect } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ===== Navigation =====
  async navigateTo(route: string): Promise<void> {
    await this.page.goto(route, { waitUntil: "domcontentloaded" });
  }

  // ===== Page State & Loading =====
  async waitForLoadingComplete(): Promise<void> {
    // Wait for any spinners or loading indicators to disappear
    const spinners = this.page.getByRole("status").first();
    await expect(spinners)
      .toBeHidden()
      .catch(() => {
        // It's ok if the status element doesn't exist
      });
  }
}
