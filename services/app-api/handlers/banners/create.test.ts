import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { APIGatewayProxyEvent } from "../../types/types";
import { BannerAreas, BannerFormData, UserRoles } from "@rhtp/shared";
import { canWriteBanner } from "../../utils/authorization";
import { createBanner } from "./create";
import { error } from "../../utils/constants";
import { putBanner } from "../../storage/banners";

vi.mock("../../utils/authentication", () => ({
  authenticatedUser: vi.fn().mockReturnValue({
    role: UserRoles.ADMIN,
    state: "PA",
    fullName: "mock state user",
  }),
}));

vi.mock("../../utils/authorization", () => ({
  canWriteBanner: vi.fn().mockReturnValue(true),
}));

vi.mock("../../storage/banners");
const mockPutBanner = vi.mocked(putBanner);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

const mockBannerFormData: BannerFormData = {
  area: BannerAreas.Home,
  title: "mock title",
  description: "mock description",
  link: "https://example.com",
  startDate: "2026-03-01",
  endDate: "2026-03-06",
};

const mockEvent = {
  body: JSON.stringify(mockBannerFormData),
} as APIGatewayProxyEvent;

describe("Test createBanner API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("unauthorized banner creation throws 403 error", async () => {
    (canWriteBanner as Mock).mockReturnValueOnce(false);
    const res = await createBanner(mockEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
    expect(res.body).toContain(error.UNAUTHORIZED);
  });

  test("Successful Run of Banner Creation", async () => {
    const res = await createBanner(mockEvent);

    expect(res.statusCode).toBe(StatusCodes.Created);
    expect(mockPutBanner).toHaveBeenCalledWith({
      ...mockBannerFormData,
      key: expect.stringMatching(/^[0-9a-f\-]{36}$/),
      createdAt: expect.stringMatching(ISO_DATE_REGEX),
      createdBy: "mock state user",
    });
  });

  test("should return an error if the request body is invalid", async () => {
    const badEvent = {
      ...mockEvent,
      body: JSON.stringify({
        ...mockBannerFormData,
        link: "invalid url",
      }),
    };

    const res = await createBanner(badEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });
});
