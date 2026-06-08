import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardTable } from "components";
import { ReportStatus, Report } from "@rhtp/shared";
import { useStore } from "utils";
import { mockUseStore, RouterWrappedComponent } from "utils/testing/setupTest";

vi.mock("utils/state/useStore", () => ({
  useStore: vi.fn().mockReturnValue({}),
}));
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockUseStore);

const reports = [
  {
    id: "abc",
    name: "report 1",
    submissionCount: 0,
    status: ReportStatus.IN_PROGRESS,
  },
  {
    id: "xyz",
    name: "report 2",
    submissionCount: 0,
    status: ReportStatus.SUBMITTED,
  },
  {
    id: "123",
    name: "report 3",
    submissionCount: 1,
    status: ReportStatus.IN_PROGRESS,
  },
] as Report[];

const dashboardTableComponent = (
  <RouterWrappedComponent>
    <DashboardTable reports={reports} />
  </RouterWrappedComponent>
);

describe("Dashboard table with state user", () => {
  beforeEach(() => vi.clearAllMocks());
  test("should render report name and edit button in table", async () => {
    render(dashboardTableComponent);
    expect(screen.getByText("report 1")).toBeVisible();
  });
  test("should render In revision text for a returned report", async () => {
    render(dashboardTableComponent);
    // Setup data includes In Progress with Submission Count >= 1
    expect(screen.getByText("In revision")).toBeVisible();
  });
});
