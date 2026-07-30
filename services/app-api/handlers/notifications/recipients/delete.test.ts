import { Mock } from "vitest";
import { StatusCodes } from "../../../libs/response-lib";
import { proxyEvent } from "../../../testing/proxyEvent";
import { APIGatewayProxyEvent, User } from "../../../types/types";
import { canModifyNotificationRecipients } from "../../../utils/authorization";
import { deleteNotificationRecipient } from "./delete";
import { error } from "../../../utils/constants";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { authenticatedUser } from "../../../utils/authentication";
import { UserRoles } from "@rhtp/shared";

const dynamoClientMock = mockClient(DynamoDBDocumentClient);

vi.mock("../../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.APPROVER,
  state: "PA",
} as User);

vi.mock("../../../utils/authorization", () => ({
  canModifyNotificationRecipients: vi.fn().mockReturnValue(true),
}));

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  headers: { "cognito-identity-id": "test" },
  pathParameters: { state: "PA", id: "123" },
};

describe("Test deleteNotificationRecipient API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("not authorized to delete recipient throws 403 error", async () => {
    (canModifyNotificationRecipients as Mock).mockReturnValueOnce(false);
    const res = await deleteNotificationRecipient(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
    expect(res.body).toContain(error.UNAUTHORIZED);
  });

  test("Successful recipient deletion", async () => {
    const mockDelete = vi.fn();
    dynamoClientMock.on(DeleteCommand).callsFake(mockDelete);
    const res = await deleteNotificationRecipient(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
    expect(mockDelete).toHaveBeenCalled();
  });

  test("state not provided throws 500 error", async () => {
    const noKeyEvent: APIGatewayProxyEvent = {
      ...testEvent,
      pathParameters: { id: "123" },
    };
    const res = await deleteNotificationRecipient(noKeyEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(res.body).toContain(error.MISSING_DATA);
  });

  test("id not provided throws 500 error", async () => {
    const noKeyEvent: APIGatewayProxyEvent = {
      ...testEvent,
      pathParameters: { state: "PA" },
    };
    const res = await deleteNotificationRecipient(noKeyEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(res.body).toContain(error.MISSING_DATA);
  });

  test("state and id empty throws 500 error", async () => {
    const noKeyEvent: APIGatewayProxyEvent = {
      ...testEvent,
      pathParameters: { state: "", id: "" },
    };
    const res = await deleteNotificationRecipient(noKeyEvent);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(res.body).toContain(error.MISSING_DATA);
  });
});
