import { Mock } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadArea } from "./UploadArea";
import {
  getFileDownloadUrl,
  recordFileInDatabaseAndGetUploadUrl,
} from "utils/api/requestMethods/fileMethods";
import { testA11y } from "utils/testing/commonTests";

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
vi.mock("utils", async (importOriginal) => ({
  ...(await importOriginal()),
  useStore: vi.fn().mockReturnValue({
    report: {
      id: "mock-report-id",
      type: "RHTP",
      state: "PA",
    },
  }),
}));

const mockDeleteFromReport = vi.fn();

const props = {
  answer: [{ name: "mock-name", size: 100, fileId: "mock-id" }],
  saveToReport: vi.fn(),
  updateElement: vi.fn(),
  deleteFromReport: mockDeleteFromReport,
  disabled: false,
  uploadedSubLabel: "mock sub label",
};

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });
window.open = vi.fn();

describe("<Upload />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("Upload is visible", async () => {
    await act(async () => {
      render(<UploadArea {...props} />);
    });
    expect(
      screen.getByText("Select a file or files to upload")
    ).toBeInTheDocument();
  });
  test("uploading a file by file window", async () => {
    await act(async () => {
      render(<UploadArea {...props} />);
    });

    const input = screen.getByLabelText("Choose from folder");
    await userEvent.upload(input, [mockPng]);
    expect(recordFileInDatabaseAndGetUploadUrl).toHaveBeenCalled();
  });
  test("uploading a file by drag and drop", async () => {
    await act(async () => {
      render(<UploadArea {...props} />);
    });

    const dropArea = screen.getByLabelText("file drop area");
    await act(async () => {
      fireEvent.drop(dropArea, {
        dataTransfer: { items: [{ getAsFile: () => mockPng }] },
      });
    });
    expect(recordFileInDatabaseAndGetUploadUrl).toHaveBeenCalled();
  });

  test("an error displays when trying to upload multiples to a single file upload", async () => {
    const newProps = { ...props, multiple: false, answer: [] };
    await act(async () => {
      render(<UploadArea {...newProps} />);
    });
    const dropArea = screen.getByLabelText("file drop area");
    await act(async () => {
      fireEvent.drop(dropArea, {
        dataTransfer: {
          items: [{ getAsFile: () => mockPng }, { getAsFile: () => mockPng }],
        },
      });
    });
    expect(screen.getByText("File is limited to 1")).toBeInTheDocument();
  });

  test("test file download", async () => {
    (getFileDownloadUrl as Mock).mockResolvedValueOnce("");
    render(<UploadArea {...props} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "mock-name" })
      ).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole("button", { name: "mock-name" }));
    expect(getFileDownloadUrl).toHaveBeenCalled();
  });

  test("test deleting a file", async () => {
    render(<UploadArea {...props} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "delete mock-name" })
      ).toBeInTheDocument();
    });
    await userEvent.click(
      screen.getByRole("button", { name: "delete mock-name" })
    );
    expect(mockDeleteFromReport).toHaveBeenCalled();
  });
  testA11y(<UploadArea {...props} />);
});
