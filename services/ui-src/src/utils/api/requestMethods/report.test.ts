import {
  createReport,
  getReport,
  getReportsForState,
  putReport,
  releaseReport,
  postSubmitReport,
  updateArchivedStatus,
  updateReport,
} from "./report";
// types
import { FormPageTemplate, Report, ReportOptions, ReportType } from "types";

const report = {
  type: ReportType.RHTP,
  state: "PA",
  name: "A Title",
  pages: [] as FormPageTemplate[],
} as Report;

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
vi.mock("../apiLib", () => ({
  apiLib: {
    get: (path: string, opts: Record<string, any>) => mockGet(path, opts),
    post: (path: string, opts: Record<string, any>) => mockPost(path, opts),
    put: (path: string, opts: Record<string, any>) => mockPut(path, opts),
  },
}));

const mockReport: ReportOptions = {
  name: "report name",
  year: 2026,
};

describe("utils/report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("getReport", async () => {
    await getReport("reportType", "PA", "mock-id");
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test("getReportsForState", async () => {
    await getReportsForState("reportType", "PA");
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test("createReport", async () => {
    await createReport("reportType", "PA", mockReport);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  test("putReport", async () => {
    await putReport(report);
    expect(mockPut).toHaveBeenCalledTimes(1);
  });

  test("submitReport", async () => {
    await postSubmitReport(report);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  test("updateArchivedStatus", async () => {
    await updateArchivedStatus(report, true);
    expect(mockPut).toHaveBeenCalledTimes(1);
  });

  test("releaseReport", async () => {
    await releaseReport(report);
    expect(mockPut).toHaveBeenCalledTimes(1);
  });

  test("updateReport", async () => {
    await updateReport(report);
    expect(mockPut).toHaveBeenCalledTimes(1);
  });
});
