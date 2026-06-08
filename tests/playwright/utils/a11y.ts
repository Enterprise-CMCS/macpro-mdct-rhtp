import AxeBuilder from "@axe-core/playwright";
import { expect, Page } from "@playwright/test";
import { a11yTags, a11yViewports } from "./consts";

export async function checkPageAccessibility(page: Page) {
  const axeBuilder = new AxeBuilder({ page }).withTags(a11yTags);
  const results = await axeBuilder.analyze();
  return results.violations;
}

export async function checkAccessibilityAcrossViewports(
  page: Page,
  url: string
) {
  await page.goto(url);

  const accessibilityErrors: any[] = [];

  for (const [device, viewport] of Object.entries(a11yViewports)) {
    await page.setViewportSize(viewport);
    await expect(page.locator("h1").first()).toBeVisible();

    const axeBuilder = new AxeBuilder({ page })
      .withTags(a11yTags)
      .disableRules(["duplicate-id"]);

    const results = await axeBuilder.analyze();

    if (results.violations.length > 0) {
      accessibilityErrors.push({
        device,
        violations: results.violations,
      });
    }
  }

  return accessibilityErrors;
}
