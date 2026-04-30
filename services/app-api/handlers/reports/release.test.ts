import { Mock } from "vitest";
import { releaseReport } from "./release";
import { APIGatewayProxyEvent, User } from "../../types/types";
import { canReleaseReport } from "../../utils/authorization";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { ReportStatus, UserRoles } from "@rhtp/shared";
import { authenticatedUser } from "../../utils/authentication";

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

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  pathParameters: {
    reportType: "RHTP",
    state: "NJ",
    id: "2rRaoAFm8yLB2N2wSkTJ0iRTDu0",
  },
  headers: { "cognito-identity-id": "test" },
};

describe("Test releaseReport handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Test missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await releaseReport(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("should return 403 if user is not authorized", async () => {
    (canReleaseReport as Mock).mockReturnValueOnce(false);
    const response = await releaseReport(testEvent);
    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });

  test("Test unlocked report", async () => {
    mockGet.mockReturnValueOnce({
      id: "A report",
      status: ReportStatus.SUBMITTED,
    });
    const res = await releaseReport(testEvent);

    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
  test("Test successful lock of report", async () => {
    const res = await releaseReport(testEvent);

    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
