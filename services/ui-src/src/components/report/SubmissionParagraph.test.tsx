import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { mockUseStore } from "utils/testing/setupTest";
import { BrowserRouter as Router } from "react-router-dom";
import { useStore } from "utils";
import { SubmissionParagraph } from "./SubmissionParagraph";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockUseStore);

const report = {
  submittedBy: "Tall Person",
  submitted: new Date("January 1, 2025").getTime(),
  state: "NJ",
  type: "RHTP",
};

describe("SubmissionParagraph", () => {
  test("should not render if missing details from the store", () => {
    mockedUseStore.mockReturnValueOnce({
      report: undefined,
    });

    const { container } = render(
      <Router>
        <SubmissionParagraph />
      </Router>
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("should render submission details", () => {
    mockedUseStore.mockReturnValueOnce({
      report: report,
    });
    render(
      <Router>
        <SubmissionParagraph />
      </Router>
    );
    expect(
      screen.getByText(
        "RHTP submission for NJ was submitted on January 1, 2025 by Tall Person."
      )
    ).toBeInTheDocument();
  });
});
