import { Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { reportType, stateAbbreviation } from "../../utils/consts";

export class StatePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Reset test state by deleting all reports for the test state.
   * This uses the devTools DELETE endpoint if available.
   * Silently succeeds or fails—tests don't depend on this passing.
   */
  async resetTestState(): Promise<void> {
    try {
      const apiUrl = process.env.API_URL;
      const accessToken = process.env.STATE_ACCESS_TOKEN;

      if (!apiUrl || !accessToken) {
        console.warn(
          "⚠️ Missing API_URL or STATE_ACCESS_TOKEN; skipping test state reset"
        );
        return;
      }

      const endpoint = `${apiUrl}/reports/${reportType}/${stateAbbreviation}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(
          `⚠️ Failed to reset test state: ${response.status} ${response.statusText}`
        );
      } else {
        console.log("✓ Test state reset successfully");
      }
    } catch (error) {
      console.warn(
        `⚠️ Error resetting test state: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
