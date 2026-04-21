import { Mock, MockedFunction } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableCheckpoint } from "components";
import { useParams } from "react-router";
import { ElementType, TableCheckpointTemplate } from "@rhtp/shared";
import {
  getFileDownloadUrl,
  recordFileInDatabaseAndGetUploadUrl,
} from "utils/api/requestMethods/upload";
import { testA11y } from "utils/testing/commonTests";
import { useStore } from "utils";
import { CommentModal } from "components/modals/CommentModal";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;

vi.mock("react-router", () => ({
  useParams: vi.fn().mockReturnValue({ state: "PA", pageId: "mock-init-1" }),
}));

const mockGetAnswer = vi.fn();
const updateSpy = vi.fn();

const mockFiles = {
  name: "orange.png",
  size: 1544,
  fileId: "mock_orange.png",
};

vi.mock("utils/state/reportLogic/reportActions", () => ({
  setAnswerInElement: vi
    .fn()
    .mockImplementation(
      (_report, _pageId, _elementId, getAnswer, _setAnswers) => {
        getAnswer([
          {
            initiatives: ["mock-init-1"],
            attachment: mockFiles,
          },
        ]);
        mockGetAnswer();
      }
    ),
}));

vi.mock("utils/api/requestMethods/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  getFileDownloadUrl: vi.fn(),
  deleteUploadedFile: vi.fn(),
  uploadFileToS3: vi.fn(),
  recordFileInDatabaseAndGetUploadUrl: vi
    .fn()
    .mockReturnValue({ presignedUploadUrl: "", fileId: "mock-init-1" }),
  getUploadedFiles: vi
    .fn()
    .mockReturnValue([
      { filename: "mock-name", fileSize: 100, fileId: "mock-id" },
    ]),
}));

vi.mock("components/modals/CommentModal");
const mockCommentModal = vi.mocked(CommentModal);

const mockTableCheckpointElement: TableCheckpointTemplate = {
  id: "mock-TableCheckpoint-id",
  type: ElementType.TableCheckpoint,
  required: true,
};

const TableCheckpointComponent = (
  <div data-testid="test-checkbox-list">
    <TableCheckpoint
      element={mockTableCheckpointElement}
      updateElement={updateSpy}
    />
  </div>
);

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });
const consoleMock = vi.spyOn(console, "error");

const mockReport = {
  report: {
    id: "mock-report-id",
    type: "RHTP",
    pages: [
      {
        id: "mock-init-1",
        initiativeNumber: "123",
        title: "Init Title",
      },
      {
        id: "initiative-attachments",
        elements: [
          {
            id: "initiative-attachments-table",
            type: ElementType.AttachmentTable,
            answer: [
              {
                initiatives: ["mock-init-1"],
                checkpoints: "project-prop-2",
                comments: [],
                attachment: mockFiles,
                stage: "checkpoint-1",
                status: "Under Review",
              },
            ],
          },
        ],
      },
    ],
  },
};

describe("<TableCheckpoint />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseStore.mockReturnValue(mockReport);
  });
  test("TableCheckpoint renders a table", () => {
    render(TableCheckpointComponent);
    expect(screen.getByText("Stage 0: Planning")).toBeVisible();
    expect(
      screen.getAllByRole("button", { name: "Upload attachments" })[0]
    ).toBeVisible();
    expect(screen.getByText("Establish governance")).toBeVisible();
    expect(screen.getAllByText("Not applicable")).toHaveLength(9);
  });
  test("receive an error when state or year is not provided", async () => {
    (useParams as Mock).mockResolvedValueOnce("");
    await act(async () => {
      render(TableCheckpointComponent);
    });
    expect(screen.queryByText("mock attachment area")).not.toBeInTheDocument();
    expect(consoleMock).toHaveBeenLastCalledWith(
      "Can't retrieve uploads with missing state, year or id"
    );
  });
  test("checkbox checking", async () => {
    render(TableCheckpointComponent);
    const checkbox = screen.getByRole("checkbox", {
      name: "Check if Establish governance is complete",
    });
    expect(checkbox);
    await userEvent.click(checkbox);
    expect(updateSpy).toHaveBeenCalled();
  });
  test("download file", async () => {
    render(TableCheckpointComponent);
    const fileBtn = screen.getByRole("button", { name: "Download orange.png" });
    expect(fileBtn).toBeVisible();
    await userEvent.click(fileBtn);
    expect(getFileDownloadUrl).toHaveBeenCalled();
  });
  test("add comment to file", async () => {
    render(TableCheckpointComponent);
    const commentButton = screen.getByRole("button", {
      name: "Comment on orange.png",
    });
    expect(commentButton).toBeVisible();
    await userEvent.click(commentButton);
    expect(mockCommentModal).toHaveBeenCalled();
  });
  test("delete file", async () => {
    render(TableCheckpointComponent);
    const deleteButton = screen.getByRole("button", {
      name: "Remove orange.png from checkpoint Launch initiative",
    });
    await userEvent.click(deleteButton);
    expect(mockGetAnswer).toHaveBeenCalled();
  });
  testA11y(TableCheckpointComponent);
});

describe("TableCheckpoint upload modal", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockedUseStore.mockReturnValue(mockReport);

    render(TableCheckpointComponent);
    const uploadBtn = screen.getAllByRole("button", {
      name: "Upload attachments",
    })[0];
    userEvent.click(uploadBtn);
    await waitFor(() => {
      expect(
        screen.getByText("Select a file or files to upload")
      ).toBeVisible();
    });
  });
  test("drag and dropping a file", () => {
    const dropArea = screen.getByLabelText("file drop area");
    fireEvent.drop(dropArea, {
      dataTransfer: { items: [{ getAsFile: () => [mockPng] }] },
    });
    expect(recordFileInDatabaseAndGetUploadUrl).toHaveBeenCalled();
  });
  test("close modal", async () => {
    const doneBtn = screen.getByRole("button", { name: "Done" });
    await userEvent.click(doneBtn);
    expect(doneBtn).not.toBeVisible();
  });
});
