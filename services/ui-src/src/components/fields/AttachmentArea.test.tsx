import { Mock, MockedFunction } from "vitest";
import { useStore } from "utils";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttachmentArea } from "components";
import { ElementType, AttachmentAreaTemplate } from "types";
import { getFileDownloadUrl } from "utils/api/requestMethods/upload";
import { testA11y } from "utils/testing/commonTests";

const updateSpy = vi.fn();

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;

vi.mock("utils/api/requestMethods/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  getFileDownloadUrl: vi.fn(),
  deleteUploadedFile: vi.fn(),
}));

const mockAttachmentAreaElement: AttachmentAreaTemplate = {
  id: "mock-attachment-area-id",
  type: ElementType.AttachmentArea,
  label: "mock attachment area",
  answer: [{ name: "mock-name", size: 100, fileId: "mock-id" }],
  required: true,
};

const AttachmentAreaComponent = (
  <AttachmentArea
    element={mockAttachmentAreaElement}
    updateElement={updateSpy}
  />
);

const consoleMock = vi.spyOn(console, "error");

describe("<AttachmentArea />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseStore.mockReturnValue({
      report: {
        id: "mock-report-id",
        type: "RHTP",
        state: "PA",
      },
    });
  });
  test("AttachmentArea renders an upload button", async () => {
    await act(async () => {
      render(AttachmentAreaComponent);
    });

    expect(screen.getByText("mock attachment area")).toBeVisible();
    expect(screen.getByRole("button", { name: "Add attachment" }));
  });
  test("receive an error when state, id or type is not provided", async () => {
    (useStore as unknown as Mock).mockReturnValue({ report: {} });
    await act(async () => {
      render(AttachmentAreaComponent);
    });
    expect(screen.queryByText("mock attachment area")).not.toBeInTheDocument();
    expect(consoleMock).toHaveBeenLastCalledWith(
      "Can't retrieve uploads with missing state, id or type"
    );
  });
  test("open and close the upload modal", async () => {
    await act(async () => {
      render(AttachmentAreaComponent);
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Add attachment" })
    );
    expect(screen.getByText("Upload attachments")).toBeInTheDocument();
    expect(
      screen.getByText("Select a file or files to upload")
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByText("Upload attachments")).not.toBeInTheDocument();
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
    expect(updateSpy).toHaveBeenCalled();
  });
  testA11y(AttachmentAreaComponent);
});
