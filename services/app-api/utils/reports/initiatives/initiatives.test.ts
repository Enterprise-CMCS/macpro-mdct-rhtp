import { FormPageTemplate, PageStatus, PageType } from "../../../types/reports";
import { Initiatives } from "../../constants";
import { validReport } from "../../tests/mockReport";
import {
  buildInitiativePages,
  updateInitiativeNameAndStatus,
} from "./initiatives";

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

  describe("updateInitiativeNameAndStatus utility", () => {
    test("test updates initiative name and status within report", () => {
      const mockBaseReport = {
        ...validReport,
        pages: [
          ...validReport.pages,
          {
            id: "mock-old-initiative-name-123",
            title: "Mock Old Initiative Name",
            type: PageType.Standard,
          } as FormPageTemplate,
        ],
      };
      const mockBody = {
        initiativeName: "Mock New Initiative Name",
        initiativeAbandon: true,
      };
      updateInitiativeNameAndStatus(
        mockBaseReport,
        mockBody,
        "mock-old-initiative-name-123"
      );
      expect(mockBaseReport).toEqual(
        expect.objectContaining({
          pages: expect.arrayContaining([
            expect.objectContaining({
              id: "mock-old-initiative-name-123",
              title: "Mock New Initiative Name",
              status: PageStatus.ABANDONED,
            }),
          ]),
        })
      );
    });
  });
});
