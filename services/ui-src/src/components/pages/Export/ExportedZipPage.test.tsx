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

  test("Modal By Reports open and closes", async () => {
    const exportBtns = screen.getAllByRole("button", { name: "Export" });
    await userEvent.click(exportBtns[0]);
    expect(
      screen.getByText(
        "Report includes all states. Select one or many reports to include in the download."
      )
    ).toBeVisible();

    const dropdown = screen.getByRole("button", { name: "Reports select" });
    fireEvent.input(dropdown, { target: { value: "plan id" } });

    userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  });

  test("Modal By Reports exist", async () => {
    const exportBtns = screen.getAllByRole("button", { name: "Export" });
    await userEvent.click(exportBtns[1]);
    expect(
      screen.getByText(
        "Select one State and one or many reports to include in the download."
      )
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Reports select" })
    ).toBeVisible();
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
