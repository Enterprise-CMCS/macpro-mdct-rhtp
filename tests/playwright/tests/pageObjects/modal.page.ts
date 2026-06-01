import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ModalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ===== Form Filling =====
  async fillFormFields(fields: Record<string, string>): Promise<void> {
    const modal = this.page.getByRole("dialog").first();

    for (const [key, value] of Object.entries(fields)) {
      // Try to find the input by label or placeholder
      const input = modal
        .getByLabel(new RegExp(key, "i"), { exact: false })
        .or(modal.getByPlaceholder(new RegExp(key, "i"), { exact: false }));

      // If not found, try finding by role and name pattern
      if ((await input.count().catch(() => 0)) === 0) {
        const textInput = modal
          .getByRole("textbox")
          .filter({ hasText: new RegExp(key, "i") })
          .first();
        if ((await textInput.count().catch(() => 0)) > 0) {
          await textInput.fill(value);
        }
      } else {
        await input.fill(value);
      }
    }
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
