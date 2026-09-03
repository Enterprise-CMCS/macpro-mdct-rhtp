import { Mock } from "vitest";
import { PageType } from "@rhtp/shared";
import { buildSustainabilityAndHighlightsPage } from "../sustainability-and-highlights";
import s3Lib from "../../../../../../libs/s3-lib";

const state = "AL";
const successAndHighlights = {
  successStory: "Success Story Text 1",
  highlight: "Highlight Text 1",
};

vi.mock("../../../../../../libs/s3-lib", () => ({
  default: {
    getObject: vi.fn(),
  },
}));

describe("sustainability and highlights utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (s3Lib.getObject as Mock).mockResolvedValue({
      Body: {
        transformToString: () =>
          Promise.resolve(JSON.stringify({ [state]: successAndHighlights })),
      },
    });
  });

  describe("sustainabilityAndHighlights utility", () => {
    test("builds a page with state-specific success stories and sustainability planning fetched from S3", async () => {
      const result = await buildSustainabilityAndHighlightsPage(state);

      expect(s3Lib.getObject).toHaveBeenCalledWith({
        Bucket: process.env.attachmentsBucketName,
        Key: "import/success-and-highlights.json",
      });
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

    test("builds a page with empty answers when S3 does not return data", async () => {
      (s3Lib.getObject as Mock).mockResolvedValueOnce({});

      const result = await buildSustainabilityAndHighlightsPage(state);

      expect(result.elements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "success-stories", answer: "" }),
          expect.objectContaining({
            id: "sustainability-planning",
            answer: "",
          }),
        ])
      );
    });
  });
});
