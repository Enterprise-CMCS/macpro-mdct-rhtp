import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { TIMEOUT_LOADING, TIMEOUT_UI } from "../../utils/timeouts";

export type CreateModalSubmitResult =
  | { status: "created" }
  | { status: "blocked"; errorText?: string };

export type CopyModalSubmitResult =
  | { status: "copied" }
  | { status: "blocked"; errorText?: string };

export class ReportModalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private async closeBlockedModal(modal: ReturnType<Page["getByRole"]>) {
    const cancelButton = modal
      .getByRole("button", { name: /^Cancel$/i })
      .first();
    const closeButton = modal.getByRole("button", { name: /Close/i }).first();
    const closeLink = modal.getByRole("link", { name: /Close/i }).first();

    if (await cancelButton.isVisible().catch(() => false)) {
      await cancelButton.click();
    } else if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    } else if (await closeLink.isVisible().catch(() => false)) {
      await closeLink.click();
    }

    await expect(modal)
      .toBeHidden({ timeout: TIMEOUT_UI })
      .catch(() => {});
  }

  // ===== Modal Buttons =====
  async submitCreateModal(): Promise<CreateModalSubmitResult> {
    const modal = this.page.getByRole("dialog").first();
    const submitButton = modal.getByRole("button", { name: /Save/i });
    await submitButton.click();

    // Created flow closes the modal and navigates to detail.
    try {
      await expect(modal).toBeHidden({ timeout: TIMEOUT_UI });
      return { status: "created" };
    } catch {
      // Blocked flow keeps modal open (for example duplicate prevention).
      const errorText = await modal
        .locator("[role='alert'], .chakra-alert")
        .first()
        .textContent()
        .catch(() => null);
      await this.closeBlockedModal(modal);
      return {
        status: "blocked",
        ...(errorText?.trim() ? { errorText: errorText.trim() } : {}),
      };
    }
  }

  async submitCopyModal(): Promise<CopyModalSubmitResult> {
    const modal = this.page.getByRole("dialog").first();
    const submitButton = modal.getByRole("button", { name: /Save/i });
    await submitButton.click();

    // Copy stays on the dashboard (reloads report list) — success = modal closes.
    // Failure (API error) = modal stays open with an error alert.
    try {
      await expect(modal).toBeHidden({ timeout: TIMEOUT_LOADING });
      return { status: "copied" };
    } catch {
      const errorText = await modal
        .locator("[role='alert'], .chakra-alert")
        .first()
        .textContent()
        .catch(() => null);

      // Keep behavior consistent with create modal: close blocked modal so
      // callers can recover and retry cleanly from the dashboard.
      await this.closeBlockedModal(modal);

      return {
        status: "blocked",
        ...(errorText?.trim() ? { errorText: errorText.trim() } : {}),
      };
    }
  }

  async closeModalIfOpen(): Promise<void> {
    const modal = this.page.getByRole("dialog").first();
    const isVisible = await modal.isVisible().catch(() => false);
    if (!isVisible) {
      return;
    }

    const closeButton = modal.getByRole("button", { name: /Close/i });
    const hasClose = await closeButton.isVisible().catch(() => false);
    if (hasClose) {
      await closeButton.click();
      await expect(modal)
        .toBeHidden({ timeout: TIMEOUT_UI })
        .catch(() => {});
    }
  }
}
