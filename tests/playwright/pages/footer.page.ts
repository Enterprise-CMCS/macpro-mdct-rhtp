import { Locator, Page } from "@playwright/test";

export class FooterPage {
  readonly page: Page;
  readonly footer: Locator;
  readonly logo: Locator;
  readonly hhsLogo: Locator;
  readonly medicaidLogo: Locator;
  readonly contactUsLink: Locator;
  readonly accessibilityLink: Locator;
  readonly addressText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.footer = page.getByRole("contentinfo");
    this.logo = this.footer.getByRole("img", { name: "RHTP logo" });
    this.hhsLogo = this.footer.getByRole("img", {
      name: "Department of Health and Human Services, USA",
    });
    this.medicaidLogo = this.footer.getByRole("img", {
      name: "Medicaid.gov: Keeping America Healthy",
    });
    this.contactUsLink = this.footer.getByRole("link", { name: "Contact Us" });
    this.accessibilityLink = this.footer.getByRole("link", {
      name: "Accessibility Statement",
    });
    this.addressText = this.footer.getByText(
      "7500 Security Boulevard Baltimore, MD 21244"
    );
  }

  async goToContactUs() {
    await Promise.all([
      this.page.waitForURL(/\/help(\/)?(\?.*)?$/),
      this.contactUsLink.click(),
    ]);
  }
}
