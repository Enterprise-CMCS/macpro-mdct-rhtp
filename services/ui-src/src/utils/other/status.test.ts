import { mockReport } from "utils/testing/mockForm";
import { getStatus } from "./status";
import { ReportStatus } from "@rhtp/shared";

const reportBuilder = (status: ReportStatus, submissionCount: number) => ({
  ...mockReport,
  status,
  submissionCount,
});

describe("getStatus()", () => {
  test.each([
    [ReportStatus.NOT_STARTED, 0, ReportStatus.NOT_STARTED],
    [ReportStatus.IN_PROGRESS, 0, ReportStatus.IN_PROGRESS],
    [ReportStatus.SUBMITTED, 1, ReportStatus.SUBMITTED],
    ["In revision", 1, ReportStatus.IN_PROGRESS],
  ])(
    "returns %s status with submission count %i and status %s",
    (expected, submissionCount, reportStatus) => {
      const report = reportBuilder(reportStatus, submissionCount);
      expect(getStatus(report)).toEqual(expected);
    }
  );
});
