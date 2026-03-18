import { Mock } from "vitest";
import { createInitiative } from "./create";
import { StatusCodes } from "../../../libs/response-lib";
import { canWriteState } from "../../../utils/authorization";
import { authenticatedUser } from "../../../utils/authentication";
import { validReport } from "../../../utils/tests/mockReport";
import { ReportStatus } from "../../../types/reports";
import { APIGatewayProxyEvent, User, UserRoles } from "../../../types/types";
import { getReport, putReport } from "../../../storage/reports";
import { buildInitiativePages } from "../../../utils/reports/initiatives/initiatives";

vi.mock("../../../utils/authentication");
vi.mocked(authenticatedUser).mockReturnValue({
  role: UserRoles.STATE_USER,
  state: "PA",
  fullName: "State User",
} as User);

vi.mock("../../../utils/authorization", () => ({
  canWriteState: vi.fn().mockReturnValue(true),
}));

vi.mock(
  "../../../utils/reports/initiatives/initiatives",
  async (importOriginal) => ({
    ...(await importOriginal()),
    buildInitiativePages: vi.fn(),
  })
);
const mockBuildInitiatives = vi.mocked(buildInitiativePages);

vi.mock("../../../storage/reports");
const mockGetReport = vi.mocked(getReport);
const mockPutReport = vi.mocked(putReport);

vi.mock("../../../utils/reportValidation", async (importOriginal) => ({
  ...(await importOriginal()),
  validateReportPayload: vi.fn(),
}));

const testEvent = {
  queryStringParameters: {},
  pathParameters: { reportType: "RHTP", state: "PA", id: "RHTPPA123" },
  headers: { "cognito-identity-id": "test" },
  body: JSON.stringify({
    initiativeName: "Mock Initiative Name",
    initiativeNumber: "123",
    initiativeAttestation: true,
  }),
};

describe("Test create initiative handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Test missing path params", async () => {
    const badTestEvent = {
      ...testEvent,
      pathParameters: {},
    };
    const res = await createInitiative(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("should return 403 if user is not authorized", async () => {
    (canWriteState as Mock).mockReturnValueOnce(false);
    const response = await createInitiative(testEvent);
    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });

  test("Test missing body", async () => {
    const emptyBodyEvent = {
      ...testEvent,
      body: null,
    } as APIGatewayProxyEvent;
    const res = await createInitiative(emptyBodyEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("Test invalid body", async () => {
    const emptyBodyEvent = {
      ...testEvent,
      body: JSON.stringify({
        foo: "bar",
      }),
    } as APIGatewayProxyEvent;
    const res = await createInitiative(emptyBodyEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("Test not found if no matching report exists", async () => {
    mockGetReport.mockResolvedValue(undefined);
    const res = await createInitiative(testEvent);
    expect(res.statusCode).toBe(StatusCodes.NotFound);
  });

  test("Test throws error when matching report is submitted", async () => {
    mockGetReport.mockResolvedValue({
      ...validReport,
      status: ReportStatus.SUBMITTED,
    });
    const res = await createInitiative(testEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("Test successful create initiative", async () => {
    mockGetReport.mockResolvedValue(validReport);
    const res = await createInitiative(testEvent);

    expect(mockBuildInitiatives).toHaveBeenCalledWith(validReport, [
      expect.objectContaining({
        name: "Mock Initiative Name",
        initiativeNumber: "123",
      }),
    ]);
    expect(mockPutReport).toHaveBeenCalled();
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
