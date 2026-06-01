import { getBanners, createBanner, deleteBanner } from "./banner";
import { BannerAreas, BannerFormData } from "@rhtp/shared";
import { initAuthManager } from "utils/auth/authLifecycle";

const mockBanner: BannerFormData = {
  title: "RHTP Alert",
  area: BannerAreas.RHTP,
  description: "mock description",
  link: "https://example.com/rhtp-alert",
  startDate: "2026-01-01",
  endDate: "2027-01-01",
};

describe("utils/banner", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    initAuthManager();
    vi.runAllTimers();
  });

  describe("getBanners()", () => {
    test("executes", () => {
      expect(getBanners()).toBeTruthy();
    });
  });

  describe("createBanner()", () => {
    test("executes", () => {
      expect(createBanner(mockBanner)).toBeTruthy();
    });
  });

  describe("deleteBanner()", () => {
    test("executes", () => {
      expect(deleteBanner("mock-banner-id")).toBeTruthy();
    });
  });
});
