import { ReportType } from "../types/reports";
import { rhtpReportTemplate as rhtpReportTemplate2026 } from "./2026/rhtp/rhtp";
import { getReportTemplate } from "./yearlyFormSelection";

describe("Yearly Form Selection", () => {
  test("should throw an error if the requested year is not available (RHTP report)", () => {
    const getTemplateCall = () => getReportTemplate(ReportType.RHTP, 2025);
    expect(getTemplateCall).toThrow("not implemented");
  });

  test("should return the template for the exact requested year, if one exists (RHTP report)", () => {
    expect(getReportTemplate(ReportType.RHTP, 2026)).toBe(
      rhtpReportTemplate2026
    );
  });
});

describe("get error message for unsupported report type", () => {
  test("should throw an error for unsupported report type", () => {
    const unsupportedReportType = "UnsupportedReportType" as ReportType;
    const getTemplateCall = () =>
      getReportTemplate(unsupportedReportType, 2026);
    expect(getTemplateCall).toThrow(
      `Not implemented - getReportTemplate for ReportType ${unsupportedReportType}`
    );
  });
});
