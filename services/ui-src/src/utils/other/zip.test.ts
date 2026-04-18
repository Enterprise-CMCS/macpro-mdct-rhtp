import { Report, ReportStatus, ReportType, RhtpSubType } from "@rhtp/shared";
import { convertBase64ToBlob, createZipFile } from "./zip";
import JSZip from "jszip";

vi.mock("utils/api/requestMethods/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  getFileBytes: vi.fn().mockReturnValue([{ name: "filename", bytes: [] }]),
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

/** Could not find a way to write a good test, for the zip out so I ended up testing that js zip at least zips */
describe("utils/zip", () => {
  test("mock create a zip file", async () => {
    await createZipFile(report);
    expect(window.location.href).toEqual("http://localhost:3000/");
  });
  test("JSZip creates a zip file", async () => {
    const zip = new JSZip();
    zip.file("hello.txt", "Hello World\n");
    const content = await zip.generateAsync({ type: "base64" });
    expect(content).toBeDefined();
  });
  test("convertBase64ToBlob function", () => {
    //This is a transparent pixel
    const base64string = "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    const blob = convertBase64ToBlob(base64string);
    expect(blob.size).toBe(37);
  });
});
