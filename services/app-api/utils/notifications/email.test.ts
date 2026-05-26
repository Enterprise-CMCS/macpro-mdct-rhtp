import { sendEmail } from "./email";
import sesLib from "../../libs/ses-lib";
import { validReport } from "../tests/mockReport";

vi.mock("../../libs/ses-lib", () => ({
  default: {
    sendSesEmail: vi.fn(),
  },
}));

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should issue a send email command", async () => {
    await sendEmail(validReport);
    expect(sesLib.sendSesEmail).toHaveBeenCalledTimes(1);
  });
});
