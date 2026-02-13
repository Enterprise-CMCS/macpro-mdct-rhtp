import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, UserRoles } from "../../types/types";
import { canReadState } from "../../utils/authorization";
import { getReport, getReportsForState } from "./get";

vi.mock("../../utils/authentication", () => ({
  authenticatedUser: vi.fn().mockResolvedValue({
    role: UserRoles.STATE_USER,
    state: "PA",
  }),
}));

vi.mock("../../utils/authorization", () => ({
  canReadState: vi.fn().mockReturnValue(true),
}));

vi.mock("../../storage/reports", () => ({
  getReport: vi.fn().mockReturnValue({ id: "A report" }),
  queryReportsForState: vi.fn().mockReturnValue([{ id: "A report" }]),
}));

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  pathParameters: {
    reportType: "RHTP",
    state: "PA",
    id: "myVeryFavoriteReport",
  },
  headers: { "cognito-identity-id": "test" },
};

describe("Test get report handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getReport", () => {
    test("Test missing path params", async () => {
      const badTestEvent: APIGatewayProxyEvent = {
        ...proxyEvent,
        headers: { "cognito-identity-id": "test" },
      };
      const res = await getReport(badTestEvent);
      expect(res.statusCode).toBe(StatusCodes.BadRequest);
    });

    it("should return 403 if user is not authorized", async () => {
      (canReadState as Mock).mockReturnValueOnce(false);
      const response = await getReport(testEvent);
      expect(response.statusCode).toBe(StatusCodes.Forbidden);
    });

    test("Test Successful get", async () => {
      const res = await getReport(testEvent);

      expect(res.statusCode).toBe(StatusCodes.Ok);
    });
  });

  describe("getReportsForState", () => {
    test("Test missing path params", async () => {
      const badTestEvent: APIGatewayProxyEvent = {
        ...proxyEvent,
        headers: { "cognito-identity-id": "test" },
      };
      const res = await getReportsForState(badTestEvent);
      expect(res.statusCode).toBe(StatusCodes.BadRequest);
    });

    it("should return 403 if user is not authorized", async () => {
      (canReadState as Mock).mockReturnValueOnce(false);
      const response = await getReportsForState(testEvent);
      expect(response.statusCode).toBe(StatusCodes.Forbidden);
    });

    test("Test Successful get", async () => {
      const res = await getReportsForState(testEvent);

      expect(res.statusCode).toBe(StatusCodes.Ok);
    });
  });
});
