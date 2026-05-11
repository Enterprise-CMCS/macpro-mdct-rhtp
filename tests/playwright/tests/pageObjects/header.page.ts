import { expect, Locator, Page } from "@playwright/test";

export class HeaderPage {
  readonly page: Page;
  readonly nav: Locator;
  readonly logo: Locator;
  readonly helpLink: Locator;
  readonly accountButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.getByRole("navigation");
    this.logo = this.nav.getByRole("img", { name: "RHTP logo" });
    this.helpLink = this.nav.getByRole("link", { name: "Get Help" });
    this.accountButton = this.nav.getByRole("button", { name: "my account" });
  }

  async expectVisible() {
    await expect(this.nav).toBeVisible();
    await expect(this.logo).toBeVisible();
    await expect(this.helpLink).toBeVisible();
    await expect(this.accountButton).toBeVisible();
  }

  async expectHidden() {
    await expect(this.nav).toHaveCount(0);
  }

  async openAccountMenu() {
    await this.accountButton.click();
    await expect(
      this.page.getByRole("menuitem", { name: "Manage Account" })
    ).toBeVisible();
  }

  async goToHelp() {
    await Promise.all([this.page.waitForURL(/\/help$/), this.helpLink.click()]);
  }

  async goToProfileFromMenu() {
    await this.openAccountMenu();
    await Promise.all([
      this.page.waitForURL(/\/profile$/),
      this.page.getByRole("menuitem", { name: "Manage Account" }).click(),
    ]);
  }

  async logoutFromMenu() {
    await this.openAccountMenu();
    await this.page.getByRole("menuitem", { name: "Log Out" }).click();
    await expect(this.nav).toHaveCount(0);
  }
}
