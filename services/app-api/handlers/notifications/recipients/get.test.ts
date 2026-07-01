import { Mock } from "vitest";
import { NotificationRecipientRecord, UserRoles } from "@rhtp/shared";
import { getNotificationRecipients } from "./get";
import { scanAllRecipients } from "../../../storage/notificationRecipients";
import { authenticatedUser } from "../../../utils/authentication";
import { APIGatewayProxyEvent, User } from "../../../types/types";
import { proxyEvent } from "../../../testing/proxyEvent";
import { StatusCodes } from "../../../libs/response-lib";
import { canModifyNotificationRecipients } from "../../../utils/authorization";
import { error } from "../../../utils/constants";

vi.mock("../../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.APPROVER,
  state: "PA",
} as User);

vi.mock("../../../utils/authorization", () => ({
  isAuthenticated: vi.fn().mockReturnValue(true),
}));

vi.mock("../../../storage/notificationRecipients", () => ({
  scanAllRecipients: vi.fn(),
}));

vi.mock("../../../utils/authorization", () => ({
  canModifyNotificationRecipients: vi.fn().mockReturnValue(true),
}));

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  headers: { "cognito-identity-id": "test" },
};

const mockRecipient: NotificationRecipientRecord = {
  id: "123",
  email: "test@email.com",
  state: "PA",
  addedBy: "Approver User",
  created: Date.now(),
};

describe("Test fetchBanner API method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("not authorized to get recipients throws 403 error", async () => {
    (canModifyNotificationRecipients as Mock).mockReturnValueOnce(false);
    const res = await getNotificationRecipients(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Forbidden);
    expect(res.body).toContain(error.UNAUTHORIZED);
  });

  test("Successful recipient get", async () => {
    (scanAllRecipients as Mock).mockResolvedValueOnce([mockRecipient]);
    const res = await getNotificationRecipients(testEvent);
    expect(res.statusCode).toBe(StatusCodes.Ok);
    expect(JSON.parse(res.body as string)).toEqual([mockRecipient]);
  });

  test("successful no recipients fetch", async () => {
    (scanAllRecipients as Mock).mockResolvedValueOnce([]);
    const res = await getNotificationRecipients(testEvent);
    expect(res.body).toBe("[]");
    expect(res.statusCode).toBe(StatusCodes.Ok);
  });
});
