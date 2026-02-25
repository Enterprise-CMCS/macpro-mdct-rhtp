import { Mock } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Upload } from "./Upload";
import {
  deleteUploadedFile,
  getFileDownloadUrl,
} from "utils/api/requestMethods/upload";
import { testA11y } from "utils/testing/commonTests";

vi.mock("utils/other/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  retrieveUploadedFiles: vi
    .fn()
    .mockReturnValue(
      Promise.resolve([{ name: "mock-name", size: "15", fileId: "mock-id" }])
    ),
}));

vi.mock("utils/api/requestMethods/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  getFileDownloadUrl: vi.fn(),
  deleteUploadedFile: vi.fn(),
  uploadFileToS3: vi.fn(),
  recordFileInDatabaseAndGetUploadUrl: vi.fn(),
}));

const props = {
  id: "mock-id",
  state: "PA",
  year: "2026",
};

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });

describe("<Upload />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("Upload is visible", async () => {
    await act(async () => {
      render(<Upload {...props} />);
    });
    expect(
      screen.getByText("Select a file or files to upload")
    ).toBeInTheDocument();
  });
  test("uploading a file by file window", async () => {
    await act(async () => {
      render(<Upload {...props} />);
    });

    const input = screen.getByLabelText("Choose from folder");
    await userEvent.upload(input, [mockPng]);
  });
  test("uploading a file by drag and drop", async () => {
    await act(async () => {
      render(<Upload {...props} />);
    });

    const dropArea = screen.getByLabelText("file drop area");
    fireEvent.drop(dropArea, {
      dataTransfer: { items: [{ getAsFile: () => [mockPng] }] },
    });
  });

  test("test file download", async () => {
    (getFileDownloadUrl as Mock).mockResolvedValueOnce("");
    render(<Upload {...props} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "mock-name" })
      ).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole("button", { name: "mock-name" }));
    expect(getFileDownloadUrl).toHaveBeenCalled();
  });

  test("test deleting a file", async () => {
    (deleteUploadedFile as Mock).mockResolvedValueOnce("");
    render(<Upload {...props} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "delete mock-name" })
      ).toBeInTheDocument();
    });
    await userEvent.click(
      screen.getByRole("button", { name: "delete mock-name" })
    );
    expect(deleteUploadedFile).toHaveBeenCalled();
  });
  testA11y(<Upload {...props} />);
});
