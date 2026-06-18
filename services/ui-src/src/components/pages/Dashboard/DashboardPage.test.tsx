import { Mock, MockedFunction } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardPage } from "components";
import { RouterWrappedComponent, mockUseStore } from "utils/testing/setupTest";
import { useStore } from "utils";
import { getReportsForState } from "utils/api/requestMethods/report";
import { Report } from "@rhtp/shared";
import { useParams } from "react-router";
import userEvent from "@testing-library/user-event";

window.HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock("utils/state/useStore", () => ({
  useStore: vi.fn().mockReturnValue({}),
}));
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockUseStore);

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useParams: vi.fn(() => ({
    reportType: "RHTP",
    state: "CO",
  })),
}));

const mockReportsInDatabase = [
  {
    id: "RHTPCO123",
    type: "RHTP",
    state: "CO",
    lastEdited: new Date("2026-10-24T08:31:54").valueOf(),
    lastEditedBy: "Mock User",
    status: "Not started",
    name: "Mock Report Name",
    budgetPeriod: 1,
    subTypeKey: "A1",
  } as Report,
  {
    id: "RHTPCO1234",
    type: "RHTP",
    state: "CO",
    lastEdited: new Date("2027-10-24T08:31:54").valueOf(),
    lastEditedBy: "Mock User",
    status: "Not started",
    name: "Mock Report 2027",
    budgetPeriod: 2,
    subTypeKey: "Q2",
  } as Report,
];

vi.mock("utils/api/requestMethods/report");
const mockGetReportsForState = vi.mocked(getReportsForState);
mockGetReportsForState.mockResolvedValue(mockReportsInDatabase);

vi.mock("utils/other/useBreakpoint", () => ({
  useBreakpoint: vi.fn(() => ({
    isDesktop: true,
  })),
}));

const dashboardComponent = (
  <RouterWrappedComponent>
    <DashboardPage />
  </RouterWrappedComponent>
);

describe("DashboardPage with state user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetReportsForState.mockResolvedValue(mockReportsInDatabase);
  });

  test("should render an empty state when there are no reports", async () => {
    (getReportsForState as Mock).mockResolvedValue([]);

    render(dashboardComponent);
    await waitFor(() => {
      expect(getReportsForState).toHaveBeenCalled();
    });

    expect(
      screen.getByRole("heading", {
        name: "Colorado RHTP",
      })
    ).toBeVisible();
    expect(
      screen.getByText("once you start a report you can access it here", {
        exact: false,
      })
    ).toBeVisible();
  });

  test("should not call reloadReports if no reportType passed in", async () => {
    (useParams as Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    render(dashboardComponent);
    expect(getReportsForState).toHaveBeenCalledTimes(0);
  });

  test("should render report data", async () => {
    const { container } = render(dashboardComponent);
    await waitFor(() => {
      expect(getReportsForState).toHaveBeenCalled();
      expect(screen.getByText("Mock Report Name")).toBeInTheDocument();
    });

    const table = container.querySelector("table")!;
    const columns = [...table.querySelectorAll("tr th")].map(
      (th) => th.textContent!
    );
    const rows = [...table.querySelectorAll("tbody tr")].map((tr) => [
      ...tr.querySelectorAll("td"),
    ]);

    expect(columns.length).toBeGreaterThanOrEqual(4);
    expect(rows.length).toBe(2);

    const cellContent = (columnName: string) => {
      const columnIndex = columns.indexOf(columnName);
      if (columnIndex === -1) throw new Error(`Could not find '${columnName}'`);
      const cell = rows[0][columnIndex];
      return cell.textContent;
    };
    expect(cellContent("Submission name")).toBe("Mock Report Name");
    expect(cellContent("Last edited")).toBe("10/24/2026");
    expect(cellContent("Edited by")).toBe("Mock User");
  });

  test("should be able to filter reports", async () => {
    const { container } = render(dashboardComponent);
    await waitFor(() => {
      expect(getReportsForState).toHaveBeenCalled();
      expect(screen.getByText("Mock Report Name")).toBeInTheDocument();
    });

    await userEvent.selectOptions(
      screen.queryAllByLabelText("Budget Period")[0],
      "Budget Period 1"
    );
    await userEvent.click(screen.getByText("Filter"));

    const table = container.querySelector("table")!;
    const columns = [...table.querySelectorAll("tr th")].map(
      (th) => th.textContent!
    );
    const rows = [...table.querySelectorAll("tbody tr")].map((tr) => [
      ...tr.querySelectorAll("td"),
    ]);

    expect(columns.length).toBeGreaterThanOrEqual(4);
    expect(rows.length).toBe(1);

    const cellContent = (columnName: string) => {
      const columnIndex = columns.indexOf(columnName);
      if (columnIndex === -1) throw new Error(`Could not find '${columnName}'`);
      const cell = rows[0][columnIndex];
      return cell.textContent;
    };
    expect(cellContent("Submission name")).toBe("Mock Report Name");
    expect(cellContent("Last edited")).toBe("10/24/2026");
    expect(cellContent("Edited by")).toBe("Mock User");
    expect(screen.queryByText("Mock Report 2027")).not.toBeInTheDocument();
  });

  test("should be able to open the modal to start new report", async () => {
    (getReportsForState as Mock).mockResolvedValue([]);
    render(dashboardComponent);
    await waitFor(() => {
      expect(getReportsForState).toHaveBeenCalled();
    });

    const reportModalButton = screen.getByRole("button", {
      name: "Start RHTP Report",
    });
    expect(reportModalButton).toBeEnabled();
    await userEvent.click(reportModalButton);

    expect(screen.getByText("Add New RHTP Report")).toBeInTheDocument();
  });
});
