import { expect } from "@playwright/test";
import { FooterPage } from "../../pages/footer.page";

/**
 * Verify that footer is visible and all elements are rendered
 */
export async function verifyFooterVisible(footer: FooterPage) {
  await expect(footer.footer).toBeVisible();
  await expect(footer.logo).toBeVisible();
  await expect(footer.hhsLogo).toBeVisible();
  await expect(footer.contactUsLink).toBeVisible();
  await expect(footer.accessibilityLink).toBeVisible();
  await expect(footer.addressText).toBeVisible();
}

/**
 * Verify that footer is not rendered
 */
export async function verifyFooterHidden(footer: FooterPage) {
  await expect(footer.footer).toHaveCount(0);
}

/**
 * Verify footer link hrefs are correct
 */
export async function verifyFooterLinks(footer: FooterPage) {
  await expect(footer.contactUsLink).toHaveAttribute("href", "/help");
  await expect(footer.accessibilityLink).toHaveAttribute(
    "href",
    "https://www.cms.gov/About-CMS/Agency-Information/Aboutwebsite/CMSNondiscriminationNotice"
  );
}

/**
 * Verify navigation via the "Contact Us" footer link
 */
export async function verifyFooterNavigation(footer: FooterPage) {
  await verifyFooterLinks(footer);
  await footer.goToContactUs();
}
