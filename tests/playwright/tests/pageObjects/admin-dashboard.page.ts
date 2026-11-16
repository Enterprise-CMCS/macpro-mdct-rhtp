import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { escapeRegExp } from "../../utils/report-edit-shared-helpers";

export class AdminDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToAdminDashboard(): Promise<void> {
    await this.navigateTo("/");
    await this.adminPageHeading.waitFor({ state: "visible" });
    await this.page.getByRole("table").waitFor({ state: "visible" });
  }

  get adminPageHeading() {
    return this.page.getByRole("heading", {
      name: "RHTP Admin Dashboard",
      exact: true,
    });
  }

  get startFirstAnnualReportButton() {
    return this.page.getByRole("button", {
      name: "Start First Annual Report",
      exact: true,
    });
  }

  get statesDropdown() {
    return this.page.getByRole("button", {
      name: "States select",
      exact: true,
    });
  }

  get budgetPeriodDropdown() {
    return this.page.getByRole("button", {
      name: /Filter by Budget Period$/,
      exact: true,
    });
  }

  get clearFiltersButton() {
    return this.page.getByRole("button", {
      name: "Clear All Filters",
      exact: true,
    });
  }

  private reportRow(reportName: string) {
    return this.page.getByRole("row").filter({
      has: this.page.getByRole("cell", {
        name: reportName,
        exact: true,
      }),
    });
  }

  async clickStartFirstAnnualReportButton(): Promise<void> {
    await this.startFirstAnnualReportButton.click();
  }

  async selectState(state: string): Promise<void> {
    await this.statesDropdown.click();
    await this.page
      .getByRole("checkbox", {
        name: state,
        exact: true,
      })
      .check();
    await this.page
      .getByRole("img", {
        name: "down arrow",
        exact: true,
      })
      .click();
  }

  async selectBudgetPeriod(budgetPeriod: string): Promise<void> {
    await this.budgetPeriodDropdown.click();
    await this.page
      .getByRole("option", {
        name: budgetPeriod,
        exact: true,
      })
      .click();
  }

  async clickClearFiltersButton(): Promise<void> {
    await this.clearFiltersButton.click();
  }

  async findReportName(
    stateAbbreviation: string,
    period: "Annual" | "Quarterly"
  ): Promise<string | undefined> {
    const reportCells = this.page.getByRole("table").getByRole("cell", {
      name: new RegExp(
        `${escapeRegExp(stateAbbreviation)} - ${period} Report\\b`,
        "i"
      ),
    });

    if ((await reportCells.count()) === 0) {
      return undefined;
    }

    const reportName = (await reportCells.first().textContent())?.trim();
    if (!reportName) {
      throw new Error(
        `Report name is blank for ${stateAbbreviation} ${period} report`
      );
    }
    return reportName;
  }

  async clickViewReportButton(reportName: string): Promise<void> {
    const row = this.reportRow(reportName);
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "View Report", exact: true }).click();
  }

  async clickCommentStatusButton(reportName: string): Promise<void> {
    const row = this.reportRow(reportName);
    await expect(row).toHaveCount(1);
    await row
      .getByRole("button", { name: "Comment/Status", exact: true })
      .click();
  }
}
