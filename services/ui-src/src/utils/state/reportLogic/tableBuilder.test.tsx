import { ElementType } from "types";
import { buildElement, getErrorMessage } from "./tableBuilder";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockOnChange = vi.fn();

const elements = [
  {
    id: "mock-dropdown",
    type: ElementType.Dropdown,
    disabled: false,
    children: [{ label: "option 1", value: "opt1" }],
    label: "Mock Dropdown",
  },
  {
    id: "mock-textarea",
    type: ElementType.TextAreaField,
    disabled: false,
    label: "Mock TextAreaField",
  },
  {
    id: "mock-textbox",
    type: ElementType.Textbox,
    disabled: false,
    label: "Mock Textbox",
  },
  {
    id: "mock-date",
    type: ElementType.Date,
    disabled: false,
    label: "Mock Date",
  },
];

describe("Test tableBuilder functions", () => {
  describe("Test buildElement function", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      const component = elements.map((element) =>
        buildElement(element, "", mockOnChange, element.label)
      );
      render(<>{component}</>);
    });
    test("Elements render", () => {
      elements.forEach((element) => {
        expect(screen.getAllByText(element.label)[0]).toBeVisible();
      });
    });
    test("Dropdown triggers onChange", async () => {
      const dropdown = screen.getAllByLabelText("Mock Dropdown")[0];
      await userEvent.selectOptions(dropdown, "option 1");
      expect(mockOnChange).toHaveBeenCalled();
    });
    test("Textbox triggers onChange", async () => {
      const textbox = screen.getByRole("textbox", { name: "Mock Textbox" });
      await userEvent.type(textbox, "mock");
      await userEvent.tab();
      expect(mockOnChange).toHaveBeenCalledTimes(5);
    });
    test("TextAreaField triggers onChange", async () => {
      const textbox = screen.getByRole("textbox", {
        name: "Mock TextAreaField",
      });
      await userEvent.type(textbox, "mock");
      await userEvent.tab();
      expect(mockOnChange).toHaveBeenCalledTimes(5);
    });
    test("Date triggers onChange", async () => {
      const dateField = screen.getByRole("textbox", {
        name: "Mock Date",
      });
      await userEvent.type(dateField, "mock");
      await userEvent.tab();
      expect(mockOnChange).toHaveBeenCalledTimes(5);
    });
  });

  test("Test buildElement throws error no type is found", () => {
    const component = buildElement(
      { id: "mock-accordion", type: ElementType.AccordionGroup },
      "",
      mockOnChange,
      "Mock Accordion"
    );
    render(component);
    expect(screen.queryByText("Mock Accordion")).not.toBeInTheDocument();
  });

  describe("Test getErrorMessage function", () => {
    test("Test valid input", () => {
      const errorRequiredMsg = getErrorMessage(ElementType.Textbox, true, [
        "mock value",
      ]);
      expect(errorRequiredMsg).toBe("");
    });
    test("Test error messages", () => {
      const errorRequiredMsg = getErrorMessage(
        ElementType.TextAreaField,
        true,
        [""]
      );
      expect(errorRequiredMsg).toBe("A response is required");

      const errorDateMsg = getErrorMessage(ElementType.Date, true, [
        "not validate",
      ]);
      expect(errorDateMsg).toBe("Response must be a date in MMDDYYYY format");
    });
  });
});
