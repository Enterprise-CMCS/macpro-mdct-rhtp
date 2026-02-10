import { getBanner, writeBanner, deleteBanner } from "./banner";
import { bannerId } from "../../../constants";
import { mockBannerData } from "utils/testing/setupTest";
import { initAuthManager } from "utils/auth/authLifecycle";

describe("utils/banner", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    initAuthManager();
    vi.runAllTimers();
  });

  describe("getBanner()", () => {
    test("executes", () => {
      expect(getBanner(bannerId)).toBeTruthy();
    });
  });

  describe("writeBanner()", () => {
    test("executes", () => {
      expect(writeBanner(mockBannerData)).toBeTruthy();
    });
  });

  describe("deleteBanner()", () => {
    test("executes", () => {
      expect(deleteBanner(bannerId)).toBeTruthy();
    });
  });
});
