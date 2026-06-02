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
  async hasCopySourceSelector(): Promise<boolean> {
    try {
      // Modal is already open when this is called (openCopyModal asserts dialog visibility)
      const modal = this.page.getByRole("dialog").first();
      const select = modal.getByRole("combobox").first();
      const count = await select.count().catch(() => 0);
      return count > 0;
    } catch {
      return false;
    }
  }

  async getFirstReportOptionValue(): Promise<string | null> {
    const modal = this.page.getByRole("dialog").first();
    await expect(modal).toBeVisible({ timeout: 10000 });

    const select = modal.getByRole("combobox").first();
    const selectCount = await select.count();

    // If no combobox exists, there's only one report - no selection needed
    if (selectCount === 0) {
      return null;
    }

    // Combobox exists, try to get options from it
    try {
      const options = select.locator("option");
      const count = await options.count().catch(() => 0);

      // Skip the first option (placeholder "Select a report to copy")
      if (count > 1) {
        const firstValue = await options.nth(1).getAttribute("value");
        return firstValue;
      }
      return null;
    } catch {
      console.log("Error getting first report option");
      return null;
    }
  }

  async selectCopyFromReport(reportId: string): Promise<void> {
    const select = this.page
      .getByRole("dialog")
      .first()
      .getByRole("combobox")
      .first();
    await expect(select).toBeVisible({ timeout: 10000 });
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

  async submitCopyModal(): Promise<"copied" | "blocked"> {
    const modal = this.page.getByRole("dialog").first();
    const submitButton = modal
      .getByRole("button")
      .filter({ hasText: /Save/ })
      .first();
    await submitButton.click();

    // Copy stays on the dashboard (reloads report list) — success = modal closes.
    // Failure (API error) = modal stays open with an error alert.
    try {
      await expect(modal).toBeHidden({ timeout: 15000 });
      return "copied";
    } catch {
      // Log the API error message from the modal alert for diagnostics
      const errorText = await modal
        .locator("[role='alert'], .chakra-alert")
        .first()
        .textContent()
        .catch(() => null);
      if (errorText) {
        console.log(`Copy blocked by API: ${errorText.trim()}`);
      }
      return "blocked";
    }
  }
}
