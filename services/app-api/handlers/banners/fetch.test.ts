import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, UserRoles } from "../../types/types";
import { fetchBanner } from "./fetch";
import { error } from "../../utils/constants";
import { getBanner } from "../../storage/banners";
import { mockBannerResponse } from "../../testing/setupTest";

vi.mock("../../utils/authentication", () => ({
  authenticatedUser: vi.fn().mockResolvedValue({
    role: UserRoles.ADMIN,
    state: "PA",
  }),
}));

vi.mock("../../utils/authorization", () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
}));

vi.mock("../../storage/banners", () => ({
  getBanner: vi.fn(),
}));

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  headers: { "cognito-identity-id": "test" },
  pathParameters: { bannerId: "admin-banner-id" },
};

describe("Test fetchBanner API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Successful Banner Fetch", async () => {
    (getBanner as Mock).mockResolvedValueOnce(mockBannerResponse);
    const res = await fetchBanner(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
    expect(res.body).toContain("testDesc");
    expect(res.body).toContain("testTitle");
  });

  test("successful empty banner found fetch", async () => {
    (getBanner as Mock).mockResolvedValueOnce(undefined);
    const res = await fetchBanner(testEvent);
    expect(res.body).not.toBeDefined();
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });

  test("bannerKey not provided throws 500 error", async () => {
    const noKeyEvent: APIGatewayProxyEvent = {
      ...testEvent,
      pathParameters: {},
    };
    const res = await fetchBanner(noKeyEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(res.body).toContain(error.MISSING_DATA);
  });

  test("bannerKey empty throws 500 error", async () => {
    const noKeyEvent: APIGatewayProxyEvent = {
      ...testEvent,
      pathParameters: { bannerId: "" },
    };
    const res = await fetchBanner(noKeyEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(res.body).toContain(error.MISSING_DATA);
  });
});
