import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AdminDashboard } from "./AdminDashboard";
import { RouterWrappedComponent } from "utils/testing/mockRouter";
import { mockReport } from "utils/testing/mockForm";
import userEvent from "@testing-library/user-event";

const mockGetReport = vi.fn().mockResolvedValue([mockReport]);
vi.mock("../../utils/api/requestMethods/report", () => ({
  getReportByType: () => mockGetReport(),
}));

const mockUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockUseNavigate,
}));

describe("<AdminDashboard />", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await act(async () => {
      render(
        <RouterWrappedComponent>
          <AdminDashboard />
        </RouterWrappedComponent>
      );
    });
  });
  it("AdminDashboard renders", async () => {
    expect(
      screen.getByRole("heading", { name: "Admin Dashboard" })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Instructions" })).toBeVisible();
    expect(screen.getByRole("button", { name: "States Filter" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "All Budget Period" })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Clear All Filters" })
    ).toBeVisible();

    await waitFor(() => {
      expect(
        screen.queryByRole("columnheader", { name: "State/Territory" })
      ).toBeVisible();
    });

    expect(screen.getByText("plan id")).toBeVisible();
  });

  it("State filters are selectable", async () => {
    await waitFor(() => {
      expect(screen.getByText("plan id")).toBeVisible();
    });
    const stateFilter = screen.getByRole("button", { name: "States Filter" });
    fireEvent.click(stateFilter);

    const search = screen.getByRole("searchbox", {
      name: "Search states by name",
    });
    fireEvent.input(search, { target: { value: "New Jersey" } });
    const checkbox1 = screen.getByRole("checkbox", { name: "New Jersey" });
    await userEvent.click(checkbox1);
    fireEvent.input(search, { target: { value: "Ala" } });
    const checkbox2 = screen.getByRole("checkbox", { name: "Alabama" });
    await userEvent.click(checkbox2);

    expect(
      screen.getByRole("button", { name: "Remove New Jersey tag" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Alabama tag" })
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Alabama tag" })
    );

    expect(
      screen.queryByRole("button", { name: "Remove Alabama tag" })
    ).not.toBeInTheDocument();

    const clearFilterBtn = screen.getByRole("button", {
      name: "Clear All Filters",
    });
    await userEvent.click(clearFilterBtn);
    expect(
      screen.queryByRole("button", { name: "Remove New Jersey tag" })
    ).not.toBeInTheDocument();
  });

  it("Table sort are clickable", async () => {
    const sorts = [
      "State/Territory",
      "Report Name",
      "Budget Period",
      "Last Edited",
      "Status",
    ];

    for (var i = 0; i < sorts.length; i++) {
      const sortBtn = screen.getByRole("button", { name: sorts[i] });
      await userEvent.click(sortBtn);
    }
  });

  it("View report", async () => {
    await waitFor(() => {
      expect(screen.getByText("plan id")).toBeVisible();
    });
    const reportBtn = screen.getByRole("button", { name: "View Report" });
    await userEvent.click(reportBtn);
    expect(mockUseNavigate).toHaveBeenCalled();
  });
});
