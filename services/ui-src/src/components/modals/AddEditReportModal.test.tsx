import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddEditReportModal } from "components";
import {
  mockStateUserStore,
  RouterWrappedComponent,
} from "utils/testing/setupTest";
import { useStore } from "utils";
import { LiteReport, ReportType } from "../../types";
import assert from "node:assert";
import { testA11y } from "utils/testing/commonTests";

const mockCloseHandler = vi.fn();
const mockReportHandler = vi.fn();
const mockCreateReport = vi.fn();
const mockUpdateReport = vi.fn();
const mockGetReportsForState = vi.fn().mockResolvedValue([
  {
    id: "1",
    name: "mock-name-a",
    year: 2026,
  } as LiteReport,
]);

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockStateUserStore);

vi.mock("utils/api/requestMethods/report", () => ({
  updateReport: () => mockUpdateReport(),
  createReport: () => mockCreateReport(),
  getReportsForState: () => mockGetReportsForState(),
}));

const addModalComponent = (
  <RouterWrappedComponent>
    <AddEditReportModal
      activeState="AB"
      reportType={ReportType.RHTP}
      modalDisclosure={{
        isOpen: true,
        onClose: mockCloseHandler,
      }}
      reportHandler={mockReportHandler}
    />
  </RouterWrappedComponent>
);

const editModalComponent = (
  <RouterWrappedComponent>
    <AddEditReportModal
      activeState="AB"
      reportType={ReportType.RHTP}
      modalDisclosure={{
        isOpen: true,
        onClose: mockCloseHandler,
      }}
      reportHandler={mockReportHandler}
      selectedReport={
        {
          name: "report name thing",
          year: 2026,
        } as LiteReport
      }
    />
  </RouterWrappedComponent>
);

describe("Test general modal functionality", () => {
  beforeEach(() => {
    render(addModalComponent);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Modal top close button can be clicked", async () => {
    await userEvent.click(screen.getByText("Close"));
    expect(mockCloseHandler).toHaveBeenCalledTimes(1);
  });

  test("Modal bottom cancel button can be clicked", async () => {
    await userEvent.click(screen.getByText("Cancel"));
    expect(mockCloseHandler).toHaveBeenCalledTimes(1);
  });
});

describe("Test Add Report Modal", () => {
  beforeEach(() => {
    render(addModalComponent);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Add Report Modal shows proper add contents", () => {
    expect(screen.getByText("Add new RHTP Report")).toBeInTheDocument();
    expect(screen.getByText("RHTP Report Name")).toBeInTheDocument();
    expect(screen.getByText("Start new")).toBeInTheDocument();
  });

  testA11y(addModalComponent);
});

describe("Test Edit Report Modal", () => {
  beforeEach(() => {
    render(editModalComponent);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Edit report modal shows the proper edit contents with editable name", () => {
    expect(screen.getByText("Edit RHTP Report")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByDisplayValue("report name thing")).toBeInTheDocument();
  });
});

describe("Test dropdown for year", () => {
  beforeEach(() => {
    render(addModalComponent);
  });

  test("Assert dropdown options are rendered", () => {
    const dropdown = screen.getByRole("button", {
      name: "2026 Reporting Year",
    });
    expect(dropdown).toBeInTheDocument();
  });

  test("Simulate selecting a year", async () => {
    const dropdown = screen.getAllByLabelText("Reporting Year")[0];
    assert(dropdown instanceof HTMLSelectElement);
    await userEvent.selectOptions(dropdown, "2026");
    expect(dropdown.value).toBe("2026");
  });
});

describe("Test submit", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test("Simulate submitting modal", async () => {
    render(addModalComponent);
    const nameTextbox = screen.getByRole("textbox", {
      name: "RHTP Report Name",
    });
    await userEvent.type(nameTextbox, "mock-name");

    const submitBtn = screen.getByText("Start new");
    await userEvent.click(submitBtn);

    expect(mockReportHandler).toHaveBeenCalled();
    expect(mockCreateReport).toHaveBeenCalled();
  });

  test("Simulate submitting an edited report", async () => {
    render(editModalComponent);

    const nameTextbox = screen.getByRole("textbox", {
      name: "RHTP Report Name",
    });
    expect(nameTextbox).toBeInTheDocument();
    await userEvent.type(nameTextbox, "mock-edit-report");

    const submitBtn = screen.getByText("Save");
    expect(submitBtn).toBeInTheDocument();

    await userEvent.click(submitBtn);
    expect(mockUpdateReport).toHaveBeenCalled();
  });
});

describe("Test in line validation", () => {
  test("Simulate submitting modal with duplicate report name", async () => {
    const user = userEvent.setup();
    render(addModalComponent);
    const nameTextbox = screen.getByRole("textbox", {
      name: "RHTP Report Name",
    }) as HTMLInputElement;

    await user.click(nameTextbox);
    await user.paste("mock-name-a");

    expect(nameTextbox.value).toBe("mock-name-a");
    expect(
      screen.getByText(
        "A report with this name already exists during this reporting period."
      )
    ).toBeInTheDocument();

    const submitBtn = screen.getByText("Start new");
    await user.click(submitBtn);

    // Form should not submit when there's a validation error
    expect(mockReportHandler).not.toHaveBeenCalled();
    expect(mockCreateReport).not.toHaveBeenCalled();
  });
});

describe("Test AddEditReportModal types", () => {
  test.each([{ type: ReportType.RHTP, text: "RHTP Report" }])(
    "$type report type renders a title",
    ({ type, text }) => {
      render(
        <RouterWrappedComponent>
          <AddEditReportModal
            activeState="AB"
            reportType={type}
            modalDisclosure={{
              isOpen: true,
              onClose: mockCloseHandler,
            }}
            reportHandler={mockReportHandler}
          />
        </RouterWrappedComponent>
      );
      expect(screen.getByText(`Add new ${text}`)).toBeInTheDocument();
    }
  );
});
