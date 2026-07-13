import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../types/types";
import { createComment } from "./create";
import { authenticatedUser } from "../../utils/authentication";
import { UserRoles, Comment, CommentType } from "@rhtp/shared";
import { putComment } from "../../storage/comments";
import { canWriteComments } from "../../utils/authorization";
import { getReport } from "../../storage/reports";
import { validReport } from "../../utils/tests/mockReport";
import { sendReportCommentEmail } from "../../utils/notifications/email";

vi.mock("../../utils/authorization", () => ({
  canWriteComments: vi.fn().mockReturnValue(true),
}));

vi.mock("../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockReturnValue({
  role: UserRoles.STATE_USER,
  state: "PA",
  fullName: "Mock User",
  email: "mockuser@example.com",
} as User);

vi.mock("../../storage/comments", () => ({
  putComment: vi.fn(),
}));

vi.mock("../../storage/reports");
const mockGetReport = vi.mocked(getReport);

vi.mock("../../utils/notifications/email");
const mockSendEmail = vi.mocked(sendReportCommentEmail);

const mockComment = {
  contextId: "mockContextId",
  created: 123456,
  id: "mockId",
  author: "Mock User",
  authorEmail: "mockuser@example.com",
  isInternal: false,
  comment: "Mock comment",
  type: CommentType.ATTACHMENT,
  parentReportId: "mockReportId",
} as Comment;

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  headers: { "cognito-identity-id": "test" },
  pathParameters: {
    contextId: mockComment.contextId,
    state: "PA",
  },
  body: JSON.stringify({
    type: mockComment.type,
    comment: mockComment.comment,
    parentReportId: mockComment.parentReportId,
    isInternal: mockComment.isInternal,
  }),
};

describe("Test createComment API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Test missing path params", async () => {
    const badTestEvent: APIGatewayProxyEvent = {
      ...proxyEvent,
      headers: { "cognito-identity-id": "test" },
    };
    const res = await createComment(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  it("should return 403 if user is not authorized", async () => {
    (canWriteComments as Mock).mockReturnValueOnce(false);
    const response = await createComment(testEvent);
    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });

  test("Successful Comment Create", async () => {
    (putComment as Mock).mockResolvedValueOnce(mockComment);
    const res = await createComment(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Created);
    expect(JSON.parse(res.body as string)).toEqual({
      ...mockComment,
      created: expect.any(Number),
      id: expect.any(String),
    });
  });

  test("Successful Report Comment Create triggers email", async () => {
    const mockReportCommentEvent: APIGatewayProxyEvent = {
      ...testEvent,
      body: JSON.stringify({
        type: CommentType.REPORT,
        comment: mockComment.comment,
        parentReportId: mockComment.parentReportId,
        isInternal: mockComment.isInternal,
      }),
    };
    (putComment as Mock).mockResolvedValueOnce({});
    mockGetReport.mockResolvedValue({
      ...validReport,
      state: "PA",
    });
    const res = await createComment(mockReportCommentEvent);
    expect(res.statusCode).toBe(StatusCodes.Created);
    expect(JSON.parse(res.body as string)).toEqual({
      ...mockComment,
      type: CommentType.REPORT,
      created: expect.any(Number),
      id: expect.any(String),
    });
    expect(mockGetReport).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalled();
  });

  test("Report Comment Create succeeds even when the email fails", async () => {
    const mockReportCommentEvent: APIGatewayProxyEvent = {
      ...testEvent,
      body: JSON.stringify({
        type: CommentType.REPORT,
        comment: mockComment.comment,
        parentReportId: mockComment.parentReportId,
        isInternal: mockComment.isInternal,
      }),
    };
    (putComment as Mock).mockResolvedValueOnce({});
    mockGetReport.mockResolvedValue({
      ...validReport,
      state: "PA",
    });
    mockSendEmail.mockRejectedValueOnce(new Error("ses failure"));
    const res = await createComment(mockReportCommentEvent);
    expect(res.statusCode).toBe(StatusCodes.Created);
  });
});
