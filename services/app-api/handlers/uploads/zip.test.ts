import { ok, StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../types/types";
import {
  triggerZipGeneration,
  getZipStatus,
  zipWorker,
  ZipReportWorkerEvent,
  ZipUseOfFundsWorkerEvent,
} from "./zip";
import { authenticatedUser } from "../../utils/authentication";
import { ReportType, UserRoles, ZipRequestTypes } from "@rhtp/shared";
import { getPSURL, zipBuffer } from "../../utils/zips/polling";
import { getReport } from "../../storage/reports";
import {
  addReportFilesToZip,
  addUseOfFundsFilesToZip,
} from "../../utils/zips/buildZip";

vi.mock("../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.ADMIN,
  state: "PA",
} as User);

vi.mock("../../utils/zips/polling", () => ({
  getPSURL: vi.fn(),
  startZipWorker: vi.fn().mockReturnValue("zip-id-123"),
  zipBuffer: vi.fn(),
}));

vi.mock("../../utils/zips/buildZip", () => ({
  addReportFilesToZip: vi.fn(),
  addUseOfFundsFilesToZip: vi.fn(),
}));

vi.mock("../../storage/reports", () => ({
  getReport: vi.fn().mockReturnValue({
    pages: [
      {
        elements: [
          {
            type: "attachmentTable",
            answer: [
              {
                attachment: [
                  { name: "mockName", size: 123, fileId: "mock-id" },
                ],
              },
            ],
          },
        ],
      },
      {
        elements: [
          {
            type: "accordionGroup",
            accordions: [
              {
                elements: [
                  {
                    type: "attachmentArea",
                    answer: [
                      {
                        name: "mockNameAccordion",
                        size: 123,
                        fileId: "mock-id-accordion",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
}));

const mockTriggerReportZipEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: JSON.stringify({
    type: ZipRequestTypes.REPORT,
    report: {
      state: "PA",
      reportType: "RHTP",
      id: "mock-id",
    },
  }),
  headers: { "cognito-identity-id": "test" },
};

const mockTriggerUseOfFundsZipEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: JSON.stringify({
    type: ZipRequestTypes.USE_OF_FUNDS,
    state: "PA",
    reportSubTypeKeys: ["A1", "Q1"],
  }),
  headers: { "cognito-identity-id": "test" },
};

const mockGetZipEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: `{}`,
  headers: { "cognito-identity-id": "test" },
  pathParameters: { id: "zip-id-123" },
};

const mockZipWorkerReportEvent: ZipReportWorkerEvent = {
  type: ZipRequestTypes.REPORT,
  zipId: "zip-id-123",
  reportType: ReportType.RHTP,
  state: "PA",
  id: "report-id-123",
};

const mockZipWorkerUseOfFundsEvent: ZipUseOfFundsWorkerEvent = {
  type: ZipRequestTypes.USE_OF_FUNDS,
  zipId: "zip-id-123",
  state: "PA",
  reportSubTypeKeys: ["A1", "Q1"],
};

describe("Test zip methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("triggerZipGeneration method", () => {
    test("missing path params", async () => {
      const badTestEvent = {
        ...proxyEvent,
        pathParameters: {},
      } as APIGatewayProxyEvent;
      const res = await triggerZipGeneration(badTestEvent);
      expect(res.statusCode).toBe(StatusCodes.BadRequest);
    });

    test("returns proper response for report event", async () => {
      const res = await triggerZipGeneration(mockTriggerReportZipEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(res.body).toEqual(
        JSON.stringify({
          status: "pending",
          zipId: "zip-id-123",
        })
      );
    });

    test("returns proper response for use of funds event with state", async () => {
      const res = await triggerZipGeneration(mockTriggerUseOfFundsZipEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(res.body).toEqual(
        JSON.stringify({
          status: "pending",
          zipId: "zip-id-123",
        })
      );
    });
  });

  describe("getZipStatus method", () => {
    test("missing path params", async () => {
      const badTestEvent = {
        ...proxyEvent,
        pathParameters: {},
      } as APIGatewayProxyEvent;
      const res = await getZipStatus(badTestEvent);
      expect(res.statusCode).toBe(StatusCodes.BadRequest);
    });

    test("returns proper response if file does not exist", async () => {
      vi.mocked(getPSURL).mockResolvedValueOnce(ok({ status: "pending" }));
      const res = await getZipStatus(mockGetZipEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(res.body).toBe(JSON.stringify({ status: "pending" }));
    });

    test("returns proper response if file exists", async () => {
      vi.mocked(getPSURL).mockResolvedValueOnce(
        ok({ status: "ready", psurl: "https://example.com/presigned" })
      );
      const res = await getZipStatus(mockGetZipEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(res.body).toBe(
        JSON.stringify({
          status: "ready",
          psurl: "https://example.com/presigned",
        })
      );
    });
  });

  describe("zipWorker method", () => {
    test("report worker event", async () => {
      await zipWorker(mockZipWorkerReportEvent);
      expect(vi.mocked(getReport)).toHaveBeenCalledOnce();
      expect(vi.mocked(addReportFilesToZip)).toHaveBeenCalledOnce();
      expect(vi.mocked(zipBuffer)).toHaveBeenCalledOnce();
    });

    test("use of funds worker event", async () => {
      await zipWorker(mockZipWorkerUseOfFundsEvent);
      expect(vi.mocked(getReport)).not.toHaveBeenCalled();
      expect(vi.mocked(addUseOfFundsFilesToZip)).toHaveBeenCalledOnce();
      expect(vi.mocked(zipBuffer)).toHaveBeenCalledOnce();
    });

    test("invalid type event", async () => {
      const invalidTypeEvent = {
        type: "invalid",
      } as any;
      const result = await zipWorker(invalidTypeEvent);
      expect(vi.mocked(addReportFilesToZip)).not.toHaveBeenCalled();
      expect(vi.mocked(addUseOfFundsFilesToZip)).not.toHaveBeenCalled();
      expect(vi.mocked(zipBuffer)).not.toHaveBeenCalled();
      expect(result?.statusCode).toBe(StatusCodes.BadRequest);
    });
  });
});
