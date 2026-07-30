import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../types/types";
import { createComment } from "./create";
import { authenticatedUser } from "../../utils/authentication";
import {
  UserRoles,
  Comment,
  CommentType,
  AttachmentStatus,
} from "@rhtp/shared";
import { putComment } from "../../storage/comments";
import { canWriteComments } from "../../utils/authorization";
import { sendEmail } from "../../utils/notifications/email";

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

vi.mock("../../storage/comments");
const mockPutComment = vi.mocked(putComment);

vi.mock("../../utils/notifications/email");
const mockSendEmail = vi.mocked(sendEmail);

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

  test("invalid payload throws 400", async () => {
    const mockInvalidBodyEvent: APIGatewayProxyEvent = {
      ...testEvent,
      // missing required fields
      body: JSON.stringify({
        type: CommentType.REPORT,
      }),
    };
    const res = await createComment(mockInvalidBodyEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(mockPutComment).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  test("Successful attachment Comment Create", async () => {
    const res = await createComment(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Created);
    expect(JSON.parse(res.body as string)).toEqual({
      ...mockComment,
      created: expect.any(Number),
      id: expect.any(String),
    });
    expect(mockPutComment).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalled();
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
    const res = await createComment(mockReportCommentEvent);
    expect(res.statusCode).toBe(StatusCodes.Created);
    expect(JSON.parse(res.body as string)).toEqual({
      ...mockComment,
      type: CommentType.REPORT,
      created: expect.any(Number),
      id: expect.any(String),
    });
    expect(mockPutComment).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalled();
  });

  test("Successful attachment status update triggers email but not putComment", async () => {
    const mockAttachmentStatusEvent: APIGatewayProxyEvent = {
      ...testEvent,
      body: JSON.stringify({
        type: CommentType.ATTACHMENT_STATUS,
        statusChange: AttachmentStatus.NEEDS_REVISION,
        isInternal: false,
        parentReportId: mockComment.parentReportId,
      }),
    };
    const res = await createComment(mockAttachmentStatusEvent);
    expect(res.statusCode).toBe(StatusCodes.Created);
    expect(JSON.parse(res.body as string)).toEqual({
      ...mockComment,
      comment: undefined,
      statusChange: AttachmentStatus.NEEDS_REVISION,
      type: CommentType.ATTACHMENT_STATUS,
      created: expect.any(Number),
      id: expect.any(String),
    });
    expect(mockPutComment).not.toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalled();
  });
});
