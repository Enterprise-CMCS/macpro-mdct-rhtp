import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../types/types";
import { createComment } from "./create";
import { authenticatedUser } from "../../utils/authentication";
import { UserRoles, Comment, CommentType } from "@rhtp/shared";
import { putComment } from "../../storage/comments";
import { canWriteComments } from "../../utils/authorization";

vi.mock("../../utils/authorization", () => ({
  canReadInternalComments: vi.fn().mockReturnValue(true),
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
      isInternal: true,
    });
  });
});
