import { MockedFunction } from "vitest";
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
import { testA11yAct } from "utils/testing/commonTests";
import { createReport, useStore } from "utils";
import { mockAdminUserStore } from "utils/testing/setupTest";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockAdminUserStore);

vi.mock("launchdarkly-react-client-sdk", () => ({
  useFlags: vi.fn().mockReturnValue({
    adminCanEditReport: true,
  }),
}));

const mockGetReport = vi.fn().mockResolvedValue([mockReport, mockReport2]);
vi.mock("../../utils/api/requestMethods/report", () => ({
  getReportByType: () => mockGetReport(),
  createReport: vi.fn(),
}));

vi.mock("../../utils/api/requestMethods/commentMethods", () => ({
  getComments: vi.fn().mockResolvedValue([]),
  createComment: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../utils/api/requestMethods/notificationRecipients", () => ({
  getAssignedStatesByEmail: vi.fn().mockResolvedValue([]),
}));

const mockUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockUseNavigate,
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

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
      screen.getByRole("heading", { name: "RHTP Admin Dashboard" })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Admin Instructions" })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "States select" })).toBeVisible();
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
    const stateFilter = screen.getByRole("button", { name: "States select" });
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
    expect(localStorage.getItem("states")).toEqual("AL,NJ");

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

  it("Can open and close comment drawer", async () => {
    const commentStatusButton = screen.getAllByRole("button", {
      name: "Comment/Status",
    })[0];
    await userEvent.click(commentStatusButton);
    expect(
      screen.getByRole("heading", { name: /Add comment to/ })
    ).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    expect(
      screen.queryByRole("heading", { name: /Add comment to/ })
    ).not.toBeInTheDocument();
  });

  it("Can open and close admin create report modal", async () => {
    const createReportButton = screen.getByRole("button", {
      name: "Start First Annual Report",
    });
    await userEvent.click(createReportButton);
    expect(
      screen.getByRole("heading", { name: "Start First Annual Report" })
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(
      screen.queryByRole("heading", { name: "Start First Annual Report" })
    ).not.toBeInTheDocument();
  });

  it("Cannot create report for state with existing report", async () => {
    const createReportButton = screen.getByRole("button", {
      name: "Start First Annual Report",
    });
    await userEvent.click(createReportButton);

    const stateDropdown = screen.getAllByLabelText("State")[1];
    await userEvent.click(stateDropdown);
    // mock reports for NJ and MN so should not see those options
    expect(
      screen.queryByRole("option", { name: "New Jersey" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Minnesota" })
    ).not.toBeInTheDocument();
  });

  it("Can create report for state with no existing report", async () => {
    const createReportButton = screen.getByRole("button", {
      name: "Start First Annual Report",
    });
    await userEvent.click(createReportButton);

    const stateDropdown = screen.getAllByLabelText("State")[1];
    await userEvent.click(stateDropdown);
    await userEvent.click(screen.getByRole("option", { name: "Alaska" }));
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(createReport).toHaveBeenCalled();
  });
});
describe("Test A11y", () => {
  testA11yAct(
    <RouterWrappedComponent>
      <AdminDashboard />
    </RouterWrappedComponent>
  );
});
