import {
  ElementType,
  InitiativePageTemplate,
  PageStatus,
  PageType,
  Report,
  TextboxTemplate,
} from "../../types/reports";
import { validReport } from "../tests/mockReport";
import { copyReport } from "./copyReport";

const mockGetReport = vi.fn();

vi.mock("../../storage/reports", () => ({
  getReport: () => mockGetReport(),
}));

const mockInitiativeAnswer = "mock text answer";

const mockAddedInitiatives = [
  {
    id: "added-initiative-1",
    title: "Added Initiative 1",
    initiativeNumber: "0987",
    elements: [
      {
        type: ElementType.Textbox,
        id: "mock-added-initiative-element",
        label: "Added Initiative element",
        required: true,
        answer: mockInitiativeAnswer,
      } as TextboxTemplate,
    ],
  },
  {
    id: "added-initiative-2",
    title: "Added Initiative 2",
    initiativeNumber: "1010",
    status: PageStatus.ABANDONED,
    elements: [],
  },
] as InitiativePageTemplate[];

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
mockNewReport.copyFromReportId = "mock-old-report";
delete mockNewReport.pages[1].elements[1].answer;
// add initiative to old report that's not in new report, so we can test it copies
mockOldReport.pages.push(...mockAddedInitiatives);

describe("copyReport util", () => {
  test("copyReport copies data from old report into new one, including initiative pages and answers", async () => {
    mockGetReport.mockReturnValue(mockOldReport);
    expect(mockNewReport.pages[1].elements[1].answer).toBeUndefined();
    await copyReport(mockNewReport);
    expect(mockNewReport.pages[1].elements[1].answer).toEqual("mock answer");
    expect(mockNewReport.pages[2].initiativeNumber).toEqual(
      mockAddedInitiatives[0].initiativeNumber
    );
    expect(mockNewReport.pages[2].elements[0].answer).toEqual(
      mockInitiativeAnswer
    );
    expect(mockNewReport.pages[3].status).toEqual(PageStatus.ABANDONED);
  });
});
