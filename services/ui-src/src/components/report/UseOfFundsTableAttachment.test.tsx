import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ElementType, UseOfFundsAttachmentTemplate } from "@rhtp/shared";
import { testA11y } from "utils/testing/commonTests";
import { useState } from "react";
import { UseOfFundsAttachmentElement } from "./UseOfFundsAttachment";

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

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const mockedElement: UseOfFundsAttachmentTemplate = {
  id: "mock-id",
  type: ElementType.UseOfFundsAttachment,
  answer: [],
  required: true,
};
const updateSpy = vi.fn();

const UseOfFundsAttachmentWrapper = ({
  template,
}: {
  template: UseOfFundsAttachmentTemplate;
}) => {
  const [element, setElement] = useState(template);
  const onChange = (updatedElement: Partial<typeof element>) => {
    updateSpy(updatedElement);
    setElement({ ...element, ...updatedElement });
  };
  return (
    <UseOfFundsAttachmentElement element={element} updateElement={onChange} />
  );
};

describe("<UseOfFundsAttachmentElement />", () => {
  describe("Test UseOfFundsAttachmentElement component", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test("UseOfFundsAttachmentElement is visible", () => {
      render(<UseOfFundsAttachmentWrapper template={mockedElement} />);
      expect(screen.getByText("Add Use of Funds")).toBeVisible();
    });

    test("Modal should open and close", async () => {
      render(<UseOfFundsAttachmentWrapper template={mockedElement} />);

      const addButton = screen.getByRole("button", {
        name: "Add Use of Funds",
      });
      await userEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Upload Attachments")).toBeVisible();
      });

      const closeButton = screen.getByRole("button", { name: "Close" });
      await userEvent.click(closeButton);
    });

    test("Able to add new use of funds", async () => {
      render(<UseOfFundsAttachmentWrapper template={mockedElement} />);
    });

    test("Able to delete use of funds", async () => {
      render(<UseOfFundsAttachmentWrapper template={mockedElement} />);
    });
  });

  testA11y(<UseOfFundsAttachmentWrapper template={mockedElement} />);
});
