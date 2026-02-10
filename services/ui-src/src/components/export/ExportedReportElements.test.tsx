import { render, screen } from "@testing-library/react";
import { renderElements } from "./ExportedReportElements";
import { ElementType } from "types";

describe("Test ExportedReportElements", () => {
  test("render SubHeader element", () => {
    const element = renderElements({
      id: "mock-sub-header",
      text: "mock sub header",
      type: ElementType.SubHeader,
    });
    render(element);
    expect(screen.getByText("mock sub header")).toBeInTheDocument();
  });
});
