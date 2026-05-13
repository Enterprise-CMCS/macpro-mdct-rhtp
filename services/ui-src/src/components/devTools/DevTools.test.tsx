import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DevTools } from "./DevTools";
import { ReportStatus, ReportType, RhtpSubType } from "@rhtp/shared";
import { useFlags } from "launchdarkly-react-client-sdk";
import userEvent from "@testing-library/user-event";
import { useStore } from "utils";
import { MockedFunction } from "vitest";

const mockReloadReports = vi.fn();

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
const mockSetDevDate = vi.fn();
mockedUseStore.mockReturnValue({
  setDevDate: mockSetDevDate,
});

vi.mock("launchdarkly-react-client-sdk");
const mockFlags = vi.mocked(useFlags);
mockFlags.mockReturnValue({
  devTools: true,
});

const mockDeleteReport = vi.fn();
const mockDeleteReportsForState = vi.fn();

vi.mock("utils/api/requestMethods/report", () => ({
  deleteReport: () => mockDeleteReport(),
  deleteReportsForState: () => mockDeleteReportsForState(),
}));

describe("Test DevTools component", () => {
  beforeEach(() => {
    render(
      <DevTools
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
  });
  it("DevTools renders", () => {
    expect(screen.getByRole("button", { name: "Dev Tools" })).toBeVisible();
  });
  it("Clicking DevTools button expands to more options", async () => {
    const devBtn = screen.getByRole("button", { name: "Dev Tools" });
    await userEvent.click(devBtn);
    waitFor(() => {
      expect(screen.getByText("Current Dev Date:")).toBeVisible();
    });
    expect(screen.getByRole("button", { name: "Delete Report" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Delete All RHTP Reports For PA" })
    ).toBeVisible();
  });
  it("Mock seleting a date", async () => {
    const devBtn = screen.getByRole("button", { name: "Dev Tools" });
    await userEvent.click(devBtn);
    const selectDate = screen.getByLabelText("select an open date");
    fireEvent.change(selectDate, { target: { value: "1790740800000" } });
    expect(mockSetDevDate).toHaveBeenCalled();
  });
  it("Mock delete report", async () => {
    const devBtn = screen.getByRole("button", { name: "Dev Tools" });
    await userEvent.click(devBtn);
    const selectReport = screen.getByLabelText("select a report to delete");
    const deleteBtn = screen.getByRole("button", { name: "Delete Report" });

    fireEvent.change(selectReport, { target: { value: "mock-report-id" } });
    await userEvent.click(deleteBtn);
    expect(mockDeleteReport).toHaveBeenCalled();
    expect(mockReloadReports).toHaveBeenCalled();
  });
  it("Mock delete all report", async () => {
    const devBtn = screen.getByRole("button", { name: "Dev Tools" });
    await userEvent.click(devBtn);
    const deleteAllBtn = screen.getByRole("button", {
      name: "Delete All RHTP Reports For PA",
    });
    await userEvent.click(deleteAllBtn);
    expect(mockDeleteReportsForState).toHaveBeenCalled();
    expect(mockReloadReports).toHaveBeenCalled();
  });
});
