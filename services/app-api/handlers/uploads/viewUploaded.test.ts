import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, UserRoles } from "../../types/types";
import { viewUploaded } from "./viewUploaded";
import { queryViewUpload } from "../../storage/upload";

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

describe("Test viewUploaded API methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await viewUploaded(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });
  test("successful uploads fetch", async () => {
    (queryViewUpload as Mock).mockResolvedValueOnce(mockUploadRespond);
    const res = await viewUploaded(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
