import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { TIMEOUT_LOADING, TIMEOUT_UI } from "../support/shared/timeouts";

export class ReportModalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ===== Modal Buttons =====
  async submitCreateModal(): Promise<"created" | "blocked"> {
    const modal = this.page.getByRole("dialog").first();
    const submitButton = modal.getByRole("button", { name: /Save/i });
    await submitButton.click();

    // Created flow closes the modal and navigates to detail.
    try {
      await expect(modal).toBeHidden({ timeout: TIMEOUT_UI });
      return "created";
    } catch {
      // Blocked flow keeps modal open (for example duplicate prevention).
      const closeButton = modal.getByRole("button", { name: /Close/i });
      await closeButton.click();
      await expect(modal).toBeHidden();
      return "blocked";
    }
  }

  async submitCopyModal(): Promise<"copied" | "blocked"> {
    const modal = this.page.getByRole("dialog").first();
    const submitButton = modal.getByRole("button", { name: /Save/i });
    await submitButton.click();

    // Copy stays on the dashboard (reloads report list) — success = modal closes.
    // Failure (API error) = modal stays open with an error alert.
    try {
      await expect(modal).toBeHidden({ timeout: TIMEOUT_LOADING });
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
