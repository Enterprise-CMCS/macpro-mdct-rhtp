import { batchPutComments, putComment, queryComments } from "./comments";
import { Comment, CommentType } from "@rhtp/shared";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  BatchWriteCommand,
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

  describe("putComment", () => {
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

  describe("batchPutComments", () => {
    test("should call DynamoDB to batch put comment data", async () => {
      const mockBatchWrite = vi.fn();
      mockDynamo.on(BatchWriteCommand).callsFake(mockBatchWrite);

      await batchPutComments([mockComment]);

      expect(mockBatchWrite).toHaveBeenCalledWith(
        {
          RequestItems: {
            "local-comments": [
              {
                PutRequest: {
                  Item: mockComment,
                },
              },
            ],
          },
        },
        expect.any(Function)
      );
    });

    test("should batch properly", async () => {
      const mockBatchWrite = vi.fn();
      mockDynamo.on(BatchWriteCommand).callsFake(mockBatchWrite);

      const manyComments = Array.from({ length: 26 }, () => mockComment);

      await batchPutComments(manyComments);

      const responseComments = Array.from({ length: 25 }, () => {
        return {
          PutRequest: {
            Item: mockComment,
          },
        };
      });

      expect(mockBatchWrite).toHaveBeenNthCalledWith(
        1,
        {
          RequestItems: {
            "local-comments": responseComments,
          },
        },
        expect.any(Function)
      );

      expect(mockBatchWrite).toHaveBeenNthCalledWith(
        2,
        {
          RequestItems: {
            "local-comments": [
              {
                PutRequest: {
                  Item: mockComment,
                },
              },
            ],
          },
        },
        expect.any(Function)
      );
    });
  });
});
