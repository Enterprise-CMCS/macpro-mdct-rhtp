import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../types/types";
import { canWriteBanner } from "../../utils/authorization";
import { updateBanner } from "./update";
import { error } from "../../utils/constants";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { authenticatedUser } from "../../utils/authentication";
import { BannerAreas, BannerShape, UserRoles } from "@rhtp/shared";

const dynamoClientMock = mockClient(DynamoDBDocumentClient);

vi.mock("../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.ADMIN,
  state: "PA",
} as User);

vi.mock("../../utils/authorization", () => ({
  canWriteBanner: vi.fn().mockReturnValue(true),
}));

const mockBanner: BannerShape = {
  key: "889c059a-54fe-4331-8d31-3d8e91665806", // #gitleaks:allow
  area: BannerAreas.Home,
  title: "mock title",
  description: "mock description",
  link: "https://example.com",
  startDate: "2026-03-01",
  endDate: "2026-03-06",
  createdAt: "2026-02-18T13:55:53.735Z",
  createdBy: "mock username",
};

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  headers: { "cognito-identity-id": "test" },
  body: JSON.stringify(mockBanner),
  pathParameters: { bannerId: "testKey" },
};

describe("Test updateBanner API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("not authorized to update banner throws 403 error", async () => {
    (canWriteBanner as Mock).mockReturnValueOnce(false);
    const res = await updateBanner(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
    expect(res.body).toContain(error.UNAUTHORIZED);
  });

  test("Successful Banner Update", async () => {
    const mockUpdate = vi.fn();
    dynamoClientMock.on(PutCommand).callsFake(mockUpdate);
    const res = await updateBanner(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
    expect(mockUpdate).toHaveBeenCalled();
  });

  test("bannerKey not provided throws 500 error", async () => {
    const noKeyEvent: APIGatewayProxyEvent = {
      ...testEvent,
      pathParameters: {},
    };
    const res = await updateBanner(noKeyEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(res.body).toContain(error.MISSING_DATA);
  });

  test("bannerKey empty throws 500 error", async () => {
    const noKeyEvent: APIGatewayProxyEvent = {
      ...testEvent,
      pathParameters: { bannerId: "" },
    };
    const res = await updateBanner(noKeyEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(res.body).toContain(error.MISSING_DATA);
  });
});
