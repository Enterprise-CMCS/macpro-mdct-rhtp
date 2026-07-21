import {
  ActionTableTemplate,
  ElementType,
  FormPageTemplate,
  PageType,
  Report,
  UserRoles,
} from "@rhtp/shared";
import {
  metricAnswers,
  mockAddedInitiatives,
  mockStatePolicyCommitments,
  validReport,
} from "../tests/mockReport";
import { updateReportAnswers } from "./updateReport";
import { User } from "../../types/types";

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

const mockStateUser = {
  fullName: "Mock State User",
  email: "mockstate@user.com",
  role: UserRoles.STATE_USER,
} as User;

const mockReport: Report = {
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
        {
          id: "initiative-narrative",
          type: ElementType.TextAreaField,
          label: "mock text area",
          required: true,
          answer: "mock answer for textfield",
        },
      ],
    },
    ...mockAddedInitiatives,
    ...mockStatePolicyCommitments,
    {
      id: "sustainability-and-highlights",
      elements: [
        {
          id: "mock-sah-input-element",
          type: ElementType.Textbox,
          required: true,
          answer: "mock answer",
        },
      ],
    } as FormPageTemplate,
  ],
};

// any type so it doesn't complain about accessing .answer on generic PageElement
const mockReportRequest: any = structuredClone(mockReport);
mockReportRequest.id = "mock-new-report";
mockReportRequest.copyFromReportId = "mock-old-report";
mockReportRequest.pages[1].elements[1].answer = "New answer";
mockReportRequest.pages[4].elements[0].accordions[0].elements[0].answer =
  "New answer 2";
mockReportRequest.pages[1].elements[1].label = "HIJACKED"; // This should be prevented

describe("updateReport util", () => {
  test("updateReportcopies only changed data in answer fields", async () => {
    mockGetReport.mockReturnValue(mockReport);
    // no answer in report before copy
    const result: any = await updateReportAnswers(
      mockReportRequest,
      mockStateUser
    );

    // textbox answer transfers
    expect(result.pages[1].elements[1].answer).toEqual("New answer");

    // added initiative answers copy
    expect(result.pages[2].elements[0].answer).toEqual(mockInitiativeAnswer);

    // Verify state policy commitments are copied correctly
    const newPolicyCommitments = result.pages[4].elements[0].accordions[0];
    expect(newPolicyCommitments.elements[0].answer).toEqual("New answer 2");

    // Verify no injecting into anything but answer
    expect(result.pages[1].elements[1].answer).not.toEqual("HIJACKED");
  });
});
