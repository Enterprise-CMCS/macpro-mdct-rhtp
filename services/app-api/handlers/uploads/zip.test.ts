import { mockClient } from "aws-sdk-client-mock";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../types/types";
import { triggerZipGeneration, getZipStatus, zipWorker } from "./zip";
import { authenticatedUser } from "../../utils/authentication";
import { UserRoles } from "@rhtp/shared";
import s3 from "../../libs/s3-lib";

const lambdaMock = mockClient(LambdaClient);
lambdaMock.on(InvokeCommand).resolves({});

vi.mock("../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.ADMIN,
  state: "PA",
} as User);

vi.mock("../../utils/authorization", () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
}));

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

const mockGetZipEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  body: `{}`,
  pathParameters: {
    state: "PA",
    reportType: "RHTP",
    id: "mock-id",
  },
  headers: { "cognito-identity-id": "test" },
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

    test("returns proper response", async () => {
      const res = await triggerZipGeneration(mockGetZipEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(res.body).toBe(JSON.stringify({ status: "pending" }));
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
      vi.mocked(s3.headObject).mockRejectedValueOnce(new Error("Not Found"));
      const res = await getZipStatus(mockGetZipEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(res.body).toBe(JSON.stringify({ status: "pending" }));
    });

    test("returns proper response if file exists", async () => {
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
    test("uploads zip to S3", async () => {
      await zipWorker(mockGetZipEvent.pathParameters as any);
      expect(vi.mocked(s3.putObject)).toHaveBeenCalledOnce();
    });
  });
});
