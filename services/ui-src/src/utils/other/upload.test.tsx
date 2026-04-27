import { getFileWithSafeName } from "./upload";

describe("test upload utils", () => {
  describe("getFileWithSafeName()", () => {
    test("creates file with safe name", () => {
      const file = new File(["test"], "name#needs%help.png", {
        type: "image/png",
      });
      const result = getFileWithSafeName(file);
      expect(result.name).toEqual("nameneedshelp.png");
    });
  });
});
