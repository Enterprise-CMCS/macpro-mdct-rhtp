import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent } from "../../types/types";
import { getUploadsByFileId, getUploadsByReportId } from "./get";
import { queryUpload } from "../../storage/upload";

vi.mock("../../utils/authentication", () => ({
  authenticatedUser: vi.fn().mockResolvedValue({
    role: "mdctrhtp-bor",
    state: "PA",
  }),
}));

vi.mock("../../utils/authorization", () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
}));

vi.mock("../../storage/upload", () => ({
  queryViewUploads: vi.fn(),
  queryUpload: vi.fn(),
}));

vi.mock("../../libs/s3-lib", () => ({
  default: {
    getSignedDownloadUrl: vi.fn(),
    getObject: vi.fn().mockReturnValue([]),
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
    fileId: "mock-id",
  },
  headers: { "cognito-identity-id": "test" },
};

const mockUploadRespond = {
  Items: [
    {
      uploadedState: "PA",
      name: "name",
      fileId: "mock-id",
    },
    {
      uploadedState: "PA",
      name: "name 2",
      fileId: "mock-id-2",
    },
  ],
};

describe("Test get API methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    (queryUpload as Mock).mockResolvedValueOnce(mockUploadRespond);
    const res = await getUploadsByFileId(mockGetUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });

  test("getUploadsByReportId missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await getUploadsByReportId(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });
  test("getUploadsByReportId is successful ", async () => {
    const res = await getUploadsByReportId(mockGetUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
