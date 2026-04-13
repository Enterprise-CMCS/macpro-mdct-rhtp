import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, UserRoles } from "../../types/types";
import { viewUploadsForState, getUpload, getByStateAndId } from "./get";
import { queryViewUploads, queryUpload } from "../../storage/upload";

vi.mock("../../utils/authentication", () => ({
  authenticatedUser: vi.fn().mockResolvedValue({
    role: UserRoles.ADMIN,
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

const mockViewUploadEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: `{}`,
  pathParameters: { state: "PA", year: "2025", fileId: "mock-id" },
  headers: { "cognito-identity-id": "test" },
};

const mockGetUploadEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: `{}`,
  pathParameters: { state: "PA", year: "2025", fileId: "mock-id" },
  headers: { "cognito-identity-id": "test" },
};

const mockUploadRespond = {
  Items: [
    {
      uploadedState: "PA",
      name: "name",
      fileId: "mock-id",
      awsFilename: "mockname",
    },
    {
      uploadedState: "PA",
      name: "name 2",
      fileId: "mock-id-2",
      awsFilename: "mockname 2",
    },
  ],
};

describe("Test get API methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("viewUploadsForState missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await viewUploadsForState(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });
  test("viewUploadsForState successful uploads fetch", async () => {
    (queryViewUploads as Mock).mockResolvedValueOnce(mockUploadRespond);
    const res = await viewUploadsForState(mockViewUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
  test("getUpload missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await getUpload(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });
  test("getUpload undefined query returns error", async () => {
    (queryUpload as Mock).mockResolvedValueOnce({});
    const res = await getUpload(mockGetUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
  });
  test("getUpload successful create download ps url", async () => {
    (queryUpload as Mock).mockResolvedValueOnce(mockUploadRespond);
    const res = await getUpload(mockGetUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
  test("getByStateAndId missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await getByStateAndId(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });
  test("getByStateAndId successful uploads fetch", async () => {
    (queryViewUploads as Mock).mockResolvedValueOnce(mockUploadRespond.Items);
    const res = await getByStateAndId(mockViewUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
