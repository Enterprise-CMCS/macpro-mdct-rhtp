import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ElementType,
  ObligatedAndSpentFundsAttachmentTemplate,
} from "@rhtp/shared";
import { testA11y } from "utils/testing/commonTests";
import { useState } from "react";
import { ObligatedAndSpentFundsAttachmentElement } from "./ObligatedAndSpentFundsAttachment";

vi.mock("utils", async (importOriginal) => ({
  ...(await importOriginal()),
  useStore: vi.fn().mockReturnValue({
    report: {
      pages: [
        { initiativeNumber: "1", title: "Initiative 1" },
        { initiativeNumber: "2", title: "Initiative 2" },
      ],
    },
  }),
}));

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

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const mockedElement: ObligatedAndSpentFundsAttachmentTemplate = {
  id: "mock-id",
  type: ElementType.ObligatedAndSpentFundsAttachment,
  label: "mock label",
  answer: [],
  required: true,
};

const mockElementWithAnswer: ObligatedAndSpentFundsAttachmentTemplate = {
  id: "mock-id",
  type: ElementType.ObligatedAndSpentFundsAttachment,
  label: "mock label",
  answer: [
    {
      name: "mock-file.txt",
      size: 100,
      fileId: "mock-id",
    },
  ],
  required: true,
};

const updateSpy = vi.fn();

const ObligatedAndSpentFundsAttachmentWrapper = ({
  template,
}: {
  template: ObligatedAndSpentFundsAttachmentTemplate;
}) => {
  const [element, setElement] = useState(template);
  const onChange = (updatedElement: Partial<typeof element>) => {
    updateSpy(updatedElement);
    setElement({ ...element, ...updatedElement });
  };
  return (
    <ObligatedAndSpentFundsAttachmentElement
      element={element}
      updateElement={onChange}
    />
  );
};

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });

describe("<ObligatedAndSpentFundsAttachmentElement />", () => {
  describe("Test ObligatedAndSpentFundsAttachmentElement component", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test("ObligatedAndSpentFundsAttachmentElement is visible", () => {
      render(
        <ObligatedAndSpentFundsAttachmentWrapper template={mockedElement} />
      );
      expect(screen.getByText("Add Obligated and Spent Funds")).toBeVisible();
    });

    test("Upload a file for obligated and spent funds", async () => {
      render(
        <ObligatedAndSpentFundsAttachmentWrapper template={mockedElement} />
      );

      const addButton = screen.getByRole("button", {
        name: "Add Obligated and Spent Funds",
      });
      await userEvent.click(addButton);
      expect(screen.getByText("Select a file to upload")).toBeVisible();
      const dropArea = screen.getByLabelText("file drop area");
      await act(async () => {
        fireEvent.drop(dropArea, {
          dataTransfer: { items: [{ getAsFile: () => mockPng }] },
        });
      });
      expect(updateSpy).toHaveBeenCalled();

      const closeButton = screen.getByRole("button", { name: "Close" });
      await userEvent.click(closeButton);
    });

    test("Upload button is disable when 1 obligated and spent funds is uploaded", () => {
      render(
        <ObligatedAndSpentFundsAttachmentWrapper
          template={mockElementWithAnswer}
        />
      );
      const addButton = screen.getByRole("button", {
        name: "Add Obligated and Spent Funds",
      });
      expect(addButton).toBeDisabled();
    });

    test("Able to delete obligated and spent funds", async () => {
      render(
        <ObligatedAndSpentFundsAttachmentWrapper
          template={mockElementWithAnswer}
        />
      );
      const deleteButton = screen.getByRole("button", {
        name: "delete mock-file.txt",
      });
      await userEvent.click(deleteButton);
      expect(
        screen.getByText("Delete Obligated and Spent Funds")
      ).toBeVisible();
      await userEvent.click(screen.getByRole("button", { name: "Delete" }));
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  testA11y(
    <ObligatedAndSpentFundsAttachmentWrapper template={mockedElement} />
  );
});
