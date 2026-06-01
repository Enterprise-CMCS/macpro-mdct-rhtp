import { render, screen } from "@testing-library/react";
import { renderElements } from "./ExportedReportElements";
import { ElementType } from "@rhtp/shared";

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
  test("render TableCheckpoint element", () => {
    const element = renderElements({
      type: ElementType.TableCheckpoint,
      id: "mock-table-checkpoint",
      required: true,
    });
    render(element);
    expect(screen.getByText("TBD")).toBeInTheDocument();
  });
  test("render AttachmentArea element", () => {
    const element = renderElements({
      type: ElementType.AttachmentArea,
      id: "mock-attachment-area",
      label: "",
      required: true,
      uploadedSubLabel: "mock sub label",
    });
    render(element);
    expect(screen.getByText("TBD")).toBeInTheDocument();
  });
  test("render AccordionGroup element", () => {
    const element = renderElements({
      type: ElementType.AccordionGroup,
      id: "mock-accordion-group",
      accordions: [],
      required: true,
    });
    render(element);
    expect(screen.getByText("TBD")).toBeInTheDocument();
  });
  test("render ActionTable element", () => {
    const element = renderElements({
      type: ElementType.ActionTable,
      id: "mock-action-table",
      label: "action table",
      hintText: "action table hint text",
      modal: {
        title: "",
        elements: [],
      },
      rows: [],
    });
    render(element);
    expect(screen.getByText("TBD")).toBeInTheDocument();
  });
  test("render AttachmentTable element", () => {
    const element = renderElements({
      type: ElementType.AttachmentTable,
      id: "mock-attachment-table",
    });
    render(element);
    expect(screen.getByText("TBD")).toBeInTheDocument();
  });
});
