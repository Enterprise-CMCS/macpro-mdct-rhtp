import { fireEvent, render, screen } from "@testing-library/react";
import { MultiSelect } from "./Multiselect";
import { testA11y } from "utils/testing/commonTests";

const mockChanged = vi.fn();

const options = [
  { label: "option 1", value: "opt-1" },
  { label: "option 2", value: "opt-2" },
  { label: "option 3", value: "opt-3" },
  { label: "option 4", value: "opt-4" },
];

describe("<MultiSelect />", () => {
  beforeEach(() => {
    const label = "mock select";
    let selected: string[] = [];

    render(
      <MultiSelect
        label={label}
        values={selected}
        options={options}
        onChange={mockChanged}
        countLabel="options"
        placeholder="search options"
      />
    );
  });
  it("Test Multiselect renders", () => {
    expect(screen.getByText("mock select")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "options Filter" })
    ).toBeVisible();
  });

  it("Test multi-selection of the options", () => {
    const dropdownBtn = screen.getByRole("button", { name: "options Filter" });
    fireEvent.click(dropdownBtn);

    const optCheckbox1 = screen.getByRole("checkbox", { name: "option 1" });
    fireEvent.click(optCheckbox1);
    expect(mockChanged).toHaveBeenCalled();

    const optCheckbox2 = screen.getByRole("checkbox", { name: "option 2" });
    fireEvent.click(optCheckbox2);

    expect(mockChanged).toHaveBeenCalled();
  });

  it("Test filter search", () => {
    const dropdownBtn = screen.getByRole("button", { name: "options Filter" });
    fireEvent.click(dropdownBtn);

    const search = screen.getByRole("searchbox", {
      name: "Search options by name",
    });
    fireEvent.input(search, { target: { value: "option 1" } });
    expect(
      screen.queryByRole("checkbox", { name: "option 2" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "option 1" }));

    fireEvent.input(search, { target: { value: "" } });
    expect(screen.getByRole("checkbox", { name: "option 2" }));
  });
});

describe("Test A11y", () => {
  testA11y(
    <MultiSelect
      label={"mock select"}
      values={[]}
      options={options}
      onChange={mockChanged}
      countLabel="options"
      placeholder="search options"
    />
  );
});
