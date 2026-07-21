//Shared constants between frontend and backend

// STATES
export const StateNames = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
} as const;

export const dropdownEmptyOption = { label: "- Select an option -", value: "" };

export const StateDropdownOptions = Object.entries(StateNames).map(
  ([key, value]) => ({
    label: value,
    value: key,
  })
);

//for fields that are required but only when it's an annual report and it needs to mutate to not required in optional.
//This also clears the answer when copied, assuming it's a string, see reports/copyReport.ts
export const optionalInQuarterly = [
  "initiative-narrative",
  "success-stories",
  "metrics-table",
];

export const acceptedFileTypes = [
  ".bmp",
  ".txt",
  ".csv",
  ".jar",
  ".odt",
  ".ods",
  ".odp",
  ".msg",
  ".potx",
  ".pptx",
  ".ppt",
  ".rtf",
  ".tif",
  ".gif",
  ".jpeg",
  ".png",
  ".docm",
  ".docx",
  ".doc",
  ".pdf",
  ".jpg",
  ".xlsx",
  ".xltx",
  ".xls",
];

export const getExtension = (filename: string): string | undefined => {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === filename.length - 1) {
    return undefined;
  }
  return filename.slice(lastDot).toLowerCase();
};

export const isAllowedFileExtension = (ext: string): boolean => {
  return acceptedFileTypes.includes(ext.toLowerCase());
};
