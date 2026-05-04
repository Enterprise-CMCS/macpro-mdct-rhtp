import { MockedFunction } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttachmentTable } from "components";
import {
  ElementType,
  AttachmentTableTemplate,
  AttachmentStatus,
  InitiativeAnswerProp,
} from "@rhtp/shared";
import { useStore } from "utils";
import { testA11y } from "utils/testing/commonTests";
import { removeFile } from "utils/other/upload";

vi.mock("react-router", () => ({
  useParams: vi.fn().mockReturnValue({ pageId: "mock-init-1" }),
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
    {
      attachment: {
        name: "mock-file-2",
        size: 100,
        fileId: "file-id",
      },
      initiatives: ["mock-init-1"],
      stage: "checkpoint-2",
      checkpoints: "early-implementation-1",
      status: AttachmentStatus.LOCKED_FOR_SCORING,
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
        state: "PA",
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
        "No attachments found. Select “Add attachment” to get started."
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

    const dropdown = screen.getAllByLabelText(
      "Which stage does this attachment apply to?"
    )[0];
    await userEvent.selectOptions(dropdown, "2 Early Implementation");

    const dropdown2 = screen.getAllByLabelText(
      "Which checkpoint does this attachment apply to?"
    )[0];
    await userEvent.selectOptions(dropdown2, "Achieve at least one milestone");

    const dropArea = screen.getByLabelText("file drop area");
    fireEvent.drop(dropArea, {
      dataTransfer: { items: [{ getAsFile: () => mockPng }] },
    });

    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(
      screen.queryByText("Upload Initiative Attachments")
    ).not.toBeInTheDocument();
    expect(mockUpdateElement).toHaveBeenCalled();
  });
  it("Mock delete and edit disabled for locked file status", async () => {
    const mockLockedFileElement = structuredClone(mockAttachmentAreaElement);
    mockLockedFileElement.answer![0].status =
      AttachmentStatus.LOCKED_FOR_SCORING;
    render(AttachmentTableComponent(mockLockedFileElement));
    const deleteBtn = screen.getByRole("button", { name: "Delete mock-file" });
    const editBtn = screen.getByRole("button", {
      name: "Edit file or info for mock-file",
    });
    expect(deleteBtn).toBeDisabled();
    expect(editBtn).toBeDisabled();
  });

  it("Mock on remove file call", async () => {
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
    render(AttachmentTableComponent(mockAttachmentAreaElement));
    const editBtn = screen.getByRole("button", {
      name: "Edit file or info for mock-file",
    });
    await userEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText("Edit Attachment")).toBeVisible();
    });

    const dropdown = screen.getAllByLabelText(
      "Which stage does this attachment apply to?"
    )[0];
    await userEvent.selectOptions(dropdown, "2 Early Implementation");

    const dropdown2 = screen.getAllByLabelText(
      "Which checkpoint does this attachment apply to?"
    )[0];
    await userEvent.selectOptions(dropdown2, "Achieve at least one milestone");

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.queryByText("Edit Attachment")).not.toBeInTheDocument();
    expect(mockUpdateElement).toHaveBeenCalled();
  });

  it("Verify that editing sets the status to Pending", async () => {
    const existingAttachment = mockAttachmentAreaElement
      .answer?.[0] as InitiativeAnswerProp;

    render(
      AttachmentTableComponent({
        ...mockAttachmentAreaElement,
        answer: [
          {
            ...existingAttachment,
            status: AttachmentStatus.NEEDS_REVISION,
          },
        ],
      })
    );
    expect(
      screen.queryByText(AttachmentStatus.NEEDS_REVISION)
    ).toBeInTheDocument();

    const editBtn = screen.getByRole("button", {
      name: "Edit file or info for mock-file",
    });
    await userEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText("Edit Attachment")).toBeVisible();
    });

    const dropdown = screen.getAllByLabelText(
      "Which stage does this attachment apply to?"
    )[0];
    await userEvent.selectOptions(dropdown, "2 Early Implementation");

    const dropdown2 = screen.getAllByLabelText(
      "Which checkpoint does this attachment apply to?"
    )[0];
    await userEvent.selectOptions(dropdown2, "Achieve at least one milestone");

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.queryByText("Edit Attachment")).not.toBeInTheDocument();
    expect(mockUpdateElement).toHaveBeenCalledWith(
      expect.objectContaining({
        answer: expect.arrayContaining([
          expect.objectContaining({
            status: AttachmentStatus.PENDING_REVIEW,
          }),
        ]),
      })
    );
  });

  it("Test AttachmentTable column sorting", async () => {
    render(AttachmentTableComponent(mockAttachmentAreaElement));

    const sortResult = async (
      sort: string,
      columns: number[],
      results: string[]
    ) => {
      const content = screen.getAllByRole("cell");
      const sortBtn = screen.getByRole("button", { name: sort });
      await userEvent.click(sortBtn);
      expect([
        content[columns[0]].textContent,
        content[columns[1]].textContent,
      ]).toStrictEqual(results);
      await userEvent.click(sortBtn);
      expect([
        content[columns[0]].textContent,
        content[columns[1]].textContent,
      ]).toStrictEqual(results.toReversed());
    };

    await sortResult("Attachment name", [0, 6], ["mock-file", "mock-file-2"]);
    await sortResult("Initiatives", [1, 7], ["#123", "#123"]);
    await sortResult(
      "Stage",
      [2, 8],
      ["1 Project Preparation", "2 Early Implementation"]
    );
    await sortResult(
      "Checkpoints",
      [3, 9],
      ["Continue initiative activities", "Launch initiative"]
    );
    await sortResult(
      "Status",
      [4, 10],
      ["Locked for Scoring", "Pending Review"]
    );
  });

  testA11y(AttachmentTableComponent(mockAttachmentAreaElement));
});
