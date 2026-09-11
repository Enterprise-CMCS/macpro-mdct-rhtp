import { ElementType, FormPageTemplate, PageType } from "@rhtp/shared";
import { getJsonFromS3 } from "../../../../../libs/s3-json-lib";

const GENERAL_INFORMATION_KEY = "import/general-information.json";

export type GeneralInformationData = {
  [key: string]: {
    AOR: string;
    AORemail: string;
    PIPD: string;
    PIPDemail: string;
  };
};

const buildPage = (
  state: string,
  data: GeneralInformationData
): FormPageTemplate => ({
  id: "general-information",
  title: "General Information",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "general-information-header",
      text: "General Information",
    },
    {
      id: "aor-name",
      type: ElementType.Textbox,
      label: "Authorized Organizational Representative (AOR)",
      required: true,
      helperText:
        "Enter the name for CMS to contact with questions about this report.",
      quarterly: true,
      answer: data[state]?.AOR || "",
    },
    {
      type: ElementType.Textbox,
      id: "aor-email",
      label: "Authorized Organizational Representative (AOR) Contact email",
      required: true,
      helperText: "Enter the email address for the AOR.",
      quarterly: true,
      answer: data[state]?.AORemail || "",
    },
    {
      id: "pipd-name",
      type: ElementType.Textbox,
      label: "Principal Investigator or Program Director",
      required: true,
      helperText:
        "Enter the name for CMS to contact with questions about this report.",
      quarterly: true,
      answer: data[state]?.PIPD || "",
    },
    {
      type: ElementType.Textbox,
      id: "pipd-email",
      label: "Principal Investigator or Program Director Contact email",
      required: true,
      helperText: "Enter the email address for the PI/PD.",
      quarterly: true,
      answer: data[state]?.PIPDemail || "",
    },
    {
      type: ElementType.Textbox,
      id: "poc-noa",
      label: "Point of Contact (POC) listed in NoA",
      required: false,
      helperText: "Optionally added and approved by CMS.",
      quarterly: true,
    },
    {
      type: ElementType.Textbox,
      id: "poc-email",
      label: "Point of Contact (POC) email",
      required: false,
      helperText:
        "Enter the email address for the Additional Point of Contact listed in the NoA.",
      quarterly: true,
    },
  ],
});

// fetches from S3 when no data is given; pass data explicitly (e.g. in tests) to skip the S3 call
export const buildGeneralInformationPage = (
  state: string,
  data?: GeneralInformationData
): FormPageTemplate | Promise<FormPageTemplate> => {
  if (data) return buildPage(state, data);
  return getJsonFromS3<GeneralInformationData>(GENERAL_INFORMATION_KEY).then(
    (fetched) => buildPage(state, fetched ?? {})
  );
};
