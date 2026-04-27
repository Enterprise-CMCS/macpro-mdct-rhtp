import { getFileWithSafeName } from "./upload";

describe("test upload utils", () => {
  describe("getFileWithSafeName()", () => {
    test("creates file with safe name", () => {
      const fileName = "name#needs%help.png";
      const file = new File(["test"], fileName, {
        type: "image/png",
      });
      const result = getFileWithSafeName(file);
      expect(result.name).toEqual("nameneedshelp.png");
    });
  });
});
