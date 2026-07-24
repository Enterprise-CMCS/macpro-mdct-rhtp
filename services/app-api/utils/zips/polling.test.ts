import { Mock } from "vitest";
import JSZip from "jszip";
import { mockClient } from "aws-sdk-client-mock";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { StatusCodes } from "../../libs/response-lib";
import s3Lib from "../../libs/s3-lib";
import { getPSURL, startZipWorker, zipBuffer } from "./polling";
import { ReportType, StateAbbr, ZipRequestTypes } from "@rhtp/shared";

const lambdaMock = mockClient(LambdaClient);
const mockInvoke = vi.fn();
lambdaMock.on(InvokeCommand).callsFake(mockInvoke);

vi.mock("../../libs/s3-lib", () => ({
  default: {
    getObjectTagging: vi.fn().mockResolvedValue(""),
    getSignedDownloadUrl: vi.fn().mockResolvedValue("https://s3.file.mock"),
    headObject: vi.fn(),
    putObject: vi.fn(),
  },
}));

const mockReportZipBody = {
  type: ZipRequestTypes.REPORT,
  report: {
    state: "NJ" as StateAbbr,
    reportType: ReportType.RHTP,
    id: "mock-report-id",
  },
};

const mockObligatedAndSpentFundsZipBody = {
  type: ZipRequestTypes.OBLIGATED_AND_SPENT_FUNDS,
  reportSubTypeKeys: ["A1"],
};

describe("polling utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("getPSURL", () => {
    test("getPSURL fails when no object found", async () => {
      (s3Lib.headObject as Mock).mockRejectedValueOnce("failed");
      const result = await getPSURL("zip-id-123");
      expect(result.statusCode).toBe(StatusCodes.Ok);
      expect(result.body).toEqual(JSON.stringify({ status: "pending" }));
    });

    test("getPSURL returns ready when complete", async () => {
      (s3Lib.headObject as Mock).mockResolvedValue({});
      const result = await getPSURL("zip-id-123");
      expect(result.statusCode).toBe(StatusCodes.Ok);
      expect(result.body).toEqual(
        JSON.stringify({ status: "ready", psurl: "https://s3.file.mock" })
      );
      expect(s3Lib.getSignedDownloadUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          ResponseContentDisposition: "attachment; filename=RHTP.zip",
        })
      );
    });

    test("getPSURL returns ready and assigns proper name when tagged", async () => {
      (s3Lib.headObject as Mock).mockResolvedValue({});
      (s3Lib.getObjectTagging as Mock).mockResolvedValueOnce({
        TagSet: [
          {
            Key: "state",
            Value: "NJ",
          },
          {
            Key: "subTypeKeys",
            Value: "A1",
          },
        ],
      });
      const result = await getPSURL("zip-id-123");
      expect(result.statusCode).toBe(StatusCodes.Ok);
      expect(result.body).toEqual(
        JSON.stringify({ status: "ready", psurl: "https://s3.file.mock" })
      );
      expect(s3Lib.getSignedDownloadUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          ResponseContentDisposition: "attachment; filename=RHTP_NJ_A1.zip",
        })
      );
    });
  });

  describe("zipBuffer", () => {
    test("zipBuffer works", async () => {
      const mockZip = new JSZip();
      await zipBuffer("zip-id-123", "tags", mockZip);
      expect(s3Lib.putObject).toHaveBeenCalled();
    });
  });

  describe("startZipWorker", () => {
    test("startZipWorker works for report type", async () => {
      const result = await startZipWorker(mockReportZipBody);
      expect(mockInvoke).toHaveBeenCalled();
      expect(result).toBeTypeOf("string");
    });

    test("startZipWorker works for obligated and spent funds type", async () => {
      const result = await startZipWorker(mockObligatedAndSpentFundsZipBody);
      expect(mockInvoke).toHaveBeenCalled();
      expect(result).toBeTypeOf("string");
    });

    test("startZipWorker throws error for invalid type", async () => {
      await expect(
        async () => await startZipWorker({ type: "invalid" } as any)
      ).rejects.toThrow("Type not recognized");
    });
  });
});
