import { Fragment, useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Spinner,
  Divider,
  Image,
} from "@chakra-ui/react";
import { AdminBannerForm, Banner, PageTemplate } from "components";
import {
  compareDates,
  formatMonthDayYear,
  parseAsLocalDate,
  useStore,
} from "utils";
import { BannerArea, bannerAreaLabels, BannerShape } from "@rhtp/shared";
import iconActive from "assets/icons/status/icon_status_check.svg";
import iconScheduled from "assets/icons/status/icon_status_inprogress.svg";
import iconExpired from "assets/icons/alert/icon_warning.svg";

export const AdminPage = () => {
  const { allBanners, fetchBanners, createBanner, deleteBanner } = useStore();
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      await fetchBanners();
      setLoading(false);
    })();
  }, []);

  const bannerGroups = groupAndSortBanners(allBanners);

  const onEdit = (_bannerKey: string) => {
    console.log("on edit");
  };

  const onDelete = async (bannerKey: string) => {
    setIsDeleting({ ...isDeleting, [bannerKey]: true });
    try {
      await deleteBanner(bannerKey);
    } finally {
      setIsDeleting({ ...isDeleting, [bannerKey]: false });
    }
  };

  return (
    <PageTemplate data-testid="admin-view">
      <Box>
        <Heading as="h1" id="AdminHeader" tabIndex={-1} sx={sx.headerText}>
          Banner Editor
        </Heading>
        <Text mb="1.25rem">Manage the announcement banners below.</Text>
        <AdminBannerForm createBanner={createBanner} />
      </Box>
      <Box>
        <Heading as="h2" sx={sx.sectionHeader}>
          Current Banners
        </Heading>
        {loading ? (
          <Flex sx={sx.spinnerContainer}>
            <Spinner size="md" />
          </Flex>
        ) : // oxlint-disable-next-line no-nested-ternary
        allBanners.length === 0 ? (
          <Text>There are no existing banners.</Text>
        ) : (
          <Flex sx={sx.bannerGroupsContainer}>
            {Object.entries(bannerGroups).map(([area, banners]) => (
              <Flex key={area} sx={sx.bannerGroupContainer}>
                <Heading as="h3">
                  {bannerAreaLabels[area as BannerArea]}
                </Heading>
                {banners.map((banner) => (
                  <Fragment key={banner.key}>
                    <Banner {...banner} key={banner.key} />
                    <Flex>{displayStatus(banner)}</Flex>
                    <Flex justify="flex-end">
                      <Button
                        variant="outline"
                        onClick={() => onEdit(banner.key)}
                        marginRight="1.5rem"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="link"
                        onClick={() => onDelete(banner.key)}
                        aria-label={`Delete banner titled ${banner.title}`}
                      >
                        {isDeleting[banner.key] ? (
                          <Spinner size="md" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </Flex>
                    <Divider></Divider>
                  </Fragment>
                ))}
              </Flex>
            ))}
          </Flex>
        )}
      </Box>
    </PageTemplate>
  );
};

function groupAndSortBanners(banners: BannerShape[]) {
  // Sort by startDate, then by endDate, then by createdAt. Earliest first.
  banners.sort(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) ||
      a.endDate.localeCompare(b.endDate) ||
      a.createdAt.localeCompare(b.createdAt)
  );

  const groups: Record<string, BannerShape[]> = {};
  for (let area of Object.keys(bannerAreaLabels)) {
    const group = banners.filter((b) => b.area === area);
    if (group.length > 0) {
      // Only display an area if it has any banners
      groups[area] = group;
    }
  }
  return groups;
}

function getStatus(startDate: Date, endDate: Date) {
  const now = new Date();
  if (now < startDate) return "Scheduled";
  if (compareDates(startDate, now) <= 0 && compareDates(now, endDate) <= 0)
    return "Active";
  return "Expired";
}

function displayStatus(banner: BannerShape) {
  const startDate = parseAsLocalDate(banner.startDate);
  const endDate = parseAsLocalDate(banner.endDate);
  const status = getStatus(startDate, endDate);
  const startDateEt = formatMonthDayYear(startDate.valueOf());
  const endDateEt = formatMonthDayYear(endDate.valueOf());

  const icons = {
    Expired: iconExpired,
    Active: iconActive,
    Scheduled: iconScheduled,
  };

  return (
    <Flex>
      <Image src={icons[status]} marginRight="0.5rem" width="24px" />
      <span>{status}</span>: {startDateEt}&ndash;{endDateEt}
    </Flex>
  );
}

const sx = {
  headerText: {
    marginBottom: "spacer2",
    fontSize: "heading_3xl",
    fontWeight: "heading_3xl",
  },
  sectionHeader: {
    marginBottom: "spacer2",
    fontSize: "heading_2xl",
    fontWeight: "heading_2xl",
  },
  bannerGroupsContainer: {
    flexDirection: "column",
    gap: "3rem",
    h3: {
      fontWeight: "bold",
    },
  },
  bannerGroupContainer: {
    flexDirection: "column",
    gap: "2rem",
  },
  spinnerContainer: {
    marginTop: "spacer1",
    ".ds-c-spinner": {
      "&:before": {
        borderColor: "black",
      },
      "&:after": {
        borderLeftColor: "black",
      },
    },
  },
  newBannerBox: {
    width: "100%",
    flexDirection: "column",
  },
};
