import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../types/types";
import { getBanners } from "./fetch";
import { authenticatedUser } from "../../utils/authentication";
import { BannerAreas, BannerShape, UserRoles } from "@rhtp/shared";
import { scanAllBanners } from "../../storage/banners";

vi.mock("../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.ADMIN,
  state: "PA",
} as User);

vi.mock("../../storage/banners", () => ({
  scanAllBanners: vi.fn(),
}));

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  headers: { "cognito-identity-id": "test" },
};

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

describe("Test fetchBanner API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Successful Banner Fetch", async () => {
    (scanAllBanners as Mock).mockResolvedValueOnce([mockBanner]);
    const res = await getBanners(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
    expect(JSON.parse(res.body as string)).toEqual([mockBanner]);
  });

  test("successful empty banner found fetch", async () => {
    (scanAllBanners as Mock).mockResolvedValueOnce([]);
    const res = await getBanners(testEvent);
    expect(res.body).toBe("[]");
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
