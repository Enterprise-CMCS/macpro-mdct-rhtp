import { Mock } from "vitest";
import { updateInitiative } from "./update";
import { StatusCodes } from "../../../libs/response-lib";
import { canWriteInitiatives } from "../../../utils/authorization";
import { authenticatedUser } from "../../../utils/authentication";
import { validReport } from "../../../utils/tests/mockReport";
import {
  FormPageTemplate,
  PageStatus,
  PageType,
  ReportStatus,
  UserRoles,
} from "@rhtp/shared";
import { APIGatewayProxyEvent, User } from "../../../types/types";
import { getReport, putReport } from "../../../storage/reports";

vi.mock("../../../utils/authentication");
vi.mocked(authenticatedUser).mockReturnValue({
  role: UserRoles.STATE_USER,
  state: "PA",
  fullName: "State User",
} as User);

vi.mock("../../../utils/authorization", () => ({
  canWriteInitiatives: vi.fn().mockReturnValue(true),
}));

vi.mock("../../../storage/reports");
const mockGetReport = vi.mocked(getReport);
const mockPutReport = vi.mocked(putReport);

vi.mock("../../../utils/reportValidation", async (importOriginal) => ({
  ...(await importOriginal()),
  validateReportPayload: vi.fn((input) => input),
}));

const testEvent = {
  queryStringParameters: {},
  pathParameters: {
    reportType: "RHTP",
    state: "PA",
    id: "RHTPPA123",
    initiativeId: "mock-initiative-name-123",
  },
  headers: { "cognito-identity-id": "test" },
  body: JSON.stringify({
    initiativeAbandon: true,
  }),
};

describe("Test update initiative handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Test missing path params", async () => {
    const badTestEvent = {
      ...testEvent,
      pathParameters: {},
    };
    const res = await updateInitiative(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("should return 403 if user is not authorized", async () => {
    (canWriteInitiatives as Mock).mockReturnValueOnce(false);
    const response = await updateInitiative(testEvent);
    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });

  test("Test missing body", async () => {
    const emptyBodyEvent = {
      ...testEvent,
      body: null,
    } as APIGatewayProxyEvent;
    const res = await updateInitiative(emptyBodyEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("Test invalid body", async () => {
    const emptyBodyEvent = {
      ...testEvent,
      body: JSON.stringify({
        foo: "bar",
      }),
    } as APIGatewayProxyEvent;
    const res = await updateInitiative(emptyBodyEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("Test not found if no matching report exists", async () => {
    mockGetReport.mockResolvedValue(undefined);
    const res = await updateInitiative(testEvent);
    expect(res.statusCode).toBe(StatusCodes.NotFound);
  });

  test("Test throws error when matching report is submitted", async () => {
    mockGetReport.mockResolvedValue({
      ...validReport,
      status: ReportStatus.SUBMITTED,
    });
    const res = await updateInitiative(testEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  test("Test successful update initiative name and status", async () => {
    mockGetReport.mockResolvedValue({
      ...validReport,
      pages: [
        ...validReport.pages,
        {
          id: "mock-initiative-name-123",
          title: "Mock Initiative Name",
          type: PageType.Standard,
        } as FormPageTemplate,
      ],
    });
    const res = await updateInitiative(testEvent);

    expect(mockPutReport).toHaveBeenCalled();
    expect(mockPutReport).toHaveBeenCalledWith(
      expect.objectContaining({
        pages: expect.arrayContaining([
          expect.objectContaining({
            id: "mock-initiative-name-123",
            title: "Mock Initiative Name",
            status: PageStatus.ABANDONED,
          }),
        ]),
      })
    );
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
