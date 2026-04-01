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
import { ElementType, TableCheckpointTemplate } from "types";
import {
  getFileDownloadUrl,
  recordFileInDatabaseAndGetUploadUrl,
} from "utils/api/requestMethods/upload";
import { testA11y } from "utils/testing/commonTests";
import { Mock } from "vitest";

const updateSpy = vi.fn();

vi.mock("react-router", () => ({
  useParams: vi.fn().mockReturnValue({ state: "PA" }),
}));

vi.mock("utils", async (importOriginal) => ({
  ...(await importOriginal()),
  useStore: vi.fn().mockReturnValue({ report: { year: "2026" } }),
}));

vi.mock("utils/api/requestMethods/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  getFileDownloadUrl: vi.fn(),
  deleteUploadedFile: vi.fn(),
  uploadFileToS3: vi.fn(),
  recordFileInDatabaseAndGetUploadUrl: vi.fn(),
  getUploadedFiles: vi
    .fn()
    .mockReturnValue([
      { filename: "mock-name", fileSize: 100, fileId: "mock-id" },
    ]),
}));

const mockTableCheckpointElement: TableCheckpointTemplate = {
  id: "mock-TableCheckpoint-id",
  type: ElementType.TableCheckpoint,
  required: true,
  stage: 0,
  checkpoints: [
    {
      id: "mock-point-1",
      label: "checkpoint 1",
      attachable: true,
    },
    {
      id: "mock-point-2",
      label: "checkpoint 2",
      attachable: false,
    },
    {
      id: "mock-point-3",
      label: "checkpoint 3",
      attachable: true,
    },
  ],
  label: "mock checkpoint table",
};

const TableCheckpointComponent = (
  <div data-testid="test-checkbox-list">
    <TableCheckpoint
      element={mockTableCheckpointElement}
      updateElement={updateSpy}
    />
  </div>
);

const TableCheckpointAnswerComponent = () => {
  const newMockTable = {
    ...mockTableCheckpointElement,
    answer: [
      {
        id: "mock-point-1",
        label: "checkpoint 1",
        completed: false,
        attachments: [
          {
            name: "mock-file",
            size: 35,
            fileId: "mock-file-id",
          },
        ],
      },
    ],
  };
  return (
    <div data-testid="test-checkbox-list">
      <TableCheckpoint element={newMockTable} updateElement={updateSpy} />
    </div>
  );
};

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });
const consoleMock = vi.spyOn(console, "error");

describe("<TableCheckpoint />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("TableCheckpoint renders a table", () => {
    render(TableCheckpointComponent);
    expect(screen.getByText("Stage 0: mock checkpoint table")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Upload attachments" })
    ).toBeVisible();
    expect(screen.getByText("checkpoint 1")).toBeVisible();
    expect(screen.getAllByText("Not applicable")).toHaveLength(1);
  });
  test("receive an error when state or year is not provided", async () => {
    (useParams as Mock).mockResolvedValueOnce("");
    await act(async () => {
      render(TableCheckpointComponent);
    });
    expect(screen.queryByText("mock attachment area")).not.toBeInTheDocument();
    expect(consoleMock).toHaveBeenLastCalledWith(
      "Can't retrieve uploads with missing state or year"
    );
  });
  test("checkbox checking", async () => {
    render(TableCheckpointComponent);
    const checkbox = screen.getByRole("checkbox", {
      name: "Check if checkpoint 1 is complete",
    });
    expect(checkbox);
    await userEvent.click(checkbox);
    expect(updateSpy).toHaveBeenCalled();
  });
  test("download file", async () => {
    render(TableCheckpointAnswerComponent());
    const fileBtn = screen.getByRole("button", { name: "Download mock-file" });
    expect(fileBtn).toBeVisible();
    await userEvent.click(fileBtn);
    expect(getFileDownloadUrl).toHaveBeenCalled();
  });
  testA11y(TableCheckpointComponent);
});

describe("TableCheckpoint upload modal", () => {
  beforeEach(async () => {
    render(TableCheckpointComponent);
    const uploadBtn = screen.getByRole("button", {
      name: "Upload attachments",
    });
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
