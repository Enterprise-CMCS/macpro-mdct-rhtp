import { MockedFunction } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportStatus, ReportType, RhtpSubType } from "@rhtp/shared";
import { useStore } from "utils";
import { DevDashboardTools } from "./DevDashboardTools";

const mockReloadReports = vi.fn();

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
const mockSetDevDate = vi.fn();
mockedUseStore.mockReturnValue({
  setDevDate: mockSetDevDate,
});

const mockDeleteReport = vi.fn();
const mockDeleteReportsForState = vi.fn();

vi.mock("utils/api/requestMethods/report", () => ({
  deleteReport: () => mockDeleteReport(),
  deleteReportsForState: () => mockDeleteReportsForState(),
}));

const StateDashboardTools = (
  <DevDashboardTools
    reportType={ReportType.RHTP}
    state={"PA"}
    reloadReports={mockReloadReports}
    reports={[
      {
        id: "mock-report-id",
        state: "PA",
        type: ReportType.RHTP,
        created: 0,
        status: ReportStatus.NOT_STARTED,
        submissionCount: 0,
        name: "mock-report",
        subType: RhtpSubType.ANNUAL,
        subTypeKey: "",
        budgetPeriod: 0,
      },
    ]}
  />
);

describe("Test DevTools component", () => {
  beforeEach(() => {
    render(StateDashboardTools);
  });
  it("Mock selecting a date", async () => {
    const selectDate = screen.getByLabelText("select an open date");
    fireEvent.change(selectDate, { target: { value: "1790740800000" } });
    expect(mockSetDevDate).toHaveBeenCalled();
  });
  it("Mock delete report", async () => {
    const selectReport = screen.getByLabelText("select a report to delete");
    const deleteBtn = screen.getByRole("button", { name: "Delete Report" });

    fireEvent.change(selectReport, { target: { value: "PA#mock-report-id" } });
    await userEvent.click(deleteBtn);
    expect(mockDeleteReport).toHaveBeenCalled();
    expect(mockReloadReports).toHaveBeenCalled();
  });
  it("Mock delete all report", async () => {
    const deleteAllBtn = screen.getByRole("button", {
      name: "Delete All RHTP Reports For PA",
    });
    await userEvent.click(deleteAllBtn);
    expect(mockDeleteReportsForState).toHaveBeenCalled();
    expect(mockReloadReports).toHaveBeenCalled();
  });
});
