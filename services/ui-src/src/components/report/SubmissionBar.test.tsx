import { useStore } from "utils";
import { MockedFunction } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SubmissionBar } from "./SubmissionBar";
import { mockStateUserStore } from "utils/testing/setupTest";
import userEvent from "@testing-library/user-event";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
const mockSetModalComponent = vi.fn();
const mockSetModalOpen = vi.fn();
const mockCreateZip = vi.fn();

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

vi.mock("utils/other/zip", () => ({
  createZipFile: () => mockCreateZip,
}));

const report = {
  id: "mock-report-id",
  type: "RHTP",
  state: "PA",
};

describe("SubmissionBar", () => {
  describe("Submission is enabled", () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mockedUseStore.mockImplementation(
        (selector?: Parameters<typeof useStore>[0]) => {
          if (selector) {
            return {
              submittable: true,
            };
          }
          return {
            ...mockStateUserStore,
            report,
            setModalComponent: mockSetModalComponent,
            setModalOpen: mockSetModalOpen,
          };
        }
      );
      render(<SubmissionBar />);
    });
    test("SubmissionBar renders", () => {
      expect(screen.getByRole("button", { name: "ZIP Files" })).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Submit RHTP Report" })
      ).toBeVisible();
    });
    test("Click Submit Report", async () => {
      const submitBtn = screen.getByRole("button", {
        name: "Submit RHTP Report",
      });
      await userEvent.click(submitBtn);
      waitFor(() => {
        expect(mockSetModalOpen).toHaveBeenCalled();
      });
    });
    test("Click Zip Files", async () => {
      const zipFilesBtn = screen.getByRole("button", { name: "ZIP Files" });
      await userEvent.click(zipFilesBtn);
      waitFor(() => {
        expect(mockCreateZip).toHaveBeenCalled();
      });
    });
  });

  describe("Submission is disabled", () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mockedUseStore.mockImplementation(
        (selector?: Parameters<typeof useStore>[0]) => {
          if (selector) {
            return {
              submittable: false,
            };
          }
          return {
            ...mockStateUserStore,
            report,
            setModalComponent: mockSetModalComponent,
          };
        }
      );
    });
    test("should disable the submit button when submittable is false", () => {
      render(<SubmissionBar />);
      expect(
        screen.getByRole("button", { name: "Submit RHTP Report" })
      ).toBeDisabled();
    });
  });
});
