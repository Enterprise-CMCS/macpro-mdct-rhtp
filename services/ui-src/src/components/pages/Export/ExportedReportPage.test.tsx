import { MockedFunction } from "vitest";
import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useStore } from "utils";
import { mockUseStore } from "utils/testing/setupTest";
import { ExportedReportPage } from "./ExportedReportPage";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;

const report = {
  type: "RHTP",
  id: "mock-report-id",
  state: "PA",
  name: "mock-title",
  pages: [
    { childPageIds: ["1", "2"] },
    { title: "Section 1", id: "id-1" },
    { title: "Section 2", id: "id-2" },
    { title: "Section 3", id: "review-submit" },
  ],
  lastEdited: 1751987780396,
  lastEditedBy: "last edited",
  status: "In progress",
  options: {
    cahps: true,
    nciidd: false,
    nciad: true,
    pom: false,
  },
};

describe("ExportedReportPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseStore.mockReturnValue({
      report: report,
    });
  });
  it("ExportReportPage is visible", () => {
    render(
      <MemoryRouter>
        <ExportedReportPage></ExportedReportPage>
      </MemoryRouter>
    );
    expect(
      screen.getByText("Pennsylvania RHTP for: mock-title")
    ).toBeInTheDocument();
  });

  it("Should not render filtered sections", () => {
    render(
      <MemoryRouter>
        <ExportedReportPage></ExportedReportPage>
      </MemoryRouter>
    );
    expect(screen.queryByText("Section 4")).not.toBeInTheDocument();
  });
});
