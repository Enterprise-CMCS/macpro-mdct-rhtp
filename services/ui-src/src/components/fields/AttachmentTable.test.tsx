import { MockedFunction } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttachmentTable } from "components";
import { ElementType, AttachmentTableTemplate, AttachmentStatus } from "types";
import { useStore } from "utils";
import { testA11y } from "utils/testing/commonTests";
import { removeFile } from "utils/other/upload";

vi.mock("react-router", () => ({
  useParams: vi.fn().mockReturnValue({ state: "PA", pageId: "mock-init-1" }),
}));

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;

vi.mock("utils/api/requestMethods/upload", () => ({
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

vi.mock("utils/other/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  removeFile: vi.fn(),
}));

const mockAttachmentAreaElementEmpty: AttachmentTableTemplate = {
  id: "mock-attachment-area-id",
  type: ElementType.AttachmentTable,
  answer: [],
};

const mockAttachmentAreaElement: AttachmentTableTemplate = {
  id: "mock-attachment-area-id",
  type: ElementType.AttachmentTable,
  answer: [
    {
      attachment: {
        name: "mock-file",
        size: 100,
        fileId: "file-id",
      },
      initiatives: ["mock-init-1"],
      stage: "checkpoint-1",
      checkpoints: "project-prop-2",
      status: AttachmentStatus.PENDING_REVIEW,
      comments: [],
    },
  ],
};

const mockUpdateElement = vi.fn();

const AttachmentTableComponent = (element: AttachmentTableTemplate) => {
  return (
    <AttachmentTable element={element} updateElement={mockUpdateElement} />
  );
};

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });

describe("<AttachmentTable />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseStore.mockReturnValue({
      report: {
        id: "mock-report-id",
        type: "RHTP",
        pages: [
          {
            id: "mock-init-1",
            initiativeNumber: "123",
            title: "Init Title",
          },
        ],
      },
    });
  });
  it("AttachmentTable renders with no attachments", () => {
    render(AttachmentTableComponent(mockAttachmentAreaElementEmpty));
    expect(
      screen.getByRole("button", { name: "Add Attachment" })
    ).toBeVisible();
    expect(
      screen.getByText(
        "No attachments found. Click 'Add Attachment' to get started"
      )
    ).toBeVisible();
  });
  it("Mock adding attachment to AttachmentTable", async () => {
    render(AttachmentTableComponent(mockAttachmentAreaElementEmpty));
    const addBtn = screen.getByRole("button", { name: "Add Attachment" });
    await userEvent.click(addBtn);
    await waitFor(() => {
      expect(screen.getByText("Upload Initiative Attachments")).toBeVisible();
    });

    await userEvent.click(
      screen.getByRole("checkbox", { name: "123: Init Title" })
    );

    const dropdown = screen.getAllByLabelText("Stage")[0];
    await userEvent.selectOptions(dropdown, "2 Early Implementation");

    const dropdown2 = screen.getAllByLabelText("Checkpoint #")[0];
    await userEvent.selectOptions(dropdown2, "Achieve at least one milestone");

    const dropArea = screen.getByLabelText("file drop area");
    fireEvent.drop(dropArea, {
      dataTransfer: { items: [{ getAsFile: () => [mockPng] }] },
    });

    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(
      screen.queryByText("Upload Initiative Attachments")
    ).not.toBeInTheDocument();
    expect(mockUpdateElement).toHaveBeenCalled();
  });
  it("Mock on remove file call", async () => {
    /**TODO: This is a placeholder, it needs to be changed for when we have the user go delete in a modal */
    render(AttachmentTableComponent(mockAttachmentAreaElement));
    const deleteBtn = screen.getByRole("button", { name: "Delete mock-file" });
    await userEvent.click(deleteBtn);
    await waitFor(() => {
      expect(screen.getByText("Delete Attachment")).toBeVisible();
    });
    const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
    await userEvent.click(confirmDeleteBtn);
    expect(vi.mocked(removeFile)).toHaveBeenCalled();
    expect(mockUpdateElement).toHaveBeenCalled();
    expect(screen.queryByText("Delete Attachment")).not.toBeInTheDocument();
  });
  it("Mock edit call", async () => {
    /**TODO: This is a placeholder, it needs to be changed for when we have the user go edit in the modal */
    render(AttachmentTableComponent(mockAttachmentAreaElement));
    const editBtn = screen.getByRole("button", {
      name: "Edit file or info for mock-file",
    });
    await userEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText("Edit Attachment")).toBeVisible();
    });

    const dropdown = screen.getAllByLabelText("Stage")[0];
    await userEvent.selectOptions(dropdown, "2 Early Implementation");

    const dropdown2 = screen.getAllByLabelText("Checkpoint #")[0];
    await userEvent.selectOptions(dropdown2, "Achieve at least one milestone");

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.queryByText("Edit Attachment")).not.toBeInTheDocument();
    expect(mockUpdateElement).toHaveBeenCalled();
  });

  testA11y(AttachmentTableComponent(mockAttachmentAreaElement));
});
