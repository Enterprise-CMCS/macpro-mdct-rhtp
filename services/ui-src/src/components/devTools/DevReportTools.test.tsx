import { Mock } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DevReportTools } from "./DevReportTools";
import { mockUseStore } from "utils/testing/setupTest";
import { ElementType, PageStatus } from "@rhtp/shared";
import userEvent from "@testing-library/user-event";
import { useStore } from "utils";

const mockSetAnswer = vi.fn();

vi.mock("utils/api/requestMethods/fileMethods", async (importOriginal) => ({
  ...(await importOriginal()),
  getFileDownloadUrl: vi.fn(),
  deleteUploadedFile: vi.fn(),
  uploadFileToS3: vi.fn(),
  recordFileInDatabaseAndGetUploadUrl: vi
    .fn()
    .mockReturnValue({ presignedUploadUrl: "", fileId: "" }),
  getUploadedFiles: vi
    .fn()
    .mockReturnValue([
      { filename: "mock-name", fileSize: 100, fileId: "mock-id" },
    ]),
}));

const reportUseStore = {
  report: {
    id: "test-report",
    pages: [
      {
        id: "mock-optional",
        elements: [],
      },
      {
        id: "mock-initiative-1",
        title: "Mock Initiative 1",
        initiativeNumber: "123",
        status: "In Progress",
        elements: [],
      },
      {
        id: "mock-initiative-2",
        title: "Mock Initiative 2",
        initiativeNumber: "456",
        status: "In Progress",
        elements: [],
      },
    ],
  },
  setAnswers: mockSetAnswer,
};

const sections = [
  {
    section: { title: "Mock Page", id: "mock-page" },
    displayStatus: PageStatus.NOT_STARTED,
    submittable: true,
  },
  {
    section: { title: "Initiatives", id: "initiatives" },
    displayStatus: PageStatus.NOT_STARTED,
    submittable: true,
  },
  {
    section: { title: "Mock Optional", id: "mock-optional" },
    displayStatus: PageStatus.OPTIONAL,
    submittable: true,
  },
];

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });

vi.mock("utils/state/useStore", () => ({
  useStore: vi
    .fn()
    .mockImplementation(
      (selector?: (state: typeof mockUseStore) => unknown) => {
        if (selector) {
          return {
            id: "mock-page",
            title: "Mock Page",
            elements: [
              {
                id: "mock-textbox",
                type: ElementType.Textbox,
                required: true,
              },
              {
                id: "mock-textarea",
                type: ElementType.TextAreaField,
                required: true,
              },
              {
                id: "mock-date",
                type: ElementType.Date,
                required: true,
              },
              {
                id: "mock-numberfield",
                type: ElementType.NumberField,
                required: true,
              },
              {
                id: "mock-number",
                type: ElementType.NumberField,
                required: true,
              },

              {
                id: "mock-action-table",
                type: ElementType.ActionTable,
                required: true,
                rows: [],
                answer: [[{ label: "", value: "" }]],
              },
            ],
            sections,
          };
        }
        return reportUseStore;
      }
    ),
}));
describe("Test DevReportTools component", () => {
  test("DevReportTools Renders", () => {
    render(<DevReportTools />);
    expect(screen.getByText("Mock Page Tools")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Auto Fill Page" })
    ).toBeInTheDocument();
  });
  test("Test autofill of page", async () => {
    render(<DevReportTools />);
    const autoBtn = screen.getByRole("button", { name: "Auto Fill Page" });
    await userEvent.click(autoBtn);
    expect(mockSetAnswer).toHaveBeenCalled();
  });
  test("Test render if page is Initiative", async () => {
    (useStore as unknown as Mock).mockImplementation((selector) => {
      if (selector) {
        return {
          submittable: true,
          id: "initiatives",
          title: "Initiatives",
          elements: [],
          sections,
        };
      }
      return reportUseStore;
    });
    render(<DevReportTools />);
    expect(
      screen.getByText(
        "Clicking the Auto Fill button will fill all the required fields in the checked Initiatives. Abandon initiatives will be ignored."
      )
    ).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox", {
      name: "Mock Initiative 2",
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    const autoBtn = screen.getByRole("button", { name: "Auto Fill Page" });
    await userEvent.click(autoBtn);
    expect(mockSetAnswer).toHaveBeenCalled();
  });
  test("Test render of Obligated And Spent Funds page", () => {
    (useStore as unknown as Mock).mockImplementation((selector) => {
      if (selector) {
        return {
          submittable: true,
          id: "obligated-and-spent-funds",
          title: "Obligated And Spent Funds",
          elements: [],
          sections,
        };
      }
      return reportUseStore;
    });
    render(<DevReportTools />);
    expect(
      screen.getByText("Obligated And Spent Funds Tools")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "No quick actions avaliable for this page. You have to upload the file like the user would."
      )
    ).toBeInTheDocument();
  });
  test("Test autofill of Review & Submit", async () => {
    (useStore as unknown as Mock).mockImplementation((selector) => {
      if (selector) {
        return {
          submittable: true,
          id: "review-submit",
          title: "Review & Submit",
          elements: [],
          sections,
        };
      }
      return reportUseStore;
    });
    render(<DevReportTools />);
    const dropArea = screen.getByLabelText("file drop area");
    await act(async () => {
      fireEvent.drop(dropArea, {
        dataTransfer: { items: [{ getAsFile: () => mockPng }] },
      });
    });
    await userEvent.click(screen.getByRole("button", { name: "Fill Report" }));
    expect(mockSetAnswer).toHaveBeenCalled();
  });
});
