import { Report, ReportType } from "@rhtp/shared";
import { sendEmail } from "./emailNotification";

const report = {
  type: ReportType.RHTP,
  state: "PA",
  id: "report-123",
} as Report;

const mockPost = vi.fn();
vi.mock("../apiLib", () => ({
  apiLib: {
    post: (path: string, opts: Record<string, any>) => mockPost(path, opts),
  },
}));

describe("notifications api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("sendEmail", async () => {
    await sendEmail(report);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
