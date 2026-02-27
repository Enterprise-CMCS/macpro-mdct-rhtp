import { Mock } from "vitest";
import {
  ElementType,
  FormPageTemplate,
  PageElement,
  PageType,
  ReportOptions,
  ReportType,
  RhtpSubType,
} from "../../types/reports";
import { User } from "../../types/types";
import { StateAbbr } from "../../utils/constants";
import { validateReportPayload } from "../../utils/reportValidation";
import { buildReport, makeQuarterlyChanges } from "./buildReport";

vi.mock("../../utils/reportValidation", () => ({
  validateReportPayload: vi.fn().mockImplementation(async (rpt) => rpt),
}));

describe("buildReport utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("successful annual report build", async () => {
    const state = "PA" as StateAbbr;
    const user = {
      fullName: "James Holden",
      email: "james.holden@test.com",
    } as User;
    const reportOptions = {
      name: "report1",
      year: 2026,
      subType: RhtpSubType.ANNUAL,
    } as ReportOptions;
    const report = await buildReport(
      ReportType.RHTP,
      state,
      reportOptions,
      user
    );

    expect(report.state).toBe("PA");
    expect(report.type).toBe(ReportType.RHTP);
    expect(report.subType).toEqual(RhtpSubType.ANNUAL);
    expect(report.lastEditedBy).toBe("James Holden");
    expect(report.lastEditedByEmail).toBe("james.holden@test.com");
  });

  test("successful quarterly report build", async () => {
    const state = "PA" as StateAbbr;
    const user = {
      fullName: "James Holden",
      email: "james.holden@test.com",
    } as User;
    const reportOptions = {
      name: "report1",
      year: 2026,
      subType: RhtpSubType.Q1,
    } as ReportOptions;
    const report = await buildReport(
      ReportType.RHTP,
      state,
      reportOptions,
      user
    );

    expect(report.state).toBe("PA");
    expect(report.type).toBe(ReportType.RHTP);
    expect(report.subType).toEqual(RhtpSubType.Q1);
    expect(report.lastEditedBy).toBe("James Holden");
    expect(report.lastEditedByEmail).toBe("james.holden@test.com");
  });

  test("Test that a validation failure throws invalid request error", async () => {
    // Manually throw validation error
    (validateReportPayload as Mock).mockImplementationOnce(() => {
      throw new Error("you be havin some validatin errors");
    });

    const state = "PA" as StateAbbr;
    const user = {
      fullName: "James Holden",
      email: "james.holden@test.com",
    } as User;
    const reportOptions = {
      name: "report1",
      year: 2026,
    } as ReportOptions;

    expect(async () => {
      await buildReport(ReportType.RHTP, state, reportOptions, user);
    }).rejects.toThrow("Invalid request");
  });
});

describe("makeQuarterlyChanges utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockHeader: PageElement = {
    type: ElementType.Header,
    id: "mock-page-1-header",
    text: "Mock Page 1",
  };

  const mockTextBox1: PageElement = {
    type: ElementType.Textbox,
    id: "mock-textbox-1",
    label: "Mock Textbox 1",
    quarterly: false,
    required: true,
  };

  const mockTextBox2: PageElement = {
    type: ElementType.Textbox,
    id: "mock-textbox-2",
    label: "Mock Textbox 2",
    quarterly: true,
    required: true,
  };

  const mockPages: FormPageTemplate[] = [
    {
      id: "mock-page-1",
      title: "Mock Report Page",
      type: PageType.Standard,
      elements: [mockHeader, mockTextBox1, mockTextBox2],
    },
  ];

  test("test only disabled quarterly false elements", () => {
    makeQuarterlyChanges(mockPages);
    expect("disabled" in mockHeader).toBe(false);
    expect(mockTextBox1.disabled).toBe(true);
    expect("disabled" in mockTextBox2).toBe(false);
  });
});
