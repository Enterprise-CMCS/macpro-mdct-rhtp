import { getFileWithSafeName } from "./fileUtils";

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
    test.each([
      ["70KB.PDF", "70KB.pdf"],
      ["Report.PdF", "Report.pdf"],
      ["Report.pdf", "Report.pdf"],
      ["Report.Final.DOCX", "Report.Final.docx"],
      ["Report#Final.PDF", "ReportFinal.pdf"],
      ["Report", "Report"],
    ])("normalizes only the extension of %s", (fileName, expectedName) => {
      const file = new File(["test"], fileName, {
        type: "application/octet-stream",
        lastModified: 123456789,
      });

      const result = getFileWithSafeName(file);

      expect(result.name).toEqual(expectedName);
      expect(result.size).toEqual(file.size);
      expect(result.type).toEqual(file.type);
      expect(result.lastModified).toEqual(file.lastModified);
      expect(file.name).toEqual(fileName);
    });
  });
});
