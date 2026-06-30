import { Mock } from "vitest";
import { NotificationRecipientRecord, UserRoles } from "@rhtp/shared";
import { getAssignedStatesByEmail, getNotificationRecipients } from "./get";
import { scanAllRecipients } from "../../../storage/notificationRecipients";
import { authenticatedUser } from "../../../utils/authentication";
import { APIGatewayProxyEvent, User } from "../../../types/types";
import { proxyEvent } from "../../../testing/proxyEvent";
import { StatusCodes } from "../../../libs/response-lib";
import {
  canModifyNotificationRecipients,
  canReadAnyReport,
} from "../../../utils/authorization";
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
  canReadAnyReport: vi.fn().mockRejectedValue(true),
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

describe("Test get recipients API methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNotificationRecipients", () => {
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

  describe("getAssignedStatesByEmail", () => {
    const testEmailEvent: APIGatewayProxyEvent = {
      ...proxyEvent,
      headers: { "cognito-identity-id": "test" },
      pathParameters: { email: "success@email.com" },
    };
    test("not authorized to read all reports throws 403 error", async () => {
      (canReadAnyReport as Mock).mockReturnValueOnce(false);
      const res = await getAssignedStatesByEmail(testEmailEvent);
      expect(res.statusCode).toBe(StatusCodes.Forbidden);
      expect(res.body).toContain(error.UNAUTHORIZED);
    });

    test("Returns list of states for matching email", async () => {
      const mockRecipientList = [
        {
          ...mockRecipient,
          email: "success@email.com",
          state: "PA",
        },
        {
          ...mockRecipient,
          email: "success@email.com",
          state: "AL",
        },
        {
          ...mockRecipient,
          email: "mistmatch@email.com",
          state: "CO",
        },
      ];
      (scanAllRecipients as Mock).mockResolvedValueOnce(mockRecipientList);
      const res = await getAssignedStatesByEmail(testEmailEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(JSON.parse(res.body as string)).toEqual(["PA", "AL"]);
    });

    test("successful no recipients fetch", async () => {
      (scanAllRecipients as Mock).mockResolvedValueOnce([]);
      const res = await getAssignedStatesByEmail(testEmailEvent);
      expect(res.body).toBe("[]");
      expect(res.statusCode).toBe(StatusCodes.Ok);
    });
  });
});
