import {
  getExtension,
  isAllowedFileExtension,
  validateFileContentMatchesExtension,
} from "./fileContentValidation";

describe("fileContentValidation util", () => {
  describe("validateFileContentMatchesExtension", () => {
    test("allows plain text content for .txt when no magic bytes are detected", async () => {
      const buffer = new TextEncoder().encode("name,value\nfoo,bar");
      await expect(
        validateFileContentMatchesExtension(buffer, ".txt")
      ).resolves.toBe(true);
    });

    test("rejects binary content spoofed as .txt", async () => {
      const buffer = new TextEncoder().encode("%PDF-1.4");
      await expect(
        validateFileContentMatchesExtension(buffer, ".txt")
      ).resolves.toBe(false);
    });

    test("rejects svg content spoofed as .csv", async () => {
      const buffer = new TextEncoder().encode(
        '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
      );
      await expect(
        validateFileContentMatchesExtension(buffer, ".csv")
      ).resolves.toBe(false);
    });

    test("rejects html content spoofed as .txt", async () => {
      const buffer = new TextEncoder().encode(
        "<!DOCTYPE html><html><body>hi</body></html>"
      );
      await expect(
        validateFileContentMatchesExtension(buffer, ".txt")
      ).resolves.toBe(false);
    });

    test("rejects windows executable magic bytes spoofed as .csv via file-type", async () => {
      // MZ executable header bytes (0x4D, 0x5A, 0x90, 0x00)
      const buffer = new Uint8Array([77, 90, 144, 0]);
      await expect(
        validateFileContentMatchesExtension(buffer, ".csv")
      ).resolves.toBe(false);
    });

    test("rejects shell script shebang spoofed as .txt", async () => {
      const buffer = new TextEncoder().encode("#!/bin/bash\necho hi");
      await expect(
        validateFileContentMatchesExtension(buffer, ".txt")
      ).resolves.toBe(false);
    });

    test("allows pdf content for .pdf extension", async () => {
      const buffer = new TextEncoder().encode("%PDF-1.4");
      await expect(
        validateFileContentMatchesExtension(buffer, ".pdf")
      ).resolves.toBe(true);
    });

    test("rejects svg content for .png extension", async () => {
      const buffer = new TextEncoder().encode(
        '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
      );
      await expect(
        validateFileContentMatchesExtension(buffer, ".png")
      ).resolves.toBe(false);
    });

    test("rejects html content for .png extension via mime mismatch", async () => {
      const buffer = new TextEncoder().encode(
        "<!DOCTYPE html><html><script>alert(1)</script></html>"
      );
      await expect(
        validateFileContentMatchesExtension(buffer, ".png")
      ).resolves.toBe(false);
    });
  });
  describe("isAllowedFileExtension", () => {
    test.each([
      [".jpg", true],
      [".xls", true],
      [".pdf", true],
      [".PDF", true],
      [".fake", false],
      [".jar", false],
      [".zip", false],
      [".sh", false],
    ])("%s returns %b in allowed file extension test", (fileName, result) => {
      expect(isAllowedFileExtension(fileName)).toEqual(result);
    });
  });
  describe("getExtension", () => {
    test.each([
      ["foo.jpg", ".jpg"],
      ["foo.bar.xls", ".xls"],
      ["foo.PDF", ".pdf"],
      ["foo", undefined],
    ])("%s has %s extension", (fileName, extension) => {
      expect(getExtension(fileName)).toEqual(extension);
    });
  });
});
