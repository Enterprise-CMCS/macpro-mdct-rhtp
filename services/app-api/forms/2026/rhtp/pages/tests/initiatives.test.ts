import { PageType } from "@rhtp/shared";
import { buildInitiativePages, INITIATIVES } from "../initiatives";

const firstInitiative = INITIATIVES[0];

describe("initiative utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("buildInitiativePages utility", () => {
    test("test builds pages for each initiative given", () => {
      const result = buildInitiativePages();
      expect(result.length).toEqual(INITIATIVES.length);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: firstInitiative.id,
            title: firstInitiative.name,
            initiativeNumber: firstInitiative.initiativeNumber,
            type: PageType.Standard,
            sidebar: false,
          }),
        ])
      );
    });
  });
});
