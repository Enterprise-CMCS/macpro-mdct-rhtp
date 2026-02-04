import { MockedFunction } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ElementType,
  PageType,
  Report,
  ReportStatus,
  ReportType,
} from "types/report";
import { ReportPageWrapper } from "./ReportPageWrapper";
import { useStore } from "utils";
import { ReportAutosaveProvider } from "./ReportAutosaveProvider";

const testReport: Report = {
  type: ReportType.RHTP,
  name: "plan id",
  state: "NJ",
  id: "NJQMS123",
  year: 2026,
  status: ReportStatus.NOT_STARTED,
  archived: false,
  submissionCount: 0,
  pages: [
    {
      id: "root",
      childPageIds: ["general-info", "req-measure-result"],
    },
    {
      id: "general-info",
      title: "General Information",
      type: PageType.Standard,
      sidebar: true,
      elements: [
        {
          type: ElementType.Textbox,
          id: "mock-textbox",
          label: "Contact title",
          required: true,
          helperText:
            "Enter person's title or a position title for CMS to contact with questions about this request.",
        },
        {
          type: ElementType.Textbox,
          id: "another-textbox",
          required: true,
          label: "Another textbox",
        },
      ],
    },
    {
      id: "req-measure-result",
      title: "Required Measure Results",
      type: PageType.Standard,
      sidebar: true,
      elements: [
        {
          type: ElementType.Header,
          id: "",
          text: "Required Measure Results",
        },
      ],
    },
  ],
};

const mockUseParams = vi.fn();
const mockNavigate = vi.fn();
const mockSaveReport = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: () => mockUseParams(),
  useNavigate: () => mockNavigate,
}));

const mockGetReport = vi.fn().mockResolvedValue(testReport);
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
      report: testReport,
      pageMap: new Map([
        ["root", 0],
        ["general-info", 1],
        ["req-measure-result", 2],
      ]),
      currentPageId: "general-info",
      parentPage: {
        index: 0,
        childPageIds: ["general-info", "req-measure-result"],
      },
      saveReport: mockSaveReport,
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
      reportId: "QMSNJ123",
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
      "/report/RHTP/NJ/QMSNJ123/req-measure-result"
    );
  });

  test("run autosave when a text field has changed", async () => {
    vi.useFakeTimers();

    global.structuredClone = (val: unknown) => {
      return JSON.parse(JSON.stringify(val));
    };

    await act(async () => {
      render(
        <ReportAutosaveProvider>
          <ReportPageWrapper />
        </ReportAutosaveProvider>
      );
    });

    const textbox = screen.getByLabelText("Contact title");
    await act(async () => {
      fireEvent.change(textbox, { target: { value: "2027" } });
    });
    expect(textbox).toHaveValue("2027");

    vi.runAllTimers();
    await waitFor(() => expect(mockSaveReport).toHaveBeenCalled());
  });
});
