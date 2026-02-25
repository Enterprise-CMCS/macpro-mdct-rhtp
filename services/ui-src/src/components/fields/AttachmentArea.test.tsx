import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttachmentArea } from "components";
import { useParams } from "react-router-dom";
import { ElementType, AttachmentAreaTemplate } from "types";
import { deleteUploadedFile, getFileDownloadUrl } from "utils/other/fileApi";
import { testA11y } from "utils/testing/commonTests";
import { Mock } from "vitest";

vi.mock("react-router-dom", () => ({
  useParams: vi.fn().mockReturnValue({ state: "PA" }),
}));

vi.mock("utils", async (importOriginal) => ({
  ...(await importOriginal()),
  useStore: vi.fn().mockReturnValue({ report: { year: "2026" } }),
}));

vi.mock("utils/other/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  retrieveUploadedFiles: vi
    .fn()
    .mockReturnValue(
      Promise.resolve([{ name: "mock-name", size: "15", fileId: "mock-id" }])
    ),
  deleteUploadedFile: vi.fn(),
}));

vi.mock("utils/other/fileApi", async (importOriginal) => ({
  ...(await importOriginal()),
  getFileDownloadUrl: vi.fn(),
  deleteUploadedFile: vi.fn(),
}));

const mockAttachmentAreaElement: AttachmentAreaTemplate = {
  id: "mock-attachment-area-id",
  type: ElementType.AttachmentArea,
  label: "mock attachment area",
  required: true,
};

const AttachmentAreaComponent = (
  <div data-testid="test-checkbox-list">
    <AttachmentArea element={mockAttachmentAreaElement} />
  </div>
);

const consoleMock = vi.spyOn(console, "error");

describe("<AttachmentArea />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("AttachmentArea renders an upload button", async () => {
    await act(async () => {
      render(AttachmentAreaComponent);
    });
    expect(screen.getByText("mock attachment area")).toBeVisible();
    expect(screen.getByRole("button", { name: "Add attachment" }));
  });
  test("receive an error when state or year is not provided", async () => {
    (useParams as Mock).mockResolvedValueOnce("");
    await act(async () => {
      render(AttachmentAreaComponent);
    });
    expect(screen.queryByText("mock attachment area")).not.toBeInTheDocument();
    expect(consoleMock).toHaveBeenLastCalledWith(
      "Can't retrieve uploads with missing state or year"
    );
  });
  test("open and close the upload modal", async () => {
    await act(async () => {
      render(AttachmentAreaComponent);
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Add attachment" })
    );
    expect(screen.getByText("Upload Attachments")).toBeInTheDocument();
    expect(
      screen.getByText("Select a file or files to upload")
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByText("Upload Attachments")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Select a file or files to upload")
    ).not.toBeInTheDocument();
  });
  test("test file download", async () => {
    (getFileDownloadUrl as Mock).mockResolvedValueOnce("");
    await act(async () => {
      render(AttachmentAreaComponent);
    });
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
    await act(async () => {
      render(AttachmentAreaComponent);
    });
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
  testA11y(AttachmentAreaComponent);
});
