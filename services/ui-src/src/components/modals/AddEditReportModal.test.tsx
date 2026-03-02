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
    expect(screen.getByText("Add new RHTP submission")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  testA11y(addModalComponent);
});

describe("Test submit", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test("Simulate submitting modal", async () => {
    render(addModalComponent);
    const submitBtn = screen.getByText("Save");
    await userEvent.click(submitBtn);

    expect(mockReportHandler).toHaveBeenCalled();
    expect(mockCreateReport).toHaveBeenCalled();
  });
});

describe("Test AddEditReportModal types", () => {
  test.each([{ type: ReportType.RHTP, text: "RHTP submission" }])(
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
