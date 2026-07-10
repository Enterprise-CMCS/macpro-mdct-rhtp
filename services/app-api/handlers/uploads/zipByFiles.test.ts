import { mockClient } from "aws-sdk-client-mock";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../types/types";
import {
  triggerZipByFilesGeneration,
  getZipByFilesStatus,
  zipByFilesWorker,
} from "./zipByFiles";
import { authenticatedUser } from "../../utils/authentication";
import { ReportType, UserRoles } from "@rhtp/shared";
import s3 from "../../libs/s3-lib";

const lambdaMock = mockClient(LambdaClient);
lambdaMock.on(InvokeCommand).resolves({});

vi.mock("../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.ADMIN,
  state: "PA",
} as User);

vi.mock("../../libs/s3-lib", () => ({
  default: {
    getSignedDownloadUrl: vi
      .fn()
      .mockResolvedValue("https://example.com/presigned"),
    getObject: vi.fn().mockResolvedValue({ Body: undefined }),
    putObject: vi.fn().mockResolvedValue({}),
    deleteObject: vi.fn().mockResolvedValue({}),
    headObject: vi.fn().mockResolvedValue({}),
  },
}));

const mockGetZipEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: `{}`,
  pathParameters: {
    reportType: "RHTP",
    id: "mock-id",
  },
  headers: { "cognito-identity-id": "test" },
};

describe("Test zip methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("triggerZipByFilesGeneration method", () => {
    test("missing path params", async () => {
      const badTestEvent = {
        ...proxyEvent,
        pathParameters: {},
      } as APIGatewayProxyEvent;
      const res = await triggerZipByFilesGeneration(badTestEvent);
      expect(res.statusCode).toBe(StatusCodes.BadRequest);
    });

    test("returns proper response", async () => {
      const res = await triggerZipByFilesGeneration(mockGetZipEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(res.body).toBe(JSON.stringify({ status: "pending" }));
    });
  });

  describe("getZipByFilesStatus method", () => {
    test("missing path params", async () => {
      const badTestEvent = {
        ...proxyEvent,
        pathParameters: {},
      } as APIGatewayProxyEvent;
      const res = await getZipByFilesStatus(badTestEvent);
      expect(res.statusCode).toBe(StatusCodes.BadRequest);
    });

    test("returns proper response if file does not exist", async () => {
      vi.mocked(s3.headObject).mockRejectedValueOnce(new Error("Not Found"));
      const res = await getZipByFilesStatus(mockGetZipEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(res.body).toBe(JSON.stringify({ status: "pending" }));
    });

    test("returns proper response if file exists", async () => {
      const res = await getZipByFilesStatus(mockGetZipEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(res.body).toBe(
        JSON.stringify({
          status: "ready",
          psurl: "https://example.com/presigned",
        })
      );
    });
  });

  describe("zipByFilesWorker method", () => {
    test("uploads zip to S3", async () => {
      await zipByFilesWorker({
        reportType: ReportType.RHTP,
        files: [
          {
            state: "PA",
            reportId: "mock-id",
            fileId: "file-id",
            name: "file-name",
          },
        ],
      });
      expect(vi.mocked(s3.putObject)).toHaveBeenCalledOnce();
    });
  });
});
