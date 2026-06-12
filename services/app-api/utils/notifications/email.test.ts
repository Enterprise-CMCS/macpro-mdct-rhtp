import { sendEmail } from "./email";
import sesLib from "../../libs/ses-lib";
import { validReport } from "../tests/mockReport";
import { User } from "../../types/types";
import { saveNotifications } from "./notifications";

vi.mock("../../libs/ses-lib", () => ({
  default: {
    sendSesEmail: vi.fn(),
  },
}));

vi.mock("./notifications");
const mockSaveNotifications = vi.mocked(saveNotifications);

const mockUser = {
  fullName: "Mock User",
  email: "mock@user.com",
} as User;

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should not issue a send email command when no email in report", async () => {
    await sendEmail(validReport, mockUser);
    expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
    expect(mockSaveNotifications).not.toHaveBeenCalled();
  });

  test("should issue a send email command when email in report", async () => {
    // any type so it doesn't complain about accessing .answer on generic PageElement
    const reportWithEmail: any = structuredClone(validReport);
    reportWithEmail.pages[1].elements[2].answer = "test@email.com";
    await sendEmail(reportWithEmail, mockUser);
    expect(sesLib.sendSesEmail).toHaveBeenCalledTimes(1);
    expect(mockSaveNotifications).toHaveBeenCalled();
  });
});
