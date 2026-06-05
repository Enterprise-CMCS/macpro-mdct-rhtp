import { Mock } from "vitest";
import { apiLib } from "../apiLib";
import { createComment, getComments } from "./commentMethods";
import { Comment, CommentType } from "@rhtp/shared";

vi.mock("../apiLib", () => ({
  apiLib: {
    post: vi.fn(),
    get: vi.fn(),
  },
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

describe("Test commentApi functions", () => {
  test("createComment", async () => {
    (apiLib.post as Mock).mockReturnValue(mockComment);

    const result = await createComment(mockComment.contextId, {
      type: mockComment.type,
      comment: mockComment.comment,
      parentReportId: mockComment.parentReportId,
    });
    expect(result).toEqual(mockComment);
  });

  test("getComments", async () => {
    (apiLib.get as Mock).mockReturnValue([mockComment]);

    const result = await getComments(mockComment.contextId);
    expect(result).toEqual([mockComment]);
  });
});
