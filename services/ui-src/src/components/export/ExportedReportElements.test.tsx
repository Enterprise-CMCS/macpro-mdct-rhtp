import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderElements } from "./ExportedReportElements";
import { ElementType, PageElement } from "@rhtp/shared";
import { mockUseStore } from "utils/testing/setupTest";
import { useStore } from "utils";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockUseStore);

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
      initId: "12234",
      answer: [{ id: "full-implementation-3", checked: true }],
    } as PageElement & { initId: string });
    render(element);
    expect(screen.getByText("Stage 0: Planning")).toBeVisible();
    expect(
      screen.getByText("Report updated metric progress to CMS")
    ).toBeVisible();
    expect(screen.getAllByText("Not applicable")).toHaveLength(3);
    expect(screen.getAllByText("No")).toHaveLength(16);
    expect(screen.getAllByText("Yes")).toHaveLength(1);
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
    expect(screen.getByText("Not answered")).toBeInTheDocument();
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
      rows: [
        {
          header: "no",
          id: "#",
          type: ElementType.Paragraph,
        },
        {
          header: "mock header 1",
          id: "header-1",
          type: ElementType.Paragraph,
        },
        {
          header: "mock header 2",
          id: "header-2",
          type: ElementType.Paragraph,
        },
      ],
      answer: [[{ id: "header-1", value: "mock value" }]],
      required: true,
    });
    render(element);
    expect(screen.getByText("action table")).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "mock header 1" })
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "mock header 2" })
    ).toBeVisible();
    expect(screen.getByText("mock value")).toBeVisible();
  });
});
