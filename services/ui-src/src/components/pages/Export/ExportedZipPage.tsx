import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Dropdown } from "@cmsgov/design-system";
import { PageTemplate } from "components/layout/PageTemplate";
import { Modal } from "components/modals/Modal";
import { ReactElement, useState } from "react";
import { dropdownEmptyOption } from "../../../../../shared/src/utils/constants";
import { MultiSelect } from "components/forms/Multiselect";

const ExportCard = (title: string, desc: string, onClick: () => void) => {
  return (
    <Card
      boxShadow="0px 3px 9px rgba(0, 0, 0, 0.2)"
      paddingBottom="spacer3 !important"
    >
      <HStack justifyContent="space-between" padding="1.50rem">
        <Stack>
          <Text fontWeight="bold">{title}</Text>
          <Text>{desc}</Text>
        </Stack>
        <Button variant="outline" onClick={onClick}>
          Export
        </Button>
      </HStack>
    </Card>
  );
};

export const ExportedZipPage = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    heading: string;
    subHeading?: string;
    actionButtonText: string;
    closeButtonText?: string;
  }>({ heading: "", actionButtonText: "Export", closeButtonText: "Cancel" });
  const [modalChildren, setModalChildren] = useState<ReactElement>();

  const states = [dropdownEmptyOption];

  const onStateChange = () => {};
  const onReportChange = () => {};

  const export1 = () => {
    setModalData({
      ...modalData,
      heading: "Use of Funds: By Reports (includes All States)",
      subHeading:
        "Report includes all states. Select one or many reports to include in the download.",
    });
    setModalChildren(
      <MultiSelect
        label="Report(s)"
        onChange={onReportChange}
        options={[]}
        values={[]}
        placeholder={"- Select an option -"}
        countLabel={"Reports"}
      ></MultiSelect>
    );
    setModalOpen(true);
  };

  const export2 = () => {
    setModalData({
      ...modalData,
      heading: "Use of Funds: By State and Report(s) Export",
      subHeading:
        "Select one State and one or many reports to include in the download.",
    });
    setModalChildren(
      <Stack gap="1.5rem">
        <Dropdown
          label="State"
          name="state"
          onChange={onStateChange}
          options={states}
          value={""}
        ></Dropdown>
        <MultiSelect
          label="Report(s)"
          onChange={onReportChange}
          options={[]}
          values={[]}
          placeholder={"- Select an option -"}
          countLabel={"Reports"}
        ></MultiSelect>
      </Stack>
    );
    setModalOpen(true);
  };

  const OnExport = () => {};

  return (
    <PageTemplate>
      <Box>
        <Heading as="h1" id="Exporteader" variant="h1" tabIndex={-1}>
          Export RHTP Files and Data
        </Heading>
        <Text>
          Instructions go here that need to be seen at all times. Provide
          details and context to help the user complete this page.
        </Text>
      </Box>
      <Flex flexDirection="column" gap="spacer4">
        {ExportCard(
          "Use of Funds: By Reports (includes All States)",
          "{Details about what is included in the export}",
          export1
        )}
        {ExportCard(
          "Use of Funds: By State and Report(s)",
          "{Details about what is included in the export}",
          export2
        )}
      </Flex>
      <Modal
        modalDisclosure={{
          isOpen: modalOpen,
          onClose: () => {
            setModalOpen(false);
          },
        }}
        content={modalData}
        onConfirmHandler={OnExport}
        children={modalChildren}
      ></Modal>
    </PageTemplate>
  );
};
