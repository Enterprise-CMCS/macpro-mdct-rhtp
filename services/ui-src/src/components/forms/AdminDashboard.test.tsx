import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AdminDashboard } from "./AdminDashboard";
import { RouterWrappedComponent } from "utils/testing/mockRouter";
import { mockReport, mockReport2 } from "utils/testing/mockForm";
import userEvent from "@testing-library/user-event";
import { testA11y } from "utils/testing/commonTests";

const mockGetReport = vi.fn().mockResolvedValue([mockReport, mockReport2]);
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
      name: "Search States by name",
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
    await waitFor(() => {
      expect(screen.queryByText("plan id")).toBeVisible();
    });

    const sortResult = async (
      sort: string,
      columns: number[],
      results: string[]
    ) => {
      const content = screen.getAllByRole("cell");
      const sortBtn = screen.getByRole("button", { name: sort });
      await userEvent.click(sortBtn);
      expect([
        content[columns[0]].textContent,
        content[columns[1]].textContent,
      ]).toStrictEqual(results);
      await userEvent.click(sortBtn);
      expect([
        content[columns[0]].textContent,
        content[columns[1]].textContent,
      ]).toStrictEqual(results.toReversed());
    };

    await sortResult("State/Territory", [0, 7], ["Minnesota", "New Jersey"]);
    await sortResult("Report Name", [1, 8], ["plan id", "plan mn id"]);
    await sortResult("Budget Period", [2, 9], ["1", "2"]);
    await sortResult("Last Edited", [3, 10], ["04/17/2026", "04/17/2026"]);
    await sortResult("Status", [4, 11], ["In progress", "Not started"]);
  });

  it("View report", async () => {
    await waitFor(() => {
      expect(screen.getByText("plan id")).toBeVisible();
    });
    const reportBtn = screen.getAllByRole("button", { name: "View Report" });
    await userEvent.click(reportBtn[0]);
    expect(mockUseNavigate).toHaveBeenCalled();
  });
});
describe("Test A11y", () => {
  testA11y(
    <RouterWrappedComponent>
      <AdminDashboard />
    </RouterWrappedComponent>
  );
});
