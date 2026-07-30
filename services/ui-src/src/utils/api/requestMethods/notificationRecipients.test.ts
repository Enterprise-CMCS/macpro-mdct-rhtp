import {
  createNotificationRecipient,
  deleteNotificationRecipient,
  getAssignedStatesByEmail,
  getNotificationRecipients,
} from "./notificationRecipients";

const mockPost = vi.fn();
const mockGet = vi.fn();
const mockDelete = vi.fn();
vi.mock("../apiLib", () => ({
  apiLib: {
    post: (path: string, opts: Record<string, any>) => mockPost(path, opts),
    get: (path: string, opts: Record<string, any>) => mockGet(path, opts),
    del: (path: string, opts: Record<string, any>) => mockDelete(path, opts),
  },
}));

const mockCreate = {
  email: "mock@address.com",
};

describe("notification recipients api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("createNotificationRecipient", async () => {
    await createNotificationRecipient("PA", mockCreate);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  test("getNotificationRecipients", async () => {
    await getNotificationRecipients();
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test("getAssignedStatesByEmail", async () => {
    await getAssignedStatesByEmail("test@email.com");
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test("deleteNotificationRecipient", async () => {
    await deleteNotificationRecipient("PA", "12345");
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});
