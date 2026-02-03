import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioField } from "components";
import { ElementType, RadioTemplate } from "types";
import { useStore } from "utils";
import { useElementIsHidden } from "utils/state/hooks/useElementIsHidden";
import { testA11y } from "utils/testing/commonTests";

jest.mock("utils/state/hooks/useElementIsHidden");
const mockedUseElementIsHidden = useElementIsHidden as jest.MockedFunction<
  typeof useElementIsHidden
>;
jest.mock("utils/state/useStore");
const mockedUseStore = useStore as jest.MockedFunction<typeof useStore>;
const mockClearMeasure = jest.fn();
const mockChangeDeliveryMethods = jest.fn();
const mockSetAnswers = jest.fn();
mockedUseStore.mockReturnValue({
  currentPageId: "my-id",
  clearMeasure: mockClearMeasure,
  changeDeliveryMethods: mockChangeDeliveryMethods,
  setAnswers: mockSetAnswers,
});

const mockRadioElement: RadioTemplate = {
  id: "mock-radio-id",
  type: ElementType.Radio,
  label: "mock label",
  required: true,
  choices: [
    {
      label: "Choice 1",
      value: "A",
      checked: false,
    },
    {
      label: "Choice 2",
      value: "B",
      checkedChildren: [
        {
          id: "mock-text-box-id",
          type: ElementType.Textbox,
          label: "mock-text-box",
          required: true,
        },
      ],
      checked: false,
    },
    {
      label: "Choice 3",
      value: "C",
      checked: false,
    },
  ],
  hideCondition: {
    controllerElementId: "reporting-radio",
    answer: "yes",
  },
};
const updateSpy = jest.fn();

const RadioFieldComponent = (
  <div data-testid="test-radio-list">
    <RadioField element={mockRadioElement} updateElement={updateSpy} />
  </div>
);

describe("<RadioField />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("RadioField renders as Radio", () => {
    render(RadioFieldComponent);
    expect(screen.getByText("Choice 1")).toBeVisible();
    expect(screen.getByTestId("test-radio-list")).toBeVisible();
  });

  test("RadioField allows checking radio choices", async () => {
    render(RadioFieldComponent);
    const firstRadio = screen.getByLabelText("Choice 1");
    await userEvent.click(firstRadio);
    expect(updateSpy).toHaveBeenCalledWith({ answer: "A" });
  });

  test("RadioField displays children fields after selection", async () => {
    render(RadioFieldComponent);
    const firstRadio = screen.getByLabelText("Choice 2");
    await userEvent.click(firstRadio);
    expect(updateSpy).toHaveBeenCalledWith({ answer: "B" });
    expect(screen.getByLabelText("mock-text-box")).toBeInTheDocument();
  });

  testA11y(RadioFieldComponent);
});

describe("Radio field hide condition logic", () => {
  test("Radio field is hidden if its hide conditions' controlling element has a matching answer", async () => {
    mockedUseElementIsHidden.mockReturnValue(true);
    render(RadioFieldComponent);
    const radioField = screen.queryByText("Choice 1");
    expect(radioField).not.toBeInTheDocument();
  });

  test("Radio field is NOT hidden if its hide conditions' controlling element has a different answer", async () => {
    mockedUseElementIsHidden.mockReturnValue(false);
    render(RadioFieldComponent);
    const radioField = screen.queryByText("Choice 1");
    expect(radioField).toBeVisible();
  });
});
