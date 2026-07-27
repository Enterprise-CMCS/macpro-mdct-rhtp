import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../types/types";
import { getUploadsByFileId } from "./get";
import { queryUpload } from "../../storage/upload";
import { authenticatedUser } from "../../utils/authentication";
import { UserRoles } from "@rhtp/shared";

const { mockGetObject, mockGetSignedDownloadUrl } = vi.hoisted(() => ({
  mockGetObject: vi.fn(),
  mockGetSignedDownloadUrl: vi.fn(),
}));

vi.mock("../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.ADMIN,
  state: "PA",
} as User);

vi.mock("../../storage/upload", () => ({
  queryViewUploads: vi.fn(),
  queryUpload: vi.fn(),
}));

const pdfBytes = new TextEncoder().encode("%PDF-1.4");

const svgBytes = new TextEncoder().encode(
  '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
);

vi.mock("../../libs/s3-lib", () => ({
  default: {
    getSignedDownloadUrl: mockGetSignedDownloadUrl,
    getObject: mockGetObject,
    putObject: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("../../storage/reports", () => ({
  getReport: vi.fn().mockReturnValue({
    pages: [
      { elements: [{ type: "attachmentTable", answer: [{ attachment: [] }] }] },
      {
        elements: [
          {
            type: "accordionGroup",
            accordions: [
              { children: [{ type: "attachmentArea", answer: [] }] },
            ],
          },
        ],
      },
    ],
  }),
}));

const mockGetUploadEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: `{}`,
  pathParameters: {
    state: "PA",
    reportType: "RHTP",
    id: "mock-id",
    fileId: "mock-id_test.pdf",
  },
  headers: { "cognito-identity-id": "test" },
};

const mockUploadDocument = {
  uploadedState: "PA",
  filename: "test.pdf",
  fileId: "mock-id_test.pdf",
};

describe("Test get API methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSignedDownloadUrl.mockResolvedValue("https://awstest.com/presigned");
    mockGetObject.mockResolvedValue({
      Body: {
        transformToByteArray: () => Promise.resolve(pdfBytes),
      },
    });
  });

  test("getUploadsByFileId missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await getUploadsByFileId(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("getUploadsByFileId undefined query returns error", async () => {
    (queryUpload as Mock).mockResolvedValueOnce({});
    const res = await getUploadsByFileId(mockGetUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
  });

  test("getUploadsByFileId successful create download ps url", async () => {
    (queryUpload as Mock).mockResolvedValueOnce({
      Items: [mockUploadDocument],
    });
    const res = await getUploadsByFileId(mockGetUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
    expect(mockGetObject).toHaveBeenCalled();
    expect(mockGetSignedDownloadUrl).toHaveBeenCalled();
  });

  test("getUploadsByFileId returns presigned url when pdf content matches filename and fileId", async () => {
    const fileId = "3GaXnRN9MXXW7TJebIzJu8ccwWe_report.pdf";
    const uploadDocument = {
      uploadedState: "PA",
      filename: "report.pdf",
      fileId,
    };
    const event: APIGatewayProxyEvent = {
      ...mockGetUploadEvent,
      pathParameters: {
        ...mockGetUploadEvent.pathParameters,
        fileId,
      },
    };

    (queryUpload as Mock).mockResolvedValueOnce({ Items: [uploadDocument] });

    const res = await getUploadsByFileId(event);

    expect(res.statusCode).toBe(StatusCodes.Ok);
    expect(queryUpload).toHaveBeenCalledWith(fileId, "PA");
    expect(mockGetObject).toHaveBeenCalledWith({
      Key: "RHTP/PA/mock-id/3GaXnRN9MXXW7TJebIzJu8ccwWe_report.pdf",
      Range: "bytes=0-4100",
    });
    expect(mockGetSignedDownloadUrl).toHaveBeenCalledWith({
      Key: "RHTP/PA/mock-id/3GaXnRN9MXXW7TJebIzJu8ccwWe_report.pdf",
      ResponseContentDisposition: "attachment; filename = report.pdf",
    });
    expect(JSON.parse(res.body as string)).toEqual({
      psurl: "https://awstest.com/presigned",
    });
  });

  test("getUploadsByFileId rejects content that does not match extension", async () => {
    (queryUpload as Mock).mockResolvedValueOnce({
      Items: [
        {
          ...mockUploadDocument,
          filename: "test.png",
          fileId: "mock-id_test.png",
        },
      ],
    });
    mockGetObject.mockResolvedValueOnce({
      Body: {
        transformToByteArray: () => Promise.resolve(svgBytes),
      },
    });
    const res = await getUploadsByFileId(mockGetUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
    expect(mockGetSignedDownloadUrl).not.toHaveBeenCalled();
  });

  test("getUploadsByFileId returns forbidden when s3 object is missing", async () => {
    (queryUpload as Mock).mockResolvedValueOnce({
      Items: [mockUploadDocument],
    });
    mockGetObject.mockRejectedValueOnce(new Error("NoSuchKey"));
    const res = await getUploadsByFileId(mockGetUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
    expect(mockGetSignedDownloadUrl).not.toHaveBeenCalled();
  });
});
