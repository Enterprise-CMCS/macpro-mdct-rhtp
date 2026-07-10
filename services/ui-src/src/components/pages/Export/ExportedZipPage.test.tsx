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
import userEvent from "@testing-library/user-event";

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

    fireEvent.input(search, { target: { value: "Annual" } });
    const checkbox1 = screen.getByRole("checkbox", { name: "Annual Report 1" });
    await userEvent.click(checkbox1);
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

    fireEvent.input(search, { target: { value: "Annual" } });
    const checkbox1 = screen.getByRole("checkbox", { name: "Annual Report 1" });
    await userEvent.click(checkbox1);
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
