import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { putReport } from "../../storage/reports";
import { UserRoles } from "../../types/types";
import { canWriteState } from "../../utils/authorization";
import { createReport } from "./create";

vi.mock("../../utils/authentication", () => ({
  authenticatedUser: vi.fn().mockResolvedValue({
    role: UserRoles.STATE_USER,
    state: "PA",
  }),
}));

vi.mock("../../utils/authorization", () => ({
  canWriteState: vi.fn().mockReturnValue(true),
}));

vi.mock("../../utils/reports/buildReport", () => ({
  buildReport: vi.fn().mockReturnValue({ id: "A report" }),
}));

vi.mock("../../storage/reports", () => ({
  putReport: vi.fn(),
}));

const testEvent = {
  queryStringParameters: {},
  pathParameters: { reportType: "RHTP", state: "PA" },
  headers: { "cognito-identity-id": "test" },
  body: JSON.stringify({
    year: 2026,
    name: "test report",
  }),
};

describe("Test create report handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Test missing path params", async () => {
    const badTestEvent = {
      ...testEvent,
      pathParameters: {},
    };
    const res = await createReport(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  it("should return 403 if user is not authorized", async () => {
    (canWriteState as Mock).mockReturnValueOnce(false);
    const response = await createReport(testEvent);
    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });

  test("Test missing body", async () => {
    const emptyBodyEvent = {
      ...testEvent,
      pathParameters: { reportType: "RHTP", state: "PA" },
      body: null,
    };
    const res = await createReport(emptyBodyEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("Test Successful create", async () => {
    const res = await createReport(testEvent);

    expect(putReport).toHaveBeenCalled();
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});

test("Test invalid report type", async () => {
  const invalidDataEvent = {
    ...testEvent,
    pathParameters: { reportType: "BM", state: "NM" },
  };
  const res = await createReport(invalidDataEvent);
  expect(res.statusCode).toBe(StatusCodes.BadRequest);
});
