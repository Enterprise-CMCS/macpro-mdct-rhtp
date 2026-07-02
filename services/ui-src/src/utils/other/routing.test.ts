import { Report, ReportType } from "@rhtp/shared";
import { getReturnUrl, reportBasePath } from "./routing";

describe("routing util tests", () => {
  describe("reportBasePath", () => {
    test("creates report base path name following convention", () => {
      const mockReport = {
        type: ReportType.RHTP,
        state: "AK",
        id: "123-report-id",
      } as Report;

      const result = reportBasePath(mockReport);
      expect(result).toEqual("/report/RHTP/AK/123-report-id");
    });
  });

  describe("routeToReturnUrl", () => {
    test("returns stored url when present", () => {
      localStorage.setItem("ReturnURL", "/test/path");
      const result = getReturnUrl();
      expect(result).toEqual("/test/path");
    });

    test("returns / when no stored url", () => {
      localStorage.clear();
      const result = getReturnUrl();
      expect(result).toEqual("/");
    });
  });
});
