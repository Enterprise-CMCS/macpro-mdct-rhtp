import { Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { mockUseStore } from "utils/testing/setupTest";
import { StatusAlert } from "./StatusAlert";
import { AlertTypes, ElementType, StatusAlertTemplate } from "@rhtp/shared";
import { testA11y } from "utils/testing/commonTests";
import { useStore } from "utils";

vi.mock("utils/state/reportLogic/completeness", () => ({
  inferredReportStatus: vi.fn().mockReturnValue("Complete"),
}));

vi.mock("utils/state/useStore", () => ({
  useStore: vi
    .fn()
    .mockImplementation(
      (selector?: (state: typeof mockUseStore) => unknown) => {
        if (selector) {
          return {
            submittable: false,
            elements: [
              {
                id: "mock-accordion-group",
                type: ElementType.AccordionGroup,
                accordions: [{ id: "mock id" }],
              },
            ],
          };
        }
        return { ...mockUseStore, currentPageId: "mock-id" };
      }
    ),
}));

const mockUseNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockUseNavigate,
  useParams: vi.fn(() => ({
    reportType: "RHTP",
    state: "CO",
    reportId: "mock-id",
  })),
}));

const mockStatusAlert: StatusAlertTemplate = {
  id: "mock-alert-id",
  type: ElementType.StatusAlert,
  title: "mock alert",
  text: "mock text",
  status: AlertTypes.ERROR,
};

const mockStatusForAlert: StatusAlertTemplate = {
  id: "mock-conditional-alert-id",
  type: ElementType.StatusAlert,
  title: "mock alert",
  text: "mock text",
  status: AlertTypes.INFO,
  for: "mock-accordion-group",
};

const statusAlertComponent = (
  <StatusAlert element={mockStatusAlert}></StatusAlert>
);

describe("<StatusAlert />", () => {
  describe("Test StatusAlert component", () => {
    test("StatusAlert is visible", () => {
      render(statusAlertComponent);
      expect(screen.getByText("mock alert")).toBeVisible();
      expect(screen.getByText("mock text")).toBeVisible();
    });
    test("Conditional status alert for accordion groups. Should er", () => {
      render(<StatusAlert element={mockStatusForAlert}></StatusAlert>);
      expect(screen.queryByText("mock alert")).not.toBeInTheDocument();
      expect(screen.queryByText("mock text")).not.toBeInTheDocument();
    });

    test("Review & Submit banner", () => {
      (useStore as unknown as Mock).mockImplementation((selector) => {
        if (selector) {
          return { submittable: true };
        }
        return {
          ...mockUseStore,
          report: { pages: [{ childPageIds: ["test-1"] }] },
          currentPageId: "review-submit",
        };
      });
      render(statusAlertComponent);

      expect(screen.queryByText("mock alert")).not.toBeInTheDocument();
      expect(screen.queryByText("mock text")).not.toBeInTheDocument();
    });
  });

  testA11y(statusAlertComponent);
});
