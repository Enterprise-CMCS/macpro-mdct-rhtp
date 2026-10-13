import {
  ActionTableTemplate,
  AccordionGroupTemplate,
  AttachmentAreaTemplate,
  ElementType,
  FormPageTemplate,
  PageStatus,
  PageType,
  Report,
  RhtpSubType,
  TextAreaBoxTemplate,
  TextboxTemplate,
} from "@rhtp/shared";
import {
  metricAnswers,
  mockAddedInitiatives,
  mockStatePolicyCommitments,
  validReport,
} from "../tests/mockReport";
import { buildInitiativePages } from "../../forms/2026/rhtp/pages/initiatives/initiatives";
import { buildStatePolicyCommitments } from "../../forms/2026/rhtp/pages/state-policy-commitments/state-policy-commitments";
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
          id: "obligated-and-spent-funds-attachment",
          type: ElementType.ObligatedAndSpentFundsAttachment,
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
const mockNewReport: any = structuredClone(mockOldReport);
mockNewReport.id = "mock-new-report";
mockNewReport.copyFromReportId = "mock-old-report";
delete mockNewReport.pages[1].elements[1].answer;
delete mockNewReport.pages[5].elements[0].answer; // remove answer from sustainability and highlights element

describe("copyReport util", () => {
  test("resets initiative fields from the template for a new annual report", async () => {
    const [firstYearPage] = await buildInitiativePages("PA", {
      PA: [
        {
          id: "first-year-initiative",
          title: "First Year Initiative",
          initiativeNumber: "123",
          narrative: "Prior narrative",
          numberOfPeopleServed: "42",
          skipFirstYearCharLimit: true,
        },
      ],
    });
    const oldNarrative = firstYearPage.elements.find(
      (element) => element.id === "initiative-narrative"
    ) as TextAreaBoxTemplate;
    const oldPeopleServed = firstYearPage.elements.find(
      (element) => element.id === "initiative-number-of-people-served"
    ) as TextboxTemplate;
    oldNarrative.required = false;
    oldPeopleServed.required = false;
    oldPeopleServed.disabled = true;
    mockGetReport.mockReturnValue({
      ...mockOldReport,
      pages: [...mockOldReport.pages, firstYearPage],
    });
    const nextReport = structuredClone(mockNewReport);
    nextReport.pages = nextReport.pages.filter(
      (page: Report["pages"][number]) => !("initiativeNumber" in page)
    );

    await copyReport(nextReport);

    const initiative = nextReport.pages.find(
      (page: Report["pages"][number]) => page.id === firstYearPage.id
    );
    const narrative = initiative.elements.find(
      (element: { id: string }) => element.id === "initiative-narrative"
    );
    const peopleServed = initiative.elements.find(
      (element: { id: string }) =>
        element.id === "initiative-number-of-people-served"
    );
    expect(narrative).toMatchObject({
      charLimit: 2000,
      required: true,
      quarterly: true,
    });
    expect(narrative).not.toHaveProperty("answer");
    expect(peopleServed).toMatchObject({ required: true, quarterly: false });
    expect(peopleServed).not.toHaveProperty("answer");
    expect(peopleServed).not.toHaveProperty("disabled");
  });

  test.each([
    [RhtpSubType.QUARTERLY, metricStartingCurrentValue, ""],
    [RhtpSubType.ANNUAL, "", metricStartingCurrentValue],
  ])(
    "copies initiative metrics into a new %s report without imported pages",
    async (subType, currentValue, previousValue) => {
      mockGetReport.mockReturnValue(mockOldReport);
      const nextReport = structuredClone(mockNewReport);
      nextReport.subType = subType;
      nextReport.pages = nextReport.pages.filter(
        (page: Report["pages"][number]) => !("initiativeNumber" in page)
      );

      await copyReport(nextReport);

      const initiative = nextReport.pages.find(
        (page: Report["pages"][number]) => page.id === "added-initiative-1"
      );
      const metrics = initiative.elements.find(
        (element: { id: string }) => element.id === "metrics-table"
      );
      expect(metrics.answer[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "currValue", value: currentValue }),
          expect.objectContaining({ id: "prevValue", value: previousValue }),
        ])
      );
      expect(
        (mockAddedInitiatives[0].elements[1] as ActionTableTemplate).answer
      ).toEqual(metricAnswers);
    }
  );

  test("copies metric answers unchanged into a quarterly report", async () => {
    mockGetReport.mockReturnValue(mockOldReport);
    const quarterlyReport = structuredClone(mockNewReport);
    quarterlyReport.subType = RhtpSubType.QUARTERLY;
    quarterlyReport.pages[1].elements[2].answer = [];

    await copyReport(quarterlyReport);

    expect(quarterlyReport.pages[1].elements[2].answer).toEqual(metricAnswers);
    expect(quarterlyReport.pages[1].elements[2].answer).not.toBe(metricAnswers);
  });

  test("rebuilds commitments and skips old notes on subsequent reports", async () => {
    const oldPage = structuredClone(
      await buildStatePolicyCommitments("NJ", {
        NJ: [
          {
            label: "State Policy Commitment 1",
            status: "Implemented",
            links: ["https://example.com/policy"],
          },
        ],
      })
    );
    const oldGroup = oldPage.elements.find(
      (element) => element.id === "state-policy-commitments-group"
    ) as AccordionGroupTemplate;
    const oldElements = oldGroup.accordions[0].elements;
    const oldNotes = oldElements.find(
      (element) => element.id === "commitment-notes"
    ) as TextAreaBoxTemplate;
    oldNotes.answer = "Prior notes";
    const oldAttachments = oldElements.find(
      (element) => element.id === "commitment-attachments"
    ) as AttachmentAreaTemplate;
    oldAttachments.answer = [
      { name: "evidence.pdf", size: 100, fileId: "mock-id" },
    ];
    mockGetReport.mockReturnValue({
      ...mockOldReport,
      pages: mockOldReport.pages.map((page) =>
        page.id === oldPage.id ? oldPage : page
      ),
    });
    const nextReport = structuredClone(mockNewReport);
    nextReport.pages[4].elements[0].accordions = [];

    await copyReport(nextReport);

    const copiedElements =
      nextReport.pages[4].elements[0].accordions[0].elements;
    expect(copiedElements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "commitment-status",
          answer: "Implemented",
        }),
        expect.objectContaining({
          id: "commitment-links",
          answer: ["https://example.com/policy"],
        }),
        expect.objectContaining({
          id: "commitment-attachments",
          answer: [{ name: "evidence.pdf", size: 100, fileId: "mock-id" }],
        }),
      ])
    );
    expect(
      copiedElements.find(
        (element: { id: string }) => element.id === "commitment-notes"
      )
    ).not.toHaveProperty("answer");
    expect(oldNotes.answer).toBe("Prior notes");
  });

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

    //did not copy initiative-narrative text area
    expect(mockNewReport.pages[1].elements[4].answer).toEqual(undefined);

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

    const existingObligatedAndSpentFunds = mockNewReport.pages[1].elements[3];
    expect(existingObligatedAndSpentFunds).not.toHaveProperty("answer");

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

    // verify sustainability and highlights is skipped and answers are not copied
    const mockSustainabilityAndHighlightsPage = mockNewReport.pages[5];
    expect(mockSustainabilityAndHighlightsPage.id).toEqual(
      "sustainability-and-highlights"
    );
    expect(mockSustainabilityAndHighlightsPage.elements[0]).not.toHaveProperty(
      "answer"
    );
  });
});
