import { FormPageTemplate, PageStatus, PageType } from "@rhtp/shared";
import { validReport } from "../../tests/mockReport";
import { updateInitiativeStatus } from "./initiatives";

describe("initiative utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateInitiativeStatus utility", () => {
    test("test abandons initiative", () => {
      const mockBaseReport = {
        ...validReport,
        pages: [
          ...validReport.pages,
          {
            id: "mock-initiative-name-123",
            title: "Mock Initiative Name",
            type: PageType.Standard,
          } as FormPageTemplate,
        ],
      };
      const mockBody = {
        initiativeAbandon: true,
      };
      updateInitiativeStatus(
        mockBaseReport,
        mockBody,
        "mock-initiative-name-123"
      );
      expect(mockBaseReport).toEqual(
        expect.objectContaining({
          pages: expect.arrayContaining([
            expect.objectContaining({
              id: "mock-initiative-name-123",
              title: "Mock Initiative Name",
              status: PageStatus.ABANDONED,
            }),
          ]),
        })
      );
    });
  });
});
