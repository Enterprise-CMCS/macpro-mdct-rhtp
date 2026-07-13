import {
  AccordionGroupTemplate,
  AttachmentAreaTemplate,
  AttachmentStatus,
  AttachmentTableTemplate,
  ElementType,
  Report,
  ReportType,
} from "@rhtp/shared";
import {
  validReport,
  mockAddedInitiatives,
  mockStatePolicyCommitments,
} from "../tests/mockReport";
import {
  sortElementsForZip,
  getInitiativeFiles,
  getAttachmentAreaFiles,
  getAccordionFiles,
  formatS3ReportZipKey,
} from "./buildZip";

const mockOldReport: Report = {
  ...validReport,
  id: "mock-old-report",
  pages: [
    {
      id: "root",
      childPageIds: ["mock-page-1"],
    },
    ...mockAddedInitiatives,
    ...mockStatePolicyCommitments,
  ],
};

describe("buildZip util", () => {
  test("formatS3ReportZipKey", () => {
    const zipKey = formatS3ReportZipKey(ReportType.RHTP, "AL", "report-123");
    expect(zipKey).toEqual("zips/RHTP/AL/report-123.zip");
  });
  test("sortElementsForZip", () => {
    const sort = sortElementsForZip(mockOldReport);
    expect(sort).toStrictEqual({
      initiative: {},
      accordions: [
        {
          type: "accordionGroup",
          id: "state-policy-commitments-group",
          accordions: [
            {
              elements: [
                {
                  answer: "State Policy Commitment 1 Answer",
                  id: "state-policy-commitment-1-textbox",
                  label: "State Policy Commitment 1 Textbox",
                  type: "textbox",
                },
                {
                  id: "attachment-id",
                  type: "attachmentArea",
                  answer: [
                    {
                      fileId: "mock-id",
                      name: "mock-name",
                      size: 100,
                    },
                  ],
                },
              ],
              label: "State Policy Commitment 1",
            },
          ],
        },
      ],
      area: [],
    });
  });
  test("getInitiativeFiles", () => {
    const initiative: AttachmentTableTemplate = {
      type: ElementType.AttachmentTable,
      id: "mock-initiative",
      answer: [
        {
          attachment: {
            name: "mock-file-1",
            size: 0,
            fileId: "id",
          },
          initiatives: [],
          status: AttachmentStatus.PENDING_REVIEW,
          canDelete: false,
        },
        {
          attachment: {
            name: "mock-file-1",
            size: 0,
            fileId: "id",
          },
          initiatives: [],
          status: AttachmentStatus.INFORMATIONAL,
          canDelete: false,
        },
      ],
    };
    const files = getInitiativeFiles(initiative);
    expect(files).toStrictEqual([
      {
        fileId: "id",
        name: "mock-file-1",
        size: 0,
      },
    ]);
  });
  test("getAccordionFiles", () => {
    const files = getAccordionFiles(
      mockStatePolicyCommitments[0].elements as AccordionGroupTemplate[]
    );
    expect(files).toStrictEqual([
      {
        fileId: "mock-id",
        name: "mock-name",
        size: 100,
      },
    ]);
  });
  test("getAttachmentAreaFiles", () => {
    const attachmentArea: AttachmentAreaTemplate = {
      type: ElementType.AttachmentArea,
      subLabel: {},
      id: "success-attachments",
      label: "mock area",
      required: false,
      answer: [
        {
          name: "mock-file",
          size: 2000,
          fileId: "mock-id",
        },
      ],
    };

    const files = getAttachmentAreaFiles([attachmentArea]);
    expect(files).toStrictEqual([
      {
        name: "mock-file",
        size: 2000,
        fileId: "mock-id",
      },
    ]);
  });
});
