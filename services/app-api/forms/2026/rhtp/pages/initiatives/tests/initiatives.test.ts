import { Mock } from "vitest";
import { PageType } from "@rhtp/shared";
import { buildInitiativePages } from "../initiatives";
import INITIATIVES from "../data/empty-initiatives.json";
import s3Lib from "../../../../../../libs/s3-lib";

const state = "PA";
const firstInitiative = INITIATIVES[state][0];

vi.mock("../../../../../../libs/s3-lib", () => ({
  default: {
    getObject: vi.fn(),
  },
}));

describe("initiative utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("buildInitiativePages utility", () => {
    test("test builds pages for each initiative given", () => {
      const result = buildInitiativePages(state, INITIATIVES as any) as any[];
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

    test("uses empty initiatives data when S3 does not return data", async () => {
      (s3Lib.getObject as Mock).mockResolvedValueOnce({});

      const result = await buildInitiativePages(state);

      expect(result).toEqual(buildInitiativePages(state, INITIATIVES as any));
    });
  });
});
