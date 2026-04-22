import { useStore } from "utils";
import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { SubmissionBar } from "./SubmissionBar";
import { mockStateUserStore } from "utils/testing/setupTest";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
const mockSetModalComponent = vi.fn();

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

describe("SubmissionBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseStore.mockImplementation(
      (selector?: Parameters<typeof useStore>[0]) => {
        if (selector) {
          return {
            sections: [],
            submittable: true,
          };
        }
        return {
          ...mockStateUserStore,
          report: {
            id: "mock-report-id",
            type: "RHTP",
            state: "PA",
          },
          setModalComponent: mockSetModalComponent,
        };
      }
    );
  });
  test("SubmissionBar renders", () => {
    render(<SubmissionBar />);
    expect(screen.getByRole("button", { name: "ZIP Files" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Submit RHTP Report" })
    ).toBeVisible();
  });
});
