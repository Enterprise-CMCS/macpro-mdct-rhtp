import { PageType } from "@rhtp/shared";
import { buildInitiativePages } from "../initiatives";
import INITIATIVES from "../data/initiatives.json";

const state = "PA";
const firstInitiative = INITIATIVES[state][0];

describe("initiative utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("buildInitiativePages utility", () => {
    test("test builds pages for each initiative given", () => {
      const result = buildInitiativePages(state);
      expect(result.length).toEqual(INITIATIVES[state].length);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: firstInitiative.id,
            title: firstInitiative.title,
            initiativeNumber: firstInitiative.initiativeNumber,
            type: PageType.Standard,
            sidebar: false,
          }),
        ])
      );
    });
  });
});
