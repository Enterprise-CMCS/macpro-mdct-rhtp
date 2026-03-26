import KSUID from "ksuid";
import { getReportTemplate } from "../../../forms/yearlyFormSelection";
import {
  Report,
  ReportStatus,
  ReportType,
  RhtpSubType,
} from "../../../types/reports";
import { copyReport } from "./copyTest";

const mockGetReport = vi.fn().mockReturnValue({
  submittedBy: "Penn Woods",
  submittedByEmail: "stateuser@test.com",
  year: 2026,
  created: 1774532490321,
  submissionCount: 1,
  submissionDates: [
    {
      submitted: 1774532628455,
    },
  ],
  lastEdited: 1774532628455,
  type: "RHTP",
  lastEditedBy: "Penn Woods",
  pages: [
    {
      initiativeNumber: "123",
      id: "416c4eab-7658-4f5d-a559-a8ef616f86df",
      title: "First Initiative",
      type: "standard",
      sidebar: false,
      elements: [
        {
          id: "initiative-narrative",
          label: "Narrative",
          type: "textAreaField",
          answer: "First narrative1", // LOOK FOR THIS ANSWER
          required: true,
        },
      ],
    },
    {
      initiativeNumber: "456",
      id: "47129b18-a036-46ae-9e24-ecf3ed666bc5",
      title: "Second Initiative",
      type: "standard",
      sidebar: false,
      elements: [
        {
          id: "initiative-narrative",
          label: "Narrative",
          type: "textAreaField",
          answer: "Second narrative2", // AND LOOK FOR THIS ANSWER
          required: true,
        },
      ],
    },
  ],
  submitted: 1774532628455,
  lastEditedByEmail: "stateuser@test.com",
  name: "PA - Annual Report - 2026",
  subType: 0,
  state: "PA",
  id: "3BU8rtct2tyfYp1CDUXeVHq5AkP",
  status: "Submitted",
});

vi.mock("../../../storage/reports", () => ({
  getReport: () => mockGetReport(),
}));

describe("copyReport util", () => {
  test("with report", async () => {
    // setup, mimicking create and copy flow
    const template = structuredClone(getReportTemplate(ReportType.RHTP, 2026));

    const report: Report = {
      state: "PA",
      id: KSUID.randomSync().string,
      created: Date.now(),
      lastEdited: Date.now(),
      lastEditedBy: "Test",
      lastEditedByEmail: "Test",
      type: ReportType.RHTP,
      status: ReportStatus.NOT_STARTED,
      name: "test report",
      year: 2026,
      subType: RhtpSubType.Q1,
      copyFromReportId: "3BU8rtct2tyfYp1CDUXeVHq5AkP",
      submissionCount: 0,
      pages: template.pages,
    };
    const reportToCopy = {
      ...report,
      pages: [
        {
          ...report.pages[7],
          elements: [report?.pages?.[7].elements?.[4]],
        },
        {
          ...report.pages[8],
          elements: [report?.pages?.[8].elements?.[4]],
        },
      ],
    } as Report;

    // actual copy
    await copyReport(reportToCopy);
    console.log("first initiative", reportToCopy.pages[0]);
    console.log("second initiative", reportToCopy.pages[1]);
  });
});
