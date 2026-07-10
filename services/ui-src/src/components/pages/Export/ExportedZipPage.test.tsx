import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ExportedZipPage } from "./ExportedZipPage";
import { testA11yAct } from "utils/testing/commonTests";
import { RouterWrappedComponent } from "utils/testing/mockRouter";
import { mockReport, mockReport2 } from "utils/testing/mockForm";
import userEvent from "@testing-library/user-event";
import { ElementType, PageType } from "@rhtp/shared";

const useOfFunds = [
  {
    id: "use-of-funds",
    type: PageType.Standard,
    title: "Use Of Funds",
    elements: [
      {
        id: "use of funds attachment",
        type: ElementType.UseOfFundsAttachment,
        label: "",
        required: false,
        answer: [
          {
            name: "file",
            size: 0,
            fileId: "mock-file-id",
          },
        ],
      },
    ],
  },
];

const mockGetReport = vi.fn().mockResolvedValue([
  { ...mockReport, pages: useOfFunds },
  { ...mockReport2, pages: useOfFunds },
]);
vi.mock("utils", async (importOriginal) => ({
  ...(await importOriginal()),
  getReportByType: () => mockGetReport(),
}));

const mockGetZipFile = vi.fn();
vi.mock("utils/state/reportLogic/reportActions", () => ({
  getZipFile: () => mockGetZipFile(),
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("ExportedZipPage", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await act(async () => {
      render(
        <RouterWrappedComponent>
          <ExportedZipPage />
        </RouterWrappedComponent>
      );
    });
    await waitFor(() => {
      expect(screen.queryAllByText("Export")).toHaveLength(2);
    });
  });

  test("ExportedZipPage renders", async () => {
    expect(screen.getByText("Export RHTP Files and Data")).toBeVisible();
    expect(
      screen.getByText("Use of Funds: By Reports (includes All States)")
    ).toBeVisible();
    expect(
      screen.getByText("Use of Funds: By State and Report(s)")
    ).toBeVisible();
  });

  test("Modal By Reports user interactions", async () => {
    const exportBtns = screen.getAllByRole("button", { name: "Export" });
    await userEvent.click(exportBtns[0]);
    expect(
      screen.getByText(
        "Report includes all states. Select one or many reports to include in the download."
      )
    ).toBeVisible();

    const reportFilter = screen.getByRole("button", { name: "Reports select" });
    fireEvent.click(reportFilter);

    const search = screen.getByRole("searchbox", {
      name: "Search Reports by name",
    });

    fireEvent.input(search, { target: { value: "plan" } });
    const checkbox1 = screen.getByRole("checkbox", { name: "plan id" });
    await userEvent.click(checkbox1);

    const exportBtn = screen.getByRole("button", { name: "Export" });
    await userEvent.click(exportBtn);
    expect(mockGetZipFile).toHaveBeenCalled();

    userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  });

  test("Modal By Reports and State user interactions", async () => {
    const exportBtns = screen.getAllByRole("button", { name: "Export" });
    await userEvent.click(exportBtns[1]);
    expect(
      screen.getByText(
        "Select one State and one or many reports to include in the download."
      )
    ).toBeVisible();

    const dropdown = screen.getAllByLabelText("State")[0];
    await userEvent.selectOptions(dropdown, "NJ");

    const reportFilter = screen.getByRole("button", { name: "Reports select" });
    fireEvent.click(reportFilter);

    const search = screen.getByRole("searchbox", {
      name: "Search Reports by name",
    });

    fireEvent.input(search, { target: { value: "plan" } });
    const checkbox1 = screen.getByRole("checkbox", { name: "plan id" });
    await userEvent.click(checkbox1);

    const exportBtn = screen.getByRole("button", { name: "Export" });
    await userEvent.click(exportBtn);
    expect(mockGetZipFile).toHaveBeenCalled();

    userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  });
});

describe("Test A11y", () => {
  testA11yAct(
    <RouterWrappedComponent>
      <ExportedZipPage />
    </RouterWrappedComponent>
  );
});
