import { ReportPages, ReportType, RhtpSubType } from "@rhtp/shared";
import { rhtpReportTemplate } from "../forms/2026/rhtp/rhtp";

export type RhtpSubTypeData = {
  [key: string]: {
    name: string;
    dateRangeString: string;
    openDate: number;
    startDate: number;
    endDate: number;
    nextReportSubType: string;
    type: RhtpSubType;
    budgetPeriod: number;
    reportTemplateBuilder: (state: string) => ReportPages;
  };
};

export const RhtpSubTypeMap: RhtpSubTypeData = {
  A1: {
    name: "Annual Report 1",
    dateRangeString: "12/29/2025-7/31/2026",
    openDate: 1766984400000, //using start date for now, actual date TBD
    startDate: 1766984400000,
    endDate: 1785470400000,
    nextReportSubType: "Q1",
    type: RhtpSubType.ANNUAL,
    budgetPeriod: 1,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q1: {
    name: "Quarterly Report 1",
    dateRangeString: "8/1/2026-10/30/2026",
    openDate: 1790726400000, //9.30.2026
    startDate: 1785556800000,
    endDate: 1793332800000,
    nextReportSubType: "Q2",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 1,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q2: {
    name: "Quarterly Report 2",
    dateRangeString: "10/31/2026-1/30/2027",
    openDate: 1798502400000, //12.29.2026
    startDate: 1793419200000,
    endDate: 1801285200000,
    nextReportSubType: "Q3",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 2,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q3: {
    name: "Quarterly Report 3",
    dateRangeString: "1/31/2027-4/30/2027",
    openDate: 1806537600000, //4.1.2027
    startDate: 1801371600000,
    endDate: 1809057600000,
    nextReportSubType: "A2",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 2,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  A2: {
    name: "Annual Report 2",
    dateRangeString: "8/1/2026-7/31/2027",
    openDate: 1814313600000, //6.30.2027
    startDate: 1785556800000,
    endDate: 1817006400000,
    nextReportSubType: "Q4",
    type: RhtpSubType.ANNUAL,
    budgetPeriod: 2,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q4: {
    name: "Quarterly Report 4",
    dateRangeString: "8/1/2027-10/30/2027",
    openDate: 1822262400000, //9.30.2027
    startDate: 1817092800000,
    endDate: 1824868800000,
    nextReportSubType: "Q5",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 2,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q5: {
    name: "Quarterly Report 5",
    dateRangeString: "10/31/2027-1/30/2028",
    openDate: 1830038400000, //  12.29.2027
    startDate: 1824955200000,
    endDate: 1832821200000,
    nextReportSubType: "Q6",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 3,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q6: {
    name: "Quarterly Report 6",
    dateRangeString: "1/31/2028-4/30/2028",
    openDate: 1837900800000, //3.29.2028
    startDate: 1832907600000,
    endDate: 1840680000000,
    nextReportSubType: "A3",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 3,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  A3: {
    name: "Annual Report 3",
    dateRangeString: "8/1/2027-7/31/2028",
    openDate: 1845936000000, //6.30.2028
    startDate: 1817092800000,
    endDate: 1848628800000,
    nextReportSubType: "Q7",
    type: RhtpSubType.ANNUAL,
    budgetPeriod: 3,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q7: {
    name: "Quarterly Report 7",
    dateRangeString: "8/1/2028-10/30/2028",
    openDate: 1853884800000, //9.30.2028
    startDate: 1848715200000,
    endDate: 1856491200000,
    nextReportSubType: "Q8",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 3,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q8: {
    name: "Quarterly Report 8",
    dateRangeString: "10/31/2028-1/30/2029",
    openDate: 1861660800000, //12.29.2028
    startDate: 1856577600000,
    endDate: 1864443600000,
    nextReportSubType: "Q9",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 4,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q9: {
    name: "Quarterly Report 9",
    dateRangeString: "1/31/2029-4/30/2029",
    openDate: 1869696000000, //4.1.2029
    startDate: 1864530000000,
    endDate: 1872216000000,
    nextReportSubType: "A4",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 4,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  A4: {
    name: "Annual Report 4",
    dateRangeString: "8/1/2028-7/31/2029",
    openDate: 1877472000000, //6.30.2029
    startDate: 1848715200000,
    endDate: 1880164800000,
    nextReportSubType: "Q10",
    type: RhtpSubType.ANNUAL,
    budgetPeriod: 4,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q10: {
    name: "Quarterly Report 10",
    dateRangeString: "8/1/2029-10/30/2029",
    openDate: 1885420800000, //9.30.2029
    startDate: 1880251200000,
    endDate: 1888027200000,
    nextReportSubType: "Q11",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 4,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q11: {
    name: "Quarterly Report 11",
    dateRangeString: "10/31/2029-1/30/2030",
    openDate: 1893196800000, //12.29.2029
    startDate: 1888113600000,
    endDate: 1895979600000,
    nextReportSubType: "Q12",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 5,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q12: {
    name: "Quarterly Report 12",
    dateRangeString: "1/31/2030-4/30/2030",
    openDate: 1901232000000, //4.1.2030
    startDate: 1896066000000,
    endDate: 1903752000000,
    nextReportSubType: "A5",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 5,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  A5: {
    name: "Annual Report 5",
    dateRangeString: "8/1/2029-7/31/2030",
    openDate: 1909008000000, //6.30.2030
    startDate: 1880251200000,
    endDate: 1911700800000,
    nextReportSubType: "Q13",
    type: RhtpSubType.ANNUAL,
    budgetPeriod: 5,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q13: {
    name: "Quarterly Report 13",
    dateRangeString: "8/1/2030-10/30/2030",
    openDate: 1916956800000, //9.30.2030
    startDate: 1911787200000,
    endDate: 1919563200000,
    nextReportSubType: "FINAL",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 5,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  FINAL: {
    name: "Final Report",
    dateRangeString: "12/29/2025-10/30/2030",
    openDate: 1956441600000, //12.29.2031
    startDate: 1766984400000,
    endDate: 1919563200000,
    nextReportSubType: "",
    type: RhtpSubType.FINAL,
    budgetPeriod: 5,
    reportTemplateBuilder: rhtpReportTemplate,
  },
};

export const error = {
  UNAUTHORIZED: "User is not authorized to access this resource.",
  NO_KEY: "Must provide key for table.",
  MISSING_DATA: "Missing required data.",
  INVALID_DATA: "Provided data is not valid.",
  SERVER_ERROR: "An unspecified server error occurred.",
  CREATION_ERROR: "Could not be created due to a database error.",
  END_DATE_BEFORE_START_DATE: "End date can't be before start date",
};

export const reportTables: { [key in ReportType]: string } = {
  RHTP: process.env.RhtpReportsTable!,
};

export const tableTopics: { [key in ReportType]: string } = {
  RHTP: "rhtp-reports",
};
