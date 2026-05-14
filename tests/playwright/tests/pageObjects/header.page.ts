import { Locator, Page } from "@playwright/test";

export class HeaderPage {
  readonly page: Page;
  readonly nav: Locator;
  readonly logo: Locator;
  readonly helpLink: Locator;
  readonly accountButton: Locator;
  readonly manageAccountMenuItem: Locator;
  readonly logoutMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.getByRole("navigation");
    this.logo = this.nav.getByRole("img", { name: "RHTP logo" });
    this.helpLink = this.nav.getByRole("link", { name: "Get Help" });
    this.accountButton = this.nav.getByRole("button", { name: "my account" });
    this.manageAccountMenuItem = page.getByRole("menuitem", {
      name: "Manage Account",
    });
    this.logoutMenuItem = page.getByRole("menuitem", { name: "Log Out" });
  }

  async openAccountMenu() {
    await this.accountButton.click();
    await this.manageAccountMenuItem.waitFor({ state: "visible" });
  }

  async goToHelp() {
    await Promise.all([
      this.page.waitForURL(/\/help(\/)?(\?.*)?$/),
      this.helpLink.click(),
    ]);
  }

  async goToProfileFromMenu() {
    await this.openAccountMenu();
    await Promise.all([
      this.page.waitForURL(/\/profile(\/)?(\?.*)?$/),
      this.manageAccountMenuItem.click(),
    ]);
  }

  async logout() {
    await this.openAccountMenu();
    await this.logoutMenuItem.click();
  }
}
