import { uploadListPropSchema } from "./reportValidation";

describe("uploadListPropSchema", () => {
  test("accepts valid attachment with matching extensions", async () => {
    await expect(
      uploadListPropSchema.validate({
        name: "basic_image.png",
        size: 4318,
        fileId: "ABC123_basic_image.png",
      })
    ).resolves.toBeDefined();
  });

  test("rejects disallowed extension in name", async () => {
    await expect(
      uploadListPropSchema.validate({
        name: "basic_image.svg",
        size: 4318,
        fileId: "ABC123_malicious_image.svg",
      })
    ).rejects.toThrow("Unsupported file type");
  });

  test("rejects mismatched extensions between name and fileId", async () => {
    await expect(
      uploadListPropSchema.validate({
        name: "basic_image.png",
        size: 4318,
        fileId: "ABC123_basic_image.pdf",
      })
    ).rejects.toThrow("fileId extension must match name");
  });

  test("rejects disallowed extension in fileId", async () => {
    await expect(
      uploadListPropSchema.validate({
        name: "malware.exe",
        size: 100,
        fileId: "ABC123_malware.exe",
      })
    ).rejects.toThrow("Unsupported file type");
  });
});
