import { PageType } from "@rhtp/shared";
import { sustainabilityAndHighlights } from "../sustainability-and-highlights";
import SUCCESS_AND_HIGHLIGHTS from "../data/success-and-highlights.json";

const state = "AL";
const successAndHighlights = SUCCESS_AND_HIGHLIGHTS[state];

describe("sustainability and highlights utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sustainabilityAndHighlights utility", () => {
    test("builds a page with state-specific success stories and sustainability planning", () => {
      const result = sustainabilityAndHighlights(state);

      expect(result).toEqual(
        expect.objectContaining({
          id: "sustainability-and-highlights",
          title: "Sustainability and Highlights",
          type: PageType.Standard,
          sidebar: true,
          elements: expect.arrayContaining([
            expect.objectContaining({
              id: "success-stories",
              answer: successAndHighlights.successStory,
            }),
            expect.objectContaining({
              id: "sustainability-planning",
              answer: successAndHighlights.highlight,
            }),
          ]),
        })
      );
    });
  });
});
