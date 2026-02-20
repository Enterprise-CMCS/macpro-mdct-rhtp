import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, UserRoles } from "../../types/types";
import { canWriteState } from "../../utils/authorization";
import { validReport } from "../../utils/tests/mockReport";
import { submitReport } from "./submit";

vi.mock("../../utils/authentication", () => ({
  authenticatedUser: vi.fn().mockResolvedValue({
    role: UserRoles.STATE_USER,
    state: validReport.state,
    fullName: "myname",
  }),
}));

vi.mock("../../utils/authorization", () => ({
  canWriteState: vi.fn().mockReturnValue(true),
}));

vi.mock("../../storage/reports", () => ({
  putReport: () => vi.fn(),
}));

const invalidReport = JSON.stringify({
  type: "RHTP",
  state: "PA",
  id: "RHTPPA123",
});
const report = JSON.stringify(validReport);

const validPath = {
  reportType: validReport.type,
  state: validReport.state,
  id: validReport.id,
};
const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  pathParameters: validPath,
  headers: { "cognito-identity-id": "test" },
  body: report,
};

describe("Test submit report handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Test missing path params", async () => {
    const badTestEvent = {
      ...proxyEvent,
      pathParameters: {},
    } as APIGatewayProxyEvent;
    const res = await submitReport(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  it("should return 403 if user is not authorized", async () => {
    (canWriteState as Mock).mockReturnValueOnce(false);
    const response = await submitReport(testEvent);
    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });

  test("Test missing body", async () => {
    const emptyBodyEvent = {
      ...proxyEvent,
      pathParameters: validPath,
      body: null,
    } as APIGatewayProxyEvent;
    const res = await submitReport(emptyBodyEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("Test invalid report", async () => {
    const emptyBodyEvent = {
      ...proxyEvent,
      pathParameters: validPath,
      body: invalidReport,
    } as APIGatewayProxyEvent;
    const res = await submitReport(emptyBodyEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("Test body + param mismatch", async () => {
    const badType = {
      ...proxyEvent,
      pathParameters: { ...validPath, reportType: "ZZ" },
      body: report,
    } as APIGatewayProxyEvent;
    const badState = {
      ...proxyEvent,
      pathParameters: validPath,
      body: JSON.stringify({ ...validReport, state: "OR" }),
    } as APIGatewayProxyEvent;
    const badId = {
      ...proxyEvent,
      pathParameters: { ...validPath, id: "ZZOR1234" },
      body: report,
    } as APIGatewayProxyEvent;

    const resType = await submitReport(badType);
    expect(resType.statusCode).toBe(StatusCodes.BadRequest);
    const resState = await submitReport(badState);
    expect(resState.statusCode).toBe(StatusCodes.BadRequest);
    const resId = await submitReport(badId);
    expect(resId.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("Test Successful submit", async () => {
    const res = await submitReport(testEvent);

    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
