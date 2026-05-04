import { Accordion } from "@chakra-ui/react";
import { AccordionItem, ReportIntroCard } from "components";
import { ReportIntroCardActions } from "./ReportIntroCardActions";
import { ReportType } from "@rhtp/shared";

/**
 * This card appears on the state user home page.
 * It contains text specific to the RHTP report.
 */
export const RhtpIntroductionCard = () => {
  return (
    <ReportIntroCard title="RHTP Report">
      <p>
        The{" "}
        <a href="https://www.cms.gov/priorities/rural-health-transformation-rht-program/overview">
          Rural Health Transformation Program
        </a>{" "}
        aims to improve healthcare access, quality, and outcomes in rural
        communities. States using funding from this program to enhance their
        healthcare ecosystems must report on how the funds are being used, and
        what progress they are making towards healthcare goals. Reports are
        submitted quarterly, with the 4th being an annual summary.
      </p>
      <ReportIntroCardActions reportType={ReportType.RHTP} />
      <Accordion allowToggle={true} defaultIndex={[-1]}>
        <AccordionItem label="When is the RHTP Report Due?">
          Reports are due 30 days after the reporting period ends. The following
          reports are due in 2026.
          <br />
          Annual Report 1 due 8/30/2026
          <br />
          Quarterly Report 1 due 11/29/2026
        </AccordionItem>
      </Accordion>
    </ReportIntroCard>
  );
};
