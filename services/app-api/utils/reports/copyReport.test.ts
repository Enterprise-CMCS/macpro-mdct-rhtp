import {
  ActionAnswerShape,
  ActionTableTemplate,
  ElementType,
  InitiativePageTemplate,
  PageStatus,
  PageType,
  Report,
  TextboxTemplate,
} from "@rhtp/shared";
import { validReport } from "../tests/mockReport";
import { copyReport } from "./copyReport";

const mockGetReport = vi.fn();

vi.mock("../../storage/reports", () => ({
  getReport: () => mockGetReport(),
}));

const mockInitiativeAnswer = "mock text answer";
const metricStartingCurrentValue = "1000";

const metricAnswers: ActionAnswerShape[] = [
  [
    { id: "status", value: "active" },
    { id: "metric", value: "hello" },
    { id: "prevValue", value: "" },
    { id: "currValue", value: metricStartingCurrentValue },
    { id: "date", value: "2/2/2025" },
  ],
];

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
      {
        id: "metrics-table", // id match for specific logic
        type: ElementType.ActionTable,
        label: "Metric table element",
        required: true,
        answer: metricAnswers,
      } as unknown as ActionTableTemplate,
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
        {
          id: "metrics-table", // id match for specific logic
          type: ElementType.ActionTable,
          label: "Metric table element",
          required: true,
          answer: metricAnswers,
        } as unknown as ActionTableTemplate,
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
    // no answer in report before copy
    expect(mockNewReport.pages[1].elements[1].answer).toBeUndefined();

    await copyReport(mockNewReport);

    // textbox answer copies
    expect(mockNewReport.pages[1].elements[1].answer).toEqual("mock answer");

    // added initiative pages copy
    expect(mockNewReport.pages[2].initiativeNumber).toEqual(
      mockAddedInitiatives[0].initiativeNumber
    );
    expect(mockNewReport.pages[3].initiativeNumber).toEqual(
      mockAddedInitiatives[1].initiativeNumber
    );

    // added initiative answers copy
    expect(mockNewReport.pages[2].elements[0].answer).toEqual(
      mockInitiativeAnswer
    );

    // metrics in added initiative — current values get copied to previous value, then cleared
    const newMetricAnswerRow = mockNewReport.pages[2].elements[1].answer[0];
    expect(newMetricAnswerRow).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "prevValue",
          value: metricStartingCurrentValue,
        }),
        expect.objectContaining({
          id: "currValue",
          value: "",
        }),
      ])
    );

    // initiative page status copies
    expect(mockNewReport.pages[3].status).toEqual(PageStatus.ABANDONED);

    // metric current values get copied to previous value, then cleared
    const existingMetricAnswerRow =
      mockNewReport.pages[1].elements[2].answer[0];
    expect(existingMetricAnswerRow).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "prevValue",
          value: metricStartingCurrentValue,
        }),
        expect.objectContaining({
          id: "currValue",
          value: "",
        }),
      ])
    );
  });
});
