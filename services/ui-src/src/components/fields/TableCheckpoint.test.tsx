import { Mock } from "vitest";
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
import { recordFileInDatabaseAndGetUploadUrl } from "utils/api/requestMethods/upload";
import { testA11y } from "utils/testing/commonTests";

vi.mock("react-router", () => ({
  useParams: vi.fn().mockReturnValue({ state: "PA", pageId: "mock-init-1" }),
}));

vi.mock("utils/state/reportLogic/reportActions", () => ({
  setAnswerInElement: vi.fn(),
}));

vi.mock("utils", async (importOriginal) => ({
  ...(await importOriginal()),
  setAnswers: vi.fn(),
  useStore: vi.fn().mockReturnValue({
    report: {
      year: "2026",
      pages: [
        {
          id: "mock-init-1",
          initiativeNumber: "123",
          title: "Init Title",
        },
      ],
    },
  }),
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

const mockTableCheckpointElement: TableCheckpointTemplate = {
  id: "mock-TableCheckpoint-id",
  type: ElementType.TableCheckpoint,
  required: true,
};

const TableCheckpointComponent = (
  <div data-testid="test-checkbox-list">
    <TableCheckpoint
      element={mockTableCheckpointElement}
      updateElement={vi.fn()}
    />
  </div>
);

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });
const consoleMock = vi.spyOn(console, "error");

describe("<TableCheckpoint />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });
  test("download file", async () => {
    render(TableCheckpointComponent);
    // const fileBtn = screen.getByRole("button", { name: "Download mock-file" });
    // expect(fileBtn).toBeVisible();
    // await userEvent.click(fileBtn);
    // expect(getFileDownloadUrl).toHaveBeenCalled();
  });
  testA11y(TableCheckpointComponent);
});

describe("TableCheckpoint upload modal", () => {
  beforeEach(async () => {
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
