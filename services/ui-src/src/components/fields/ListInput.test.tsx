import { render, screen } from "@testing-library/react";
import { ListInput } from "./ListInput";
import { ElementType, ListInputTemplate } from "@rhtp/shared";
import userEvent from "@testing-library/user-event";

const mockedListInputElement: ListInputTemplate = {
  type: ElementType.ListInput,
  id: "mock-id",
  label: "This is a mock list input",
  fieldLabel: "mock field",
  helperText: "mock helper text",
  buttonText: "mock button text",
  required: false,
};

const updateSpy = vi.fn();

const ListInputComponent = (
  <ListInput element={mockedListInputElement} updateElement={updateSpy} />
);

describe("<ListInput />", () => {
  describe("standard list input", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      render(ListInputComponent);
    });
    test("ListInput renders", () => {
      expect(screen.getByText("This is a mock list input")).toBeVisible();
      expect(screen.getByText("mock helper text")).toBeVisible();
      expect(
        screen.getByRole("button", { name: "mock button text" })
      ).toBeVisible();
    });
    test("ListInput allows adding fields", async () => {
      const addBtn = screen.getByRole("button", { name: "mock button text" });
      await userEvent.click(addBtn);

      const textbox = screen.getByRole("textbox", { name: "mock field 1" });
      expect(textbox).toBeVisible();

      await userEvent.type(textbox, "text");
      expect(updateSpy).toHaveBeenCalledTimes(5);
    });

    test("ListInput allows removing fields", async () => {
      const addBtn = screen.getByRole("button", { name: "mock button text" });
      await userEvent.click(addBtn);
      expect(
        screen.getByRole("textbox", { name: "mock field 1" })
      ).toBeVisible();
      expect(updateSpy).toHaveBeenCalledTimes(1);

      const removeBtn = screen.getByRole("button", { name: "Remove" });
      await userEvent.click(removeBtn);
      expect(
        screen.queryByRole("textbox", { name: "mock field 1" })
      ).not.toBeInTheDocument();
      expect(updateSpy).toHaveBeenCalledTimes(2);
    });

    test("ListInput shows error when user does not fillout the field", async () => {
      const addBtn = screen.getByRole("button", { name: "mock button text" });
      await userEvent.click(addBtn);
      const textbox = screen.getByRole("textbox", { name: "mock field 1" });
      // trigger the error message through a focus
      await userEvent.click(textbox);
      // remove focus by adding another textbox
      await userEvent.click(addBtn);
      expect(screen.getByText("A response is required")).toBeVisible();
      await userEvent.type(textbox, "text");
      expect(
        screen.queryByText("A response is required")
      ).not.toBeInTheDocument();
    });
  });
  describe("list input with custom validation", () => {
    const mockedListInputWithValidationElement = {
      ...mockedListInputElement,
      validation: "link",
    };
    beforeEach(() => {
      vi.clearAllMocks();
      render(
        <ListInput
          element={mockedListInputWithValidationElement}
          updateElement={updateSpy}
        />
      );
    });

    test("ListInput shows error when input does not pass validation", async () => {
      const addBtn = screen.getByRole("button", { name: "mock button text" });
      await userEvent.click(addBtn);
      const textbox = screen.getByRole("textbox", { name: "mock field 1" });
      await userEvent.type(textbox, "test");
      expect(screen.getByText("Response must be a valid url")).toBeVisible();
      await userEvent.clear(textbox);
      await userEvent.type(textbox, "https://cms.gov");
      expect(
        screen.queryByText("Response must be a valid url")
      ).not.toBeInTheDocument();
    });
  });
});
