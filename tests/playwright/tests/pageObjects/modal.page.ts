import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ModalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ===== Copy Modal - Report Selection =====
  async getFirstReportOptionValue(): Promise<string | null> {
    const select = this.page
      .getByRole("dialog")
      .first()
      .getByRole("combobox")
      .first();
    const options = select.getByRole("option");
    const count = await options.count();

    // Skip the first option (placeholder "Select a report to copy")
    if (count > 1) {
      const firstValue = await options.nth(1).getAttribute("value");
      return firstValue;
    }

    return null;
  }

  async selectCopyFromReport(reportId: string): Promise<void> {
    const select = this.page
      .getByRole("dialog")
      .first()
      .getByRole("combobox")
      .first();
    await select.selectOption(reportId);
  }

  // ===== Modal Buttons =====
  async submitCreateModal(): Promise<"created" | "blocked"> {
    const modal = this.page.getByRole("dialog").first();
    const submitButton = modal
      .getByRole("button")
      .filter({ hasText: /Save/ })
      .first();
    await submitButton.click();

    // Created flow closes the modal and navigates to detail.
    try {
      await expect(modal).toBeHidden({ timeout: 5000 });
      return "created";
    } catch {
      // Blocked flow keeps modal open (for example duplicate prevention).
      const closeButton = modal
        .getByRole("button")
        .filter({ hasText: /Close/ })
        .first();
      await closeButton.click();
      await expect(modal).toBeHidden();
      return "blocked";
    }
  }

  async submitCopyModal(): Promise<void> {
    const submitButton = this.page
      .getByRole("dialog")
      .first()
      .getByRole("button")
      .filter({ hasText: /Copy/ })
      .first();
    await submitButton.click();
    await expect(this.page).toHaveURL(/\/report\/.+\/.+\/.+/);
  }
}
