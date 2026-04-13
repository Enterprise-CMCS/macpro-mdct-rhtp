import { Report, ReportStatus, ReportType, RhtpSubType } from "types";
import { createZipFile } from "./zip";

vi.mock("utils/api/requestMethods/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  geFileBytes: vi.fn().mockReturnValue([{ name: "filename", bytes: [] }]),
}));

const report: Report = {
  year: 2026,
  id: "",
  name: "",
  state: "AL",
  status: ReportStatus.NOT_STARTED,
  submissionCount: 0,
  type: ReportType.RHTP,
  subType: RhtpSubType.ANNUAL,
  pages: [
    {
      id: "root",
      childPageIds: ["first-child"],
    },
  ],
};

describe("utils/zip", () => {
  test("mock create a zip file", async () => {
    await createZipFile(report);
    expect(window.location.href).toEqual("http://localhost:3000/");
  });
});
