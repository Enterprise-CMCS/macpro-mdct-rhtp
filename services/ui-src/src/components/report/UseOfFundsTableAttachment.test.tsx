import { render, screen } from "@testing-library/react";
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
  answer: [
    {
      name: "mock-file",
      size: 0,
      fileId: "id",
    },
  ],
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
      expect(screen.getByText("Add use of funds")).toBeVisible();
    });

    test("Modal should open and close", async () => {
      render(<UseOfFundsAttachmentWrapper template={mockedElement} />);

      const addButton = screen.getByText("Add use of funds");
      await userEvent.click(addButton);
      const modalTitle = screen.getByText("Add Use of Funds");
      expect(modalTitle).toBeVisible();

      const closeButton = screen.getByText("Close");
      await userEvent.click(closeButton);
      expect(modalTitle).not.toBeVisible();
    });

    test("Able to add new use of funds", async () => {
      render(<UseOfFundsAttachmentWrapper template={mockedElement} />);
      const addButton = screen.getByText("Add use of funds");
      await userEvent.click(addButton);

      const budgetPeriodButton = screen.getAllByLabelText("Budget period")[0];
      await userEvent.selectOptions(budgetPeriodButton, "Budget Period 2");

      const spentFunds = screen.getByRole("textbox", { name: "Spent funds" });
      await userEvent.click(spentFunds);
      await userEvent.paste("5000");

      const description = screen.getByRole("textbox", { name: "Description" });
      await userEvent.click(description);
      await userEvent.paste("Test description");

      const initiativeButton = screen.getAllByLabelText("Initiative")[0];
      await userEvent.selectOptions(initiativeButton, "2: Initiative 2");

      const useOfFundsButton = screen.getAllByLabelText("Use of funds")[0];
      await userEvent.selectOptions(useOfFundsButton, "Use of Funds 2");

      const recipientName = screen.getByRole("textbox", {
        name: "Recipient name",
      });
      await userEvent.click(recipientName);
      await userEvent.paste("Test Recipient");

      const recipientCategoryButton =
        screen.getAllByLabelText("Recipient category")[0];
      await userEvent.selectOptions(
        recipientCategoryButton,
        "Recipient Category 2"
      );

      const saveButton = screen.getByText("Save");
      await userEvent.click(saveButton);

      expect(updateSpy).toHaveBeenCalled();
      expect(screen.getByText("$5,000")).toBeVisible();
      expect(screen.getByText("Test description")).toBeVisible();
    });

    test("Field validations showing proper errors", async () => {
      render(<UseOfFundsAttachmentWrapper template={mockedElement} />);
      const addButton = screen.getByText("Add use of funds");
      await userEvent.click(addButton);

      const saveButton = screen.getByText("Save");
      await userEvent.click(saveButton);
      expect(screen.getAllByText("A response is required")[0]).toBeVisible();
    });

    test("Able to delete use of funds", async () => {
      render(<UseOfFundsAttachmentWrapper template={mockedElement} />);
      const deleteButton = screen.getByAltText("Delete Item");
      await userEvent.click(deleteButton);

      expect(screen.queryByText("Budget Period 1")).not.toBeInTheDocument();
      expect(updateSpy).toHaveBeenCalled();
    });

    test("Able to edit eligibility", async () => {
      render(<UseOfFundsAttachmentWrapper template={mockedElement} />);
      const editButton = screen.getByText("Edit");
      await userEvent.click(editButton);

      const description = screen.getByRole("textbox", { name: "Description" });
      await userEvent.type(description, "addon");

      const saveButton = screen.getByText("Save");
      await userEvent.click(saveButton);
      expect(updateSpy).toHaveBeenCalled();
      expect(screen.getByText("test descriptionaddon")).toBeVisible();
    });
  });

  testA11y(<UseOfFundsAttachmentWrapper template={mockedElement} />);
});
