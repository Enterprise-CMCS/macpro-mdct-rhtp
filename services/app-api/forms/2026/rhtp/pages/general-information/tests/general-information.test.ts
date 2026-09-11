import { Mock } from "vitest";
import { PageType } from "@rhtp/shared";
import { buildGeneralInformationPage } from "../general-information";
import s3Lib from "../../../../../../libs/s3-lib";

const state = "AL";
const generalInformation = {
  AOR: "AOR Name",
  AORemail: "aor@example.com",
  PIPD: "PIPD Name",
  PIPDemail: "pipd@example.com",
};

vi.mock("../../../../../../libs/s3-lib", () => ({
  default: {
    getObject: vi.fn(),
  },
}));

describe("general information utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (s3Lib.getObject as Mock).mockResolvedValue({
      Body: {
        transformToString: () =>
          Promise.resolve(JSON.stringify({ [state]: generalInformation })),
      },
    });
  });

  describe("buildGeneralInformationPage utility", () => {
    test("builds a page with state-specific general information fetched from S3", async () => {
      const result = await buildGeneralInformationPage(state);

      expect(s3Lib.getObject).toHaveBeenCalledWith({
        Bucket: process.env.attachmentsBucketName,
        Key: "import/general-information.json",
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: "general-information",
          title: "General Information",
          type: PageType.Standard,
          sidebar: true,
          elements: expect.arrayContaining([
            expect.objectContaining({
              id: "aor-name",
              answer: generalInformation.AOR,
            }),
            expect.objectContaining({
              id: "aor-email",
              answer: generalInformation.AORemail,
            }),
            expect.objectContaining({
              id: "pipd-name",
              answer: generalInformation.PIPD,
            }),
            expect.objectContaining({
              id: "pipd-email",
              answer: generalInformation.PIPDemail,
            }),
          ]),
        })
      );
    });

    test("builds a page with empty answers when S3 does not return data", async () => {
      (s3Lib.getObject as Mock).mockResolvedValueOnce({});

      const result = await buildGeneralInformationPage(state);

      expect(result.elements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "aor-name", answer: "" }),
          expect.objectContaining({ id: "aor-email", answer: "" }),
          expect.objectContaining({ id: "pipd-name", answer: "" }),
          expect.objectContaining({ id: "pipd-email", answer: "" }),
        ])
      );
    });
  });
});
