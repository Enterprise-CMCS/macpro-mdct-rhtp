import {
  ActionTableTemplate,
  ElementType,
  PageStatus,
  PageType,
  Report,
} from "@rhtp/shared";
import {
  metricAnswers,
  mockAddedInitiatives,
  mockStatePolicyCommitments,
  validReport,
} from "../tests/mockReport";
import { copyReport } from "./copyReport";

const mockGetReport = vi.fn();
const mockQueryComments = vi.fn();
const mockBatchComments = vi.fn();
const mockBatchUploads = vi.fn();
const mockQueryUpload = vi.fn();

vi.mock("../../storage/reports", () => ({
  getReport: () => mockGetReport(),
}));

vi.mock("../../storage/comments", () => ({
  queryComments: () => mockQueryComments(),
  batchPutComments: () => mockBatchComments(),
}));

vi.mock("../../storage/upload", () => ({
  queryUpload: () => mockQueryUpload(),
  batchPutUploads: () => mockBatchUploads(),
}));

const mockInitiativeAnswer = "mock text answer";
const metricStartingCurrentValue = "1000";

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
        {
          id: "use-of-funds-attachment",
          type: ElementType.UseOfFundsAttachment,
          label: "mock label",
          answer: [
            {
              name: "file-name",
              size: 100,
              fileId: "file-id",
            },
          ],
          required: true,
        },
      ],
    },
    ...mockAddedInitiatives,
    ...mockStatePolicyCommitments,
  ],
};

// any type so it doesn't complain about accessing .answer on generic PageElement
const mockNewReport: any = structuredClone(mockOldReport);
mockNewReport.id = "mock-new-report";
mockNewReport.copyFromReportId = "mock-old-report";
delete mockNewReport.pages[1].elements[1].answer;

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

    const existingUseOfFunds = mockNewReport.pages[1].elements[3];
    expect(existingUseOfFunds).not.toHaveProperty("answer");

    // Verify state policy commitments are copied correctly
    const newPolicyCommitments = mockNewReport.pages[4].elements[0].accordions;
    expect(newPolicyCommitments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "State Policy Commitment 1",
          elements: [
            expect.objectContaining({
              type: ElementType.Textbox,
              id: "state-policy-commitment-1-textbox",
              label: "State Policy Commitment 1 Textbox",
              answer: "State Policy Commitment 1 Answer",
            }),
            {
              answer: [
                {
                  fileId: "mock-id",
                  name: "mock-name",
                  size: 100,
                },
              ],
              id: "attachment-id",
              type: "attachmentArea",
            },
          ],
        }),
      ])
    );
  });
});
