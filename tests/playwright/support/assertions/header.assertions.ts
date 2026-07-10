import { expect } from "@playwright/test";
import { HeaderPage } from "../../pages/header.page";

/**
 * Verify that header is visible and all controls are rendered
 */
export async function verifyHeaderVisible(header: HeaderPage) {
  await expect(header.nav).toBeVisible();
  await expect(header.logo).toBeVisible();
  await expect(header.helpLink).toBeVisible();
  await expect(header.accountButton).toBeVisible();
}

/**
 * Verify that header is not rendered
 */
export async function verifyHeaderHidden(header: HeaderPage) {
  await expect(header.nav).toHaveCount(0);
}

/**
 * Verify that account menu items are visible after opening
 */
export async function verifyMenuItemsVisible(header: HeaderPage) {
  await expect(header.manageAccountMenuItem).toBeVisible();
  await expect(header.logoutMenuItem).toBeVisible();
}

/**
 * Verify that authenticated header controls disappear after logout
 */
export async function verifyLogoutCompleted(header: HeaderPage) {
  await expect(header.accountButton).toHaveCount(0);
  await expect(header.nav).toHaveCount(0);
}

/**
 * Verify header navigation flows (help and profile)
 */
export async function verifyHeaderNavigation(header: HeaderPage) {
  await verifyHeaderVisible(header);
  await expect(header.helpLink).toHaveAttribute("href", "/help");
  await header.goToHelp();

  await header.page.goto("/");
  await header.goToProfileFromMenu();
}
