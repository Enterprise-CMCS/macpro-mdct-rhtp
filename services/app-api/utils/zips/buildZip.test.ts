import {
  AccordionGroupTemplate,
  AttachmentAreaTemplate,
  AttachmentStatus,
  AttachmentTableTemplate,
  ElementType,
  FormPageTemplate,
  Report,
  UseOfFundsAttachmentTemplate,
} from "@rhtp/shared";
import { validReport, mockStatePolicyCommitments } from "../tests/mockReport";
import {
  sortElementsForZip,
  getInitiativeFiles,
  getAttachmentAreaFiles,
  getAccordionFiles,
  formatS3ZipKey,
  addReportFilesToZip,
  addUseOfFundsFilesToZip,
} from "./buildZip";
import JSZip from "jszip";
import s3Lib from "../../libs/s3-lib";
import {
  getReport,
  queryReportsByType,
  queryReportsForState,
} from "../../storage/reports";

vi.mock("../../libs/s3-lib", () => ({
  default: {
    getObject: vi.fn().mockResolvedValue({
      Body: {
        transformToByteArray: vi.fn().mockReturnValue("bytes"),
      },
    }),
  },
}));

const mockUseOfFundsReport: Report = {
  ...validReport,
  id: "mock-completed-report",
  pages: [
    {
      id: "root",
      childPageIds: ["mock-page-1"],
    },
    {
      id: "use-of-funds",
      elements: [
        {
          type: ElementType.UseOfFundsAttachment,
          answer: [
            {
              name: "use-of-funds-file",
              fileId: "use-of-funds-file",
            },
          ],
        } as UseOfFundsAttachmentTemplate,
      ],
    } as FormPageTemplate,
  ],
};

vi.mock("../../storage/reports");
const mockGetReport = vi
  .mocked(getReport)
  .mockResolvedValue(mockUseOfFundsReport);
const mockQueryByType = vi
  .mocked(queryReportsByType)
  .mockResolvedValue([mockUseOfFundsReport]);
const mockQueryByState = vi
  .mocked(queryReportsForState)
  .mockResolvedValue([mockUseOfFundsReport]);

const mockReport: Report = {
  ...validReport,
  id: "mock-report",
  pages: [
    {
      id: "root",
      childPageIds: ["mock-page-1"],
    },
    {
      id: "mock-attachment-table-page",
      elements: [
        {
          type: ElementType.AttachmentTable,
          answer: [{ attachment: { name: "mock-name" } }],
        } as AttachmentTableTemplate,
      ],
    } as FormPageTemplate,
    {
      id: "mock-attachment-area-page",
      elements: [
        {
          type: ElementType.AttachmentArea,
          answer: [{ name: "mock-name" }],
        } as AttachmentAreaTemplate,
      ],
    } as FormPageTemplate,
    ...mockStatePolicyCommitments,
  ],
};

describe("buildZip util", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("formatS3ReportZipKey", () => {
    const zipId = formatS3ZipKey("report-123");
    expect(zipId).toEqual("zips/report-123.zip");
  });
  test("sortElementsForZip", () => {
    const sort = sortElementsForZip(mockReport);
    expect(sort).toStrictEqual({
      initiative: {
        type: ElementType.AttachmentTable,
        answer: [{ attachment: { name: "mock-name" } }],
      },
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
      area: [
        {
          type: ElementType.AttachmentArea,
          answer: [{ name: "mock-name" }],
        },
      ],
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

  test("addReportFilesToZip", async () => {
    const mockZip = new JSZip();
    await addReportFilesToZip(mockReport, mockZip);
    expect(s3Lib.getObject).toHaveBeenCalled();
    expect(mockZip.files).toBeDefined();
  });

  test("addUseOfFundsFilesToZip without state", async () => {
    const mockZip = new JSZip();
    await addUseOfFundsFilesToZip(["A1"], mockZip);
    expect(mockZip.files).toBeDefined();
    expect(mockQueryByType).toHaveBeenCalled();
  });

  test("addUseOfFundsFilesToZip with state", async () => {
    const mockZip = new JSZip();
    await addUseOfFundsFilesToZip(["A1"], mockZip, "NJ");
    expect(mockGetReport).toHaveBeenCalled();
    expect(mockQueryByState).toHaveBeenCalled();
    expect(mockQueryByType).not.toHaveBeenCalled();
    expect(mockZip.files).toBeDefined();
  });
});
