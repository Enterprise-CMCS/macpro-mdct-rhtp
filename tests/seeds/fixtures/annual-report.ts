import { ReportType, UserRoles } from "@rhtp/shared";
import { RhtpSubTypeTemplateMap } from "../../../services/app-api/utils/constants";
import { buildReport } from "../../../services/app-api/utils/reports/buildReport";

export async function buildAnnualReport() {
  const state = "SC";
  const a1 = RhtpSubTypeTemplateMap.A1;

  if (!a1.reportTemplateBuilder) {
    throw new Error("Report template builder not found for A1");
  }

  return buildReport(
    ReportType.RHTP,
    state,
    {
      name: `${state} - ${a1.name} - ${a1.dateRangeString}`,
      subType: a1.type,
      subTypeKey: "A1",
      budgetPeriod: a1.budgetPeriod,
      pages: await a1.reportTemplateBuilder(state, true),
    },
    {
      role: UserRoles.STATE_USER,
      fullName: "E2E Test User",
      email: "e2estateuser@test.com",
    }
  );
}
