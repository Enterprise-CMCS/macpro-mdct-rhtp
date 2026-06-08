import { MockedFunction } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportPageWrapper } from "./ReportPageWrapper";
import { useStore } from "utils";
import { mockReport } from "utils/testing/mockForm";

const mockUseParams = vi.fn();
const mockNavigate = vi.fn();
const mockSaveReport = vi.fn();

vi.mock("react-router", () => ({
  useParams: () => mockUseParams(),
  useNavigate: () => mockNavigate,
}));

const mockGetReport = vi.fn().mockResolvedValue(mockReport);
vi.mock("../../utils/api/requestMethods/report", () => ({
  getReport: () => mockGetReport(),
}));

vi.mock("utils/state/useStore", () => ({
  useStore: vi.fn(),
}));

const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;

const setupMockStore = (customState?: Partial<any>) => {
  mockedUseStore.mockImplementation((selector?) => {
    const mockState = {
      report: mockReport,
      pageMap: new Map([
        ["root", 0],
        ["general-info", 1],
        ["mock-report-page", 2],
      ]),
      currentPageId: "general-info",
      parentPage: {
        index: 0,
        childPageIds: ["general-info", "mock-report-page"],
      },
      saveReport: () => mockSaveReport(),
      setAnswers: vi.fn(),
      loadReport: vi.fn(),
      ...customState,
    } as any;
    return selector ? selector(mockState) : mockState;
  });
};

describe("ReportPageWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({
      reportType: "RHTP",
      state: "NJ",
      reportId: "RHTPNJ123",
    });
    setupMockStore();
  });
  test("should not render if missing params", async () => {
    mockUseParams.mockReturnValue({
      reportType: undefined,
      state: undefined,
      reportId: undefined,
    });
    render(<ReportPageWrapper />);
    expect(mockGetReport).not.toHaveBeenCalled();
    expect(screen.getByText("bad params")).toBeTruthy(); // To be updated with real error page
  });
  test("should render Loading if report not loaded", async () => {
    mockGetReport.mockResolvedValueOnce(undefined);
    setupMockStore({
      report: undefined,
    });
    await act(async () => {
      render(<ReportPageWrapper />);
    });
    await waitFor(() => expect(mockGetReport).toHaveBeenCalled());
    expect(screen.getByText("Loading...")).toBeTruthy();
  });
  test("should render if report exists", async () => {
    await act(async () => {
      render(<ReportPageWrapper />);
    });
    await waitFor(() => expect(mockGetReport).toHaveBeenCalled());

    await waitFor(() => {
      expect(screen.queryAllByText("General Information")).toBeDefined();
    });
    expect(screen.getByText("Continue")).toBeTruthy();
    expect(screen.queryAllByText("General Information")[0]).toBeTruthy();
  });
  test("button should be clickable", async () => {
    await act(async () => {
      render(<ReportPageWrapper />);
    });

    const continueBtn = screen.getByRole("button", { name: "Continue" });
    await userEvent.click(continueBtn);
    expect(mockNavigate).toHaveBeenCalledWith(
      "/report/RHTP/NJ/RHTPNJ123/mock-report-page"
    );
  });
});
