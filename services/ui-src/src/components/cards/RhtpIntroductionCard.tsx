import { Accordion, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
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
      <Text>
        The{" "}
        <Link href="https://www.cms.gov/priorities/rural-health-transformation-rht-program/overview">
          Rural Health Transformation Program
        </Link>{" "}
        aims to improve healthcare access, quality, and outcomes in rural
        communities. States using funding from this program to enhance their
        healthcare ecosystems must report on how the funds are being used, and
        what progress they are making towards healthcare goals. Reports are
        submitted quarterly, with the 4th being an annual summary.
      </Text>
      <ReportIntroCardActions reportType={ReportType.RHTP} />
      <Accordion allowToggle={true} defaultIndex={[-1]}>
        <AccordionItem label="When is the RHTP report due?">
          <Text>
            See Figure 31 in the Appendix of the state reporting guide for a
            list of report due dates. You can find the state reporting guide on
            the{" "}
            <Link as={RouterLink} to="/help" variant="unstyled">
              help page
            </Link>
            .
          </Text>
        </AccordionItem>
      </Accordion>
    </ReportIntroCard>
  );
};
