import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccordionGroup } from "components";
import { ElementType, AccordionGroupTemplate } from "types";
import { testA11y } from "utils/testing/commonTests";

const updateSpy = vi.fn();

const mockAccordionGroupElement: AccordionGroupTemplate = {
  id: "mock-accordiongroup-id",
  type: ElementType.AccordionGroup,
  required: true,
  answer: [],
  accordions: [
    {
      label: "mock-textbox-label",
      children: [
        {
          id: "mock-textbox-id",
          type: ElementType.Textbox,
          label: "mock textbox",
          helperText: "helper text",
          required: true,
        },
      ],
    },
  ],
};

const AccordionGroupComponent = (
  <div data-testid="test-checkbox-list">
    <AccordionGroup
      element={mockAccordionGroupElement}
      updateElement={updateSpy}
    />
  </div>
);

describe("<AccordionGroup />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("AccordionGroup renders accordions", () => {
    render(AccordionGroupComponent);

    expect(screen.getByRole("button", { name: "Expand all" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Collapse all" })).toBeVisible();
    expect(screen.getByText("mock-textbox-label")).toBeVisible();
  });
  test("AccordionGroup expands and collapse all", async () => {
    render(AccordionGroupComponent);

    const expandAllBtn = screen.getByRole("button", { name: "Expand all" });
    const collapseAllBtn = screen.getByRole("button", { name: "Collapse all" });
    expect(screen.queryByLabelText("mock textbox")).not.toBeVisible();
    userEvent.click(expandAllBtn);
    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: "mock textbox" })
      ).toBeVisible();
    });
    userEvent.click(collapseAllBtn);
    await waitFor(() => {
      expect(screen.queryByLabelText("mock textbox")).not.toBeVisible();
    });
  });
  test("accordions toggle open and close", async () => {
    render(AccordionGroupComponent);
    const accordionBtn = screen.getByRole("button", {
      name: "mock-textbox-label",
    });
    userEvent.click(accordionBtn);
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "mock textbox" }));
    });
    userEvent.click(accordionBtn);

    await waitFor(() => {
      expect(screen.queryByLabelText("mock textbox")).not.toBeVisible();
    });
  });
  testA11y(AccordionGroupComponent);
});
