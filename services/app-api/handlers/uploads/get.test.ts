import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, UserRoles } from "../../types/types";
import { viewUploadsForState, getUpload } from "./get";
import { queryViewUpload, queryUpload } from "../../storage/upload";

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
  queryViewUpload: vi.fn(),
  queryUpload: vi.fn(),
}));

vi.mock("../../libs/s3-lib", () => ({
  default: {
    getSignedDownloadUrl: vi.fn(),
  },
}));

const mockViewUploadEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: `{"fileId":"mock-id"}`,
  pathParameters: { state: "PA", year: "2025" },
  headers: { "cognito-identity-id": "test" },
};

const mockGetUploadEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: `{}`,
  pathParameters: { state: "PA", year: "2025", fileId: "mock-id" },
  headers: { "cognito-identity-id": "test" },
};

const mockUploadRespond = {
  Items: [{ uploadedState: "PA", fileId: "mock-id", awsFilename: "mockname" }],
};

describe("Test viewUploaded API methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await viewUploadsForState(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });
  test("successful uploads fetch", async () => {
    (queryViewUpload as Mock).mockResolvedValueOnce(mockUploadRespond);
    const res = await viewUploadsForState(mockViewUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});

describe("Test getUpload API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await getUpload(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });
  test("undefined query returns error", async () => {
    (queryUpload as Mock).mockResolvedValueOnce({});
    const res = await getUpload(mockGetUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
  });
  test("successful create download ps url", async () => {
    (queryUpload as Mock).mockResolvedValueOnce(mockUploadRespond);
    const res = await getUpload(mockGetUploadEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
