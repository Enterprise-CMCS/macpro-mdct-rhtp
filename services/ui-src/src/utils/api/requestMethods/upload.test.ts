import { Mock } from "vitest";
import { apiLib } from "../apiLib";
import {
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
  getFileDownloadUrl,
  deleteUploadedFile,
  geFileBytes,
} from "./upload";
import { ReportType } from "types";

vi.mock("../apiLib", () => ({
  apiLib: {
    post: vi.fn(),
    put: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  },
}));

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });

let originalFetch = window.fetch;

describe("Test fileApi functions", () => {
  beforeAll(() => {
    window.fetch = vi.fn().mockResolvedValue("200 or whatever");
  });
  afterAll(() => {
    window.fetch = originalFetch;
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("recordFileInDatabaseAndGetUploadUrl", async () => {
    (apiLib.post as Mock).mockReturnValue({ psurl: "https://mock.url" });

    const result = await recordFileInDatabaseAndGetUploadUrl(
      "abc",
      ReportType.RHTP,
      "mock-id",
      mockPng
    );
    expect(result).toEqual({ presignedUploadUrl: "https://mock.url" });
  });
  test("uploadFileToS3", async () => {
    const mockPostData = { presignedUploadUrl: "mock.s3/url" };
    const result = await uploadFileToS3(mockPostData, mockPng);
    expect(result).toBe("200 or whatever");
  });
  test("getFileDownloadUrl", async () => {
    (apiLib.get as Mock).mockReturnValue({ psurl: "mock.s3/url" });
    const result = await getFileDownloadUrl("RHTP", "2025", "PA", "mock-id");
    expect(result).toBe("mock.s3/url");
  });
  test("deleteUploadedFile", async () => {
    (apiLib.del as Mock).mockReturnValue(Promise.resolve());
    await deleteUploadedFile("", "2025", "PA", "mock-id");
    expect(apiLib.del as Mock).toHaveBeenCalledWith(
      "/uploads/2025/PA/mock-id",
      {
        headers: { "x-api-key": undefined },
      }
    );
  });
  test("geFileBytes", async () => {
    const zipData = [{ name: "file-name", bytes: "abced" }];
    (apiLib.get as Mock).mockReturnValue(zipData);
    const result = await geFileBytes("2025", "PA", "mock-id");
    expect(result).toBe(zipData);
  });
});
