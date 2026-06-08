import { Mock } from "vitest";
import { apiLib } from "../apiLib";
import {
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
  getFileDownloadUrl,
  deleteUploadedFile,
  getZipPresignedUrl,
} from "./fileMethods";
import { ReportType } from "@rhtp/shared";

vi.mock("../apiLib", () => ({
  apiLib: {
    post: vi.fn(),
    put: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  },
}));

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });
vi.spyOn(console, "log").mockImplementation(vi.fn()); // silence logs in test

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
      ReportType.RHTP,
      "PA",
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
    const result = await getFileDownloadUrl("RHTP", "PA", "mock-id", "2025");
    expect(result).toBe("mock.s3/url");
  });
  test("deleteUploadedFile", async () => {
    (apiLib.del as Mock).mockReturnValue(Promise.resolve());
    await deleteUploadedFile("RHTP", "PA", "mock-id", "mock-file-id");
    expect(apiLib.del as Mock).toHaveBeenCalledWith(
      "/reports/RHTP/PA/mock-id/files/mock-file-id",
      {
        headers: { "x-api-key": undefined },
      }
    );
  });
  test("getZipPresignedUrl", async () => {
    const mockUrl = {
      psurl: "https://example.com/report.zip",
      status: "ready",
    };
    (apiLib.get as Mock).mockReturnValue(mockUrl);
    const result = await getZipPresignedUrl("RHTP", "PA", "mock-id");
    expect(result).toBe(mockUrl.psurl);
  });
});
