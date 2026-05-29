import { MockedFunction } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateReportModal } from "components";
import {
  mockStateUserStore,
  RouterWrappedComponent,
} from "utils/testing/setupTest";
import { useStore } from "utils";
import { ReportType } from "@rhtp/shared";
import { testA11yAct } from "utils/testing/commonTests";

const mockCloseHandler = vi.fn();
const mockReportHandler = vi.fn();
const mockCreateReport = vi.fn();
const mockUpdateReport = vi.fn();
const mockGetReportsForState = vi.fn();

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
    <CreateReportModal
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
  beforeEach(async () => {
    await act(async () => {
      await render(addModalComponent);
    });
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
  beforeEach(async () => {
    await act(async () => {
      await render(addModalComponent);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Add Report Modal shows proper add contents", () => {
    expect(screen.getByText("Add New RHTP Report")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  testA11yAct(addModalComponent);
});

describe("Test submit", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test("Simulate submitting modal", async () => {
    await act(async () => {
      await render(addModalComponent);
    });
    const submitBtn = screen.getByText("Save");
    await userEvent.click(submitBtn);

    expect(mockReportHandler).toHaveBeenCalled();
    expect(mockCreateReport).toHaveBeenCalled();
  });
});

describe("Test CreateReportModal types", () => {
  test.each([{ type: ReportType.RHTP, text: "RHTP Report" }])(
    "$type report type renders a title",
    ({ type, text }) => {
      render(
        <RouterWrappedComponent>
          <CreateReportModal
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
      expect(screen.getByText(`Add New ${text}`)).toBeInTheDocument();
    }
  );
});
