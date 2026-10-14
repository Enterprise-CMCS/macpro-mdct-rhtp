import { Mock } from "vitest";
import { apiLib } from "../apiLib";
import {
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
  getFileDownloadUrl,
  deleteUploadedFile,
  getZipPresignedUrl,
} from "./fileMethods";
import { ReportType, StateAbbr, ZipRequestTypes } from "@rhtp/shared";

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
    window.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
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
    expect(result).toEqual({ ok: true, status: 200 });
    expect(window.fetch).toHaveBeenCalledWith("mock.s3/url", {
      method: "PUT",
      body: mockPng,
    });
  });
  test("uploadFileToS3 rejects HTTP failures", async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response);
    await expect(
      uploadFileToS3({ presignedUploadUrl: "mock.s3/url" }, mockPng)
    ).rejects.toThrow("File upload failed with status 403");
  });
  test("uploadFileToS3 rejects network failures", async () => {
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error("Network error"));
    await expect(
      uploadFileToS3({ presignedUploadUrl: "mock.s3/url" }, mockPng)
    ).rejects.toThrow("Network error");
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
    const requestBody = {
      type: ZipRequestTypes.REPORT,
      report: {
        reportType: ReportType.RHTP,
        state: "PA" as StateAbbr,
        id: "mock-id",
      },
    };
    const result = await getZipPresignedUrl(requestBody);
    expect(result).toBe(mockUrl.psurl);
  });
});
