import { FormPageTemplate, PageStatus, PageType } from "../../../types/reports";
import { Initiatives } from "../../constants";
import { validReport } from "../../tests/mockReport";
import { buildInitiativePages, updateInitiativeStatus } from "./initiatives";

describe("initiative utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("buildInitiativePages utility", () => {
    test("test builds pages for each initiative given", () => {
      const mockBaseReport = structuredClone(validReport);
      buildInitiativePages(mockBaseReport);
      expect(mockBaseReport.pages.length).toEqual(
        validReport.pages.length + Initiatives.length
      );
    });
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
