import { Mock } from "vitest";
import { StatusCodes } from "../../../libs/response-lib";
import { APIGatewayProxyEvent } from "../../../types/types";
import { CreateNotificationRecipientBody, UserRoles } from "@rhtp/shared";
import { canModifyNotificationRecipients } from "../../../utils/authorization";
import { createNotificationRecipient } from "./create";
import { error } from "../../../utils/constants";
import { putRecipient } from "../../../storage/notificationRecipients";
import { proxyEvent } from "../../../testing/proxyEvent";

vi.mock("../../../utils/authentication", () => ({
  authenticatedUser: vi.fn().mockReturnValue({
    role: UserRoles.APPROVER,
    state: "PA",
    fullName: "mock approver user",
  }),
}));

vi.mock("../../../utils/authorization", () => ({
  canModifyNotificationRecipients: vi.fn().mockReturnValue(true),
}));

vi.mock("../../../storage/notificationRecipients");
const mockPutRecipient = vi.mocked(putRecipient);

const mockCreateRecipientBody: CreateNotificationRecipientBody = {
  email: "email@address.com",
};

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  headers: { "cognito-identity-id": "test" },
  pathParameters: { state: "PA" },
  body: JSON.stringify(mockCreateRecipientBody),
};

describe("Test createNotificationRecipient API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("unauthorized creation throws 403 error", async () => {
    (canModifyNotificationRecipients as Mock).mockReturnValueOnce(false);
    const res = await createNotificationRecipient(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
    expect(res.body).toContain(error.UNAUTHORIZED);
  });

  test("Successful notification recipient creation", async () => {
    const res = await createNotificationRecipient(testEvent);

    expect(res.statusCode).toBe(StatusCodes.Created);
    expect(mockPutRecipient).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockCreateRecipientBody,
        state: testEvent.pathParameters!.state,
        addedBy: "mock approver user",
      })
    );
  });
});
