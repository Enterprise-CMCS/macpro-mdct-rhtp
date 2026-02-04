import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusTableElement } from "./StatusTable";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useStore } from "utils";
import {
  mockUseReadOnlyUserStore,
  mockStateUserStore,
} from "utils/testing/setupTest";
import { PageStatus } from "types";

vi.mock("utils", () => ({
  useStore: vi.fn(),
  submitReport: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

vi.mock("launchdarkly-react-client-sdk", () => ({
  useFlags: vi.fn().mockReturnValue({
    viewPdf: true,
  }),
}));

const report = {
  type: "RHTP",
  id: "mock-report-id",
  state: "CO",
  pages: [
    { childPageIds: ["1", "2"] },
    { title: "Section 1", id: "id-1" },
    { title: "Section 2", id: "id-2" },
  ],
};

const mockPageMap = new Map();
mockPageMap.set("root", 0);
mockPageMap.set("1", 1);
mockPageMap.set("2", 2);

const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
const mockSetModalComponent = vi.fn();

describe("StatusTable with state user", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseStore.mockImplementation(
      (selector?: Parameters<typeof useStore>[0]) => {
        if (selector) {
          return {
            sections: [
              {
                section: { title: "Section 1", id: "id-1" },
                displayStatus: PageStatus.COMPLETE,
                submittable: true,
              },
              {
                section: { title: "Section 2", id: "id-2" },
                displayStatus: PageStatus.IN_PROGRESS,
                submittable: false,
              },
            ],
            submittable: true,
          };
        }
        return {
          ...mockStateUserStore,
          pageMap: mockPageMap,
          report: report,
          setModalComponent: mockSetModalComponent,
        };
      }
    );
  });

  test("table with section titles and status icons render", () => {
    render(
      <MemoryRouter>
        <StatusTableElement />
      </MemoryRouter>
    );

    // Table headers
    expect(screen.getByText("Section")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    // Section title and status for Section 1
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByAltText("complete icon")).toBeInTheDocument();
  });

  it("should navigate to the correct editable page when the Edit button is clicked", async () => {
    render(
      <MemoryRouter>
        <StatusTableElement />
      </MemoryRouter>
    );

    const editButton = screen.getAllByRole("button", { name: /Edit/i })[0];
    await userEvent.click(editButton);

    expect(editButton).toBeVisible();
  });
  it("should navigate to PDF when the Review PDF button is clicked", async () => {
    render(
      <MemoryRouter>
        <StatusTableElement />
      </MemoryRouter>
    );

    const reviewPdfButton = screen.getByRole("link", { name: /Review PDF/i });

    const PdfPath = `/report/${report.type}/${report.state}/${report.id}/export`;
    expect(reviewPdfButton).toHaveAttribute("href", PdfPath);
    expect(reviewPdfButton).toHaveAttribute("target", "_blank");
  });

  it("should call the API and render RHTP submit modal when the Submit button is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/report/RHTP/CO/mock-report-id"]}>
        <Routes>
          <Route
            path="/report/:reportType/:state/:reportId"
            element={<StatusTableElement />}
          />
        </Routes>
      </MemoryRouter>
    );

    const submitButton = screen.getAllByRole("button", {
      name: /Submit RHTP Report/i,
    })[0];
    await userEvent.click(submitButton);

    expect(mockSetModalComponent).toHaveBeenCalled();
  });

  it("should render the correct submit button text when reportType is from the URL", async () => {
    render(
      <MemoryRouter initialEntries={["/report/RHTP/CO/mock-report-id"]}>
        <Routes>
          <Route
            path="/report/:reportType/:state/:reportId"
            element={<StatusTableElement />}
          />
        </Routes>
      </MemoryRouter>
    );

    const submitButton = screen.getAllByRole("button", {
      name: /Submit RHTP Report/i,
    })[0];
    expect(submitButton).toBeInTheDocument();
  });

  it("should disable the submit button when submittable is false", async () => {
    mockedUseStore.mockImplementation(
      (selector?: Parameters<typeof useStore>[0]) => {
        if (selector) {
          return {
            sections: [
              {
                section: { title: "Section 1", id: "id-1" },
                displayStatus: PageStatus.COMPLETE,
                submittable: true,
              },
            ],
            submittable: false,
          };
        }
        return {
          ...mockStateUserStore,
          pageMap: mockPageMap,
          report: report,
          setModalComponent: mockSetModalComponent,
        };
      }
    );

    render(
      <MemoryRouter initialEntries={["/report/RHTP/CO/mock-report-id"]}>
        <Routes>
          <Route
            path="/report/:reportType/:state/:reportId"
            element={<StatusTableElement />}
          />
        </Routes>
      </MemoryRouter>
    );

    const submitButton = screen.getByRole("button", {
      name: /Submit RHTP Report/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("should not render anything if report is undefined", () => {
    mockedUseStore.mockImplementation(() => ({
      ...mockStateUserStore,
      pageMap: mockPageMap,
      report: undefined,
      setModalComponent: mockSetModalComponent,
    }));

    const { container } = render(
      <MemoryRouter>
        <StatusTableElement />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });
});

describe("StatusPage with Read only user", () => {
  beforeEach(() => {
    mockedUseStore.mockImplementation(
      (selector?: Parameters<typeof useStore>[0]) => {
        if (selector) {
          return {
            sections: [
              {
                section: { title: "Section 1", id: "id-1" },
                displayStatus: PageStatus.COMPLETE,
                submittable: true,
              },
              {
                section: { title: "Section 2", id: "id-2" },
                displayStatus: PageStatus.IN_PROGRESS,
                submittable: false,
              },
            ],
            submittable: true,
          };
        }
        return {
          ...mockUseReadOnlyUserStore,
          pageMap: mockPageMap,
          report: report,
          setModalComponent: mockSetModalComponent,
        };
      }
    );
  });
  it("should not render the Submit RHTP Report button when user is read only", async () => {
    render(
      <MemoryRouter>
        <StatusTableElement />
      </MemoryRouter>
    );

    const submitButton = screen.queryByText("Submit RHTP Report");
    expect(submitButton).not.toBeInTheDocument();
  });
});
