import { Box, Collapse, Heading, Text } from "@chakra-ui/react";
import {
  AdminDashSelector,
  Banner,
  PageTemplate,
  RhtpIntroductionCard,
} from "components";
import { useEffect } from "react";
import { checkDateRangeStatus, useStore } from "utils";

export const HomePage = () => {
  const { bannerData, bannerActive, setBannerActive } = useStore();
  const { userIsEndUser } = useStore().user ?? {};

  useEffect(() => {
    let bannerActivity = false;
    if (bannerData && bannerData.startDate && bannerData.endDate) {
      bannerActivity = checkDateRangeStatus(
        bannerData.startDate,
        bannerData.endDate
      );
    }
    setBannerActive(bannerActivity);
  }, [bannerData]);

  const showBanner = !!bannerData?.key && bannerActive;

  return (
    <>
      <Collapse in={showBanner}>
        <Box marginX={{ base: "spacer2", md: "spacer3" }} marginTop="spacer3">
          <Banner bannerData={bannerData} />
        </Box>
      </Collapse>
      <PageTemplate>
        {/* show standard view to state users */}
        {userIsEndUser ? (
          <>
            <Box>
              <Heading as="h1" variant="h1" paddingBottom="spacer3">
                Rural Health Transformation Program
              </Heading>
              <Text paddingBottom="spacer3">
                Get started by completing the reports for your state or
                territory.
              </Text>
            </Box>
            <RhtpIntroductionCard />
          </>
        ) : (
          // show read-only view to non-state users
          <AdminDashSelector />
        )}
      </PageTemplate>
    </>
  );
};
