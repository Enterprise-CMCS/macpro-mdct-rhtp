import { StatusCodes } from "../../libs/response-lib";
import sesLib from "../../libs/ses-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent } from "../../types/types";
import { sendEmail } from "./sendEmail";

vi.mock("../../utils/authentication", () => ({
  authenticatedUser: vi.fn().mockResolvedValue({
    role: "admin",
    state: "PA",
  }),
}));

vi.mock("../../utils/authorization", () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
}));

vi.mock("../../libs/ses-lib", () => ({
  default: {
    sendSesEmail: vi.fn(),
  },
}));

const validEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  headers: { "cognito-identity-id": "test" },
  pathParameters: {
    state: "PA",
    reportType: "RHTP",
    id: "mock-id",
  },
  body: JSON.stringify({}),
};

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should send an email and return 200 on success", async () => {
    const res = await sendEmail(validEvent);
    expect(sesLib.sendSesEmail).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
