export const adminUser = process.env.TEST_ADMIN_USER_EMAIL!;
export const adminPassword = process.env.TEST_ADMIN_USER_PASSWORD!; // pragma: allowlist secret
export const stateUser = process.env.TEST_STATE_USER_EMAIL!;
export const statePassword = process.env.TEST_STATE_USER_PASSWORD!; // pragma: allowlist secret
export const stateAbbreviation = process.env.TEST_STATE || "DC";
export const stateName = process.env.TEST_STATE_NAME || "District of Columbia";

export const adminAuthPath: string = "playwright/.auth/admin.json";
export const stateUserAuthPath: string = "playwright/.auth/user.json";

export const expectedAdminHeading = "View State/Territory Reports";
export const expectedStateUserHeading = "Rural Health Transformation Program";

export const cognitoIdentityRoute = "https://cognito-identity.*.amazonaws.com/";

export const a11yViewports = {
  mobile: { width: 560, height: 800 },
  tablet: { width: 880, height: 1000 },
  desktop: { width: 1200, height: 1200 },
};

export const a11yTags = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "section508",
  "best-practice",
];
