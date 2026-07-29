import { Mock } from "vitest";
import { acceptReport } from "./accept";
import { APIGatewayProxyEvent, User } from "../../types/types";
import { canReleaseReport } from "../../utils/authorization";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { ReportStatus, UserRoles } from "@rhtp/shared";
import { authenticatedUser } from "../../utils/authentication";
import { sendEmail } from "../../utils/notifications/email";

vi.mock("../../utils/authentication");
vi.mocked(authenticatedUser).mockReturnValue({
  role: UserRoles.ADMIN,
  state: "PA",
  fullName: "State User",
} as User);

vi.mock("../../utils/authorization", () => ({
  canReleaseReport: vi.fn().mockReturnValue(true),
}));

const mockGet = vi.fn().mockReturnValue({
  id: "A report",
  status: ReportStatus.SUBMITTED,
  name: "name",
});

vi.mock("../../storage/reports", () => ({
  getReport: () => mockGet(),
  putReport: vi.fn(),
}));

vi.mock("../../utils/notifications/email", () => ({
  sendEmail: vi.fn(),
}));

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  pathParameters: {
    reportType: "RHTP",
    state: "NJ",
    id: "2rRaoAFm8yLB2N2wSkTJ0iRTDu0",
  },
  headers: { "cognito-identity-id": "test" },
};

describe("Test acceptReport handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Test missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await acceptReport(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("should return 403 if user is not authorized", async () => {
    (canReleaseReport as Mock).mockReturnValueOnce(false);
    const response = await acceptReport(testEvent);
    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });

  test("Test submitted report", async () => {
    const res = await acceptReport(testEvent);

    expect(res.statusCode).toBe(StatusCodes.Ok);
    expect(sendEmail).toHaveBeenCalled();
  });
});
