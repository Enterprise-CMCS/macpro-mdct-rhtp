import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, UserRoles } from "../../types/types";
import { getUpload } from "./get";
import { queryUpload } from "../../storage/upload";

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
});
