import { ElementType, PageType, Report } from "../../types/reports";
import { validReport } from "../tests/mockReport";
import { copyReport } from "./copyReport";

const mockGetReport = vi.fn();

vi.mock("../../storage/reports", () => ({
  getReport: () => mockGetReport(),
}));

const mockOldReport: Report = {
  ...validReport,
  id: "mock-old-report",
  pages: [
    {
      id: "root",
      childPageIds: ["mock-page-1"],
    },
    {
      id: "mock-page-1",
      title: "Mock Page 1",
      type: PageType.Standard,
      sidebar: true,
      elements: [
        {
          type: ElementType.Header,
          id: "mock-non-input-element",
          text: "Non-input element",
        },
        {
          id: "mock-input-element",
          type: ElementType.Textbox,
          label: "Input element",
          required: true,
          answer: "mock answer",
        },
      ],
    },
  ],
};

// any type so it doesn't complain about accessing .answer on generic PageElement
const mockNewReport: any = structuredClone(mockOldReport);
mockNewReport.id = "mock-new-report";
delete mockNewReport.pages[1].elements[1].answer;

describe("copyReport util", () => {
  test("copyReport copies data from old report into new one", async () => {
    mockGetReport.mockReturnValue(mockOldReport);
    expect(mockNewReport.pages[1].elements[1].answer).toBeUndefined();
    await copyReport(mockNewReport, "mock-old-report");
    expect(mockNewReport.pages[1].elements[1].answer).toEqual("mock answer");
  });
});
