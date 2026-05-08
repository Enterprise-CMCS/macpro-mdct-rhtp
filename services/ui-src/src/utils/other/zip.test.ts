import { Report, ReportStatus, ReportType, RhtpSubType } from "@rhtp/shared";
import { createZipFile } from "./zip";

vi.mock("utils/api/requestMethods/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  getZipPresignedUrl: vi
    .fn()
    .mockResolvedValue({ psurl: "https://example.com/mock.zip" }),
}));

const report: Report = {
  id: "",
  name: "",
  state: "AL",
  created: 1776449695077,
  status: ReportStatus.NOT_STARTED,
  submissionCount: 0,
  type: ReportType.RHTP,
  subType: RhtpSubType.ANNUAL,
  subTypeKey: "A1",
  budgetPeriod: 1,
  pages: [
    {
      id: "root",
      childPageIds: ["first-child"],
    },
  ],
};

describe("utils/zip", () => {
  test("createZipFile triggers a download link with the presigned URL", async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    await createZipFile(report);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });
});
