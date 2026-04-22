import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { putReport, queryReportsForState } from "../../storage/reports";
import { canWriteState } from "../../utils/authorization";
import { createReport } from "./create";
import { ReportStatus, RhtpSubType, UserRoles } from "@rhtp/shared";
import { RhtpSubTypeMap } from "../../utils/constants";
import { authenticatedUser } from "../../utils/authentication";
import { User } from "../../types/types";

vi.mock("../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.STATE_USER,
  state: "PA",
} as User);

vi.mock("../../utils/authorization", () => ({
  canWriteState: vi.fn().mockReturnValue(true),
}));

vi.mock("../../utils/reports/buildReport", () => ({
  buildReport: vi.fn().mockReturnValue({ id: "A report" }),
}));

vi.mock("../../storage/reports", () => ({
  putReport: vi.fn(),
  queryReportsForState: vi.fn().mockReturnValue([]),
}));

const testEvent = {
  queryStringParameters: {},
  pathParameters: { reportType: "RHTP", state: "PA" },
  headers: { "cognito-identity-id": "test" },
  body: JSON.stringify({}),
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

  test("should return 403 if user is not authorized", async () => {
    (canWriteState as Mock).mockReturnValueOnce(false);
    const response = await createReport(testEvent);
    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });

  test("should return 400 if invalid parameters passed", async () => {
    const invalidBodyEvent = {
      ...testEvent,
      body: JSON.stringify({ foo: "bar" }),
    };
    const response = await createReport(invalidBodyEvent);
    expect(response.statusCode).toBe(StatusCodes.BadRequest);
    expect(response.body).toBe("Invalid request");
  });

  test("Test successful create first report", async () => {
    const res = await createReport(testEvent);

    expect(putReport).toHaveBeenCalled();
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });

  test("Test cannot create next report if previous report is not submitted", async () => {
    (queryReportsForState as Mock).mockReturnValueOnce([
      {
        id: "123",
        year: 2026,
        subType: RhtpSubType.ANNUAL,
        subTypeKey: "A1",
        status: ReportStatus.IN_PROGRESS,
      },
    ]);

    const copyEvent = {
      ...testEvent,
      copyFromReportId: "123",
    };
    const res = await createReport(copyEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(res.body).toContain(
      "A new report cannot be created until the previous report is submitted."
    );
  });

  test("Test cannot create report after Final report", async () => {
    (queryReportsForState as Mock).mockReturnValueOnce([
      {
        id: "123",
        year: 2026,
        subType: RhtpSubType.FINAL,
        subTypeKey: "A1",
        status: ReportStatus.SUBMITTED,
      },
    ]);

    const copyEvent = {
      ...testEvent,
      copyFromReportId: "123",
    };
    const res = await createReport(copyEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(res.body).toContain(
      "End of reporting cycle. Cannot create more reports."
    );
  });

  test("Test cannot create next report if not past start date", async () => {
    // set date to right before allowed date to copy
    const date = new Date(RhtpSubTypeMap.Q1.startDate - 1);
    vi.setSystemTime(date);
    (queryReportsForState as Mock).mockReturnValueOnce([
      {
        id: "123",
        year: 2026,
        subType: RhtpSubType.ANNUAL,
        subTypeKey: "A1",
        status: ReportStatus.SUBMITTED,
      },
    ]);

    const copyEvent = {
      ...testEvent,
      copyFromReportId: "123",
    };
    const res = await createReport(copyEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(res.body).toContain("The next report cannot be created until");
  });

  test("Test successful create report after the first", async () => {
    // set date to after allowed date to copy
    const date = new Date(RhtpSubTypeMap.Q1.startDate + 1);
    vi.setSystemTime(date);
    (queryReportsForState as Mock).mockReturnValueOnce([
      {
        id: "123",
        year: 2026,
        subType: RhtpSubType.ANNUAL,
        subTypeKey: "A1",
        status: ReportStatus.SUBMITTED,
      },
    ]);

    const copyEvent = {
      ...testEvent,
      copyFromReportId: "123",
    };
    const res = await createReport(copyEvent);

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
