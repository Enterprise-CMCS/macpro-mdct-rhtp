import { putComment, queryComments } from "./comments";
import { Comment, CommentType } from "@rhtp/shared";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);

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

describe("Comment storage helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDynamo.reset();
  });

  describe("putReport", () => {
    test("should call DynamoDB to put comment data", async () => {
      const mockPut = vi.fn();
      mockDynamo.on(PutCommand).callsFake(mockPut);

      await putComment(mockComment);

      expect(mockPut).toHaveBeenCalledWith(
        {
          TableName: "local-comments",
          Item: mockComment,
        },
        expect.any(Function)
      );
    });
  });

  describe("queryComments", () => {
    test("should call DynamoDB to get all comment data (including internal)", async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        Items: [mockComment],
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(QueryCommand).callsFake(mockQuery);

      const comments = await queryComments(mockComment.contextId, true);

      expect(comments).toEqual([mockComment]);
      expect(mockQuery).toHaveBeenCalledWith(
        {
          TableName: "local-comments",
          KeyConditionExpression: "contextId = :contextId",
          ExpressionAttributeValues: { ":contextId": mockComment.contextId },
          ScanIndexForward: false,
        },
        expect.any(Function)
      );
    });

    test("should call DynamoDB to get comment data for non-internal", async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        Items: [mockComment],
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(QueryCommand).callsFake(mockQuery);

      const comments = await queryComments(mockComment.contextId, false);

      expect(comments).toEqual([mockComment]);
      expect(mockQuery).toHaveBeenCalledWith(
        {
          TableName: "local-comments",
          KeyConditionExpression: "contextId = :contextId",
          ExpressionAttributeValues: {
            ":contextId": mockComment.contextId,
            ":isInternal": false,
          },
          ScanIndexForward: false,
          FilterExpression: "isInternal = :isInternal",
        },
        expect.any(Function)
      );
    });
  });
});
