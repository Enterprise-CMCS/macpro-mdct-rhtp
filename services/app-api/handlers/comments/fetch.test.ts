import { Mock } from "vitest";
import { StatusCodes } from "../../libs/response-lib";
import { proxyEvent } from "../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../types/types";
import { getComments } from "./fetch";
import { authenticatedUser } from "../../utils/authentication";
import { UserRoles, Comment, CommentType } from "@rhtp/shared";
import { queryComments } from "../../storage/comments";
import { canReadState } from "../../utils/authorization";

vi.mock("../../utils/authorization", () => ({
  canReadInternalComments: vi.fn().mockReturnValue(true),
  canReadState: vi.fn().mockReturnValue(true),
}));

vi.mock("../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.STATE_USER,
  state: "PA",
} as User);

vi.mock("../../storage/comments", () => ({
  queryComments: vi.fn(),
}));

const mockComment = {
  contextId: "mockContextId",
  created: 123456,
  id: "mockId",
  author: "Mock Author",
  authorEmail: "mockEmail",
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
};

describe("Test fetchComments API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Test missing path params", async () => {
    const badTestEvent: APIGatewayProxyEvent = {
      ...proxyEvent,
      headers: { "cognito-identity-id": "test" },
    };
    const res = await getComments(badTestEvent);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
  });

  it("should return 403 if user is not authorized", async () => {
    (canReadState as Mock).mockReturnValueOnce(false);
    const response = await getComments(testEvent);
    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });

  test("Successful Comment Fetch", async () => {
    (queryComments as Mock).mockResolvedValueOnce([mockComment]);
    const res = await getComments(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
    expect(JSON.parse(res.body as string)).toEqual([mockComment]);
  });

  test("successful no comments found fetch", async () => {
    (queryComments as Mock).mockResolvedValueOnce([]);
    const res = await getComments(testEvent);
    expect(res.body).toBe("[]");
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
