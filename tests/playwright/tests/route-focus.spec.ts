import { test, expect } from "./fixtures/base";

test.describe("Route change", () => {
  test("should not focus focus on first route", async ({ statePage }) => {
    // Act - first route
    await statePage.page.goto("/");

    // Assert
    const focused = statePage.page.locator(":focus");
    await expect(focused).toHaveCount(0);
  });

  test("after first route should move focus to h1", async ({ statePage }) => {
    // Arrange
    await statePage.page.goto("/");
    const link = statePage.page.getByRole("link", {
      name: "Enter RHTP Report",
      exact: true,
    });
    await expect(link).toBeVisible();

    // Act - navigate to next page
    await link.click();

    // Assert
    const heading = statePage.page.getByRole("heading", { level: 1 });
    await expect(heading).toBeFocused();
  });
});
