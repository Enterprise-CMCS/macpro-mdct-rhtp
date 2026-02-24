import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, UserRoles } from "../../types/types";
import { getSignedFileUrl } from "./createDownloadPsUrl";
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
  queryUpload: vi.fn(),
}));

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: `{"fileId":"mock-id"}`,
  pathParameters: { state: "PA", year: "2025" },
  headers: { "cognito-identity-id": "test" },
};

const mockUploadRespond = {
  Items: [{ uploadedState: "PA", fileId: "mock-id", awsFilename: "mockname" }],
};

describe("Test viewUploaded API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await getSignedFileUrl(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });
  test("undefined query returns error", async () => {
    (queryUpload as Mock).mockResolvedValueOnce({});
    const res = await getSignedFileUrl(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
  });
  test("successful create download ps url", async () => {
    (queryUpload as Mock).mockResolvedValueOnce(mockUploadRespond);
    const res = await getSignedFileUrl(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
