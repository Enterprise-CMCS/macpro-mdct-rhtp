import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ElementType,
  UseOfFundsTableTemplate,
  dropdownEmptyOption,
} from "@rhtp/shared";
import { testA11y } from "utils/testing/commonTests";
import { useState } from "react";
import { UseOfFundsTableElement } from "./UseOfFundsTable";

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

const mockedElement: UseOfFundsTableTemplate = {
  id: "mock-id",
  type: ElementType.UseOfFundsTable,
  dropDownOptions: {
    budgetPeriodOptions: [
      dropdownEmptyOption,
      { label: "Budget Period 1", value: "budget-period-1" },
      { label: "Budget Period 2", value: "budget-period-2" },
    ],
    useOfFundsOptions: [
      dropdownEmptyOption,
      { label: "Use of Funds 1", value: "use-of-funds-1" },
      { label: "Use of Funds 2", value: "use-of-funds-2" },
    ],
    recipientCategoryOptions: [
      dropdownEmptyOption,
      { label: "Recipient Category 1", value: "recipient-category-1" },
      { label: "Recipient Category 2", value: "recipient-category-2" },
    ],
  },
  answer: [
    {
      id: "mock-item-id",
      budgetPeriod: "Budget Period 1",
      spentFunds: "1000",
      description: "test description",
      initiative: "Initiative 1",
      useOfFunds: "Use of Funds 1",
      recipientName: "Name 1",
      recipientCategory: "Recipient Category 1",
    },
  ],
};
const updateSpy = vi.fn();

const UseOfFundsTableWrapper = ({
  template,
}: {
  template: UseOfFundsTableTemplate;
}) => {
  const [element, setElement] = useState(template);
  const onChange = (updatedElement: Partial<typeof element>) => {
    updateSpy(updatedElement);
    setElement({ ...element, ...updatedElement });
  };
  return <UseOfFundsTableElement element={element} updateElement={onChange} />;
};

describe("<UseOfFundsTableElement />", () => {
  describe("Test UseOfFundsTableElement component", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test("UseOfFundsTableElement is visible", () => {
      render(<UseOfFundsTableWrapper template={mockedElement} />);
      expect(screen.getByText("Use of Funds")).toBeVisible();
    });

    test("Modal should open and close", async () => {
      render(<UseOfFundsTableWrapper template={mockedElement} />);

      const addButton = screen.getByText("Add use of funds");
      await userEvent.click(addButton);
      const modalTitle = screen.getByText("Add Use of Funds");
      expect(modalTitle).toBeVisible();

      const closeButton = screen.getByText("Close");
      await userEvent.click(closeButton);
      expect(modalTitle).not.toBeVisible();
    });

    test("Able to add new use of funds", async () => {
      render(<UseOfFundsTableWrapper template={mockedElement} />);
      const addButton = screen.getByText("Add use of funds");
      await userEvent.click(addButton);

      const budgetPeriodButton = screen.getAllByLabelText("Budget Period")[1];
      await userEvent.click(budgetPeriodButton);
      await userEvent.click(
        screen.getByRole("option", { name: "Budget Period 2" })
      );

      const spentFunds = screen.getByRole("textbox", { name: "Spent Funds" });
      await userEvent.type(spentFunds, "5000");

      const description = screen.getByRole("textbox", { name: "Description" });
      await userEvent.type(description, "Test description");

      const initiativeButton = screen.getAllByLabelText("Initiative")[1];
      await userEvent.click(initiativeButton);
      await userEvent.click(
        screen.getByRole("option", { name: "2: Initiative 2" })
      );

      const useOfFundsButton = screen.getAllByLabelText("Use of Funds")[1];
      await userEvent.click(useOfFundsButton);
      await userEvent.click(
        screen.getByRole("option", { name: "Use of Funds 2" })
      );

      const recipientName = screen.getByRole("textbox", {
        name: "Recipient Name",
      });
      await userEvent.type(recipientName, "Test Recipient");

      const recipientCategoryButton =
        screen.getAllByLabelText("Recipient Category")[1];
      await userEvent.click(recipientCategoryButton);
      await userEvent.click(
        screen.getByRole("option", { name: "Recipient Category 2" })
      );

      const saveButton = screen.getByText("Save");
      await userEvent.click(saveButton);

      expect(updateSpy).toHaveBeenCalled();
      expect(screen.getByText("$5,000")).toBeVisible();
      expect(screen.getByText("Test description")).toBeVisible();
    });

    test("Field validations showing proper errors", async () => {
      render(<UseOfFundsTableWrapper template={mockedElement} />);
      const addButton = screen.getByText("Add use of funds");
      await userEvent.click(addButton);

      const saveButton = screen.getByText("Save");
      await userEvent.click(saveButton);
      expect(screen.getAllByText("A response is required")[0]).toBeVisible();
    });

    test("Able to delete use of funds", async () => {
      render(<UseOfFundsTableWrapper template={mockedElement} />);
      const deleteButton = screen.getByAltText("Delete Item");
      await userEvent.click(deleteButton);

      expect(screen.queryByText("Budget Period 1")).not.toBeInTheDocument();
      expect(updateSpy).toHaveBeenCalled();
    });

    test("Able to edit eligibility", async () => {
      render(<UseOfFundsTableWrapper template={mockedElement} />);
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

  testA11y(<UseOfFundsTableWrapper template={mockedElement} />);
});
