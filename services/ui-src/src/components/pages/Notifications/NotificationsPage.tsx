import { Accordion, Box, Button, Heading, Image, Text } from "@chakra-ui/react";
import { AccordionItem } from "components/accordions/AccordionItem";
import { PageTemplate } from "components/layout/PageTemplate";
import {
  ResponsiveTable,
  TableRowType,
} from "components/tables/ResponsiveTable";
import addPrimary from "assets/icons/add/icon_add_blue.svg";

const headers = [{ label: "Email" }, { label: "States" }, { label: "Actions" }];

const accordionContent = {
  label: "Accordion heading",
  content: "More info coming soon",
};

export const NotificationsPage = () => {
  const rows: TableRowType[][] = [];
  return (
    <PageTemplate>
      <Box>
        <Heading as="h1" id="AdminHeader" tabIndex={-1} sx={sx.headerText}>
          Notifications Settings
        </Heading>
        <Text sx={sx.subHeaderText}>
          Instructions go here that need to be seen at all times. Provide
          details and context to help the user complete this page.
        </Text>
        <Accordion allowToggle={true} defaultIndex={[-1]} sx={sx.accordion}>
          <AccordionItem label={accordionContent.label}>
            {accordionContent.content}
          </AccordionItem>
        </Accordion>
        <Button
          variant="outline"
          leftIcon={<Image src={addPrimary} alt="Add icon" />}
          onClick={() => {}}
          sx={sx.addEmailButton}
        >
          Add email
        </Button>
      </Box>
      {ResponsiveTable(headers, rows)}
      {rows.length === 0 && (
        <Text variant="tableEmpty">
          Click "Add email" to start adding assigned notification recipients.
        </Text>
      )}
    </PageTemplate>
  );
};

const sx = {
  headerText: {
    marginBottom: "spacer2",
    fontSize: "heading_3xl",
    fontWeight: "heading_3xl",
  },
  subHeaderText: {
    color: "gray_dark",
  },
  accordion: {
    marginY: "spacer2",
  },
  addEmailButton: {
    marginTop: "spacer3",
    height: "2.25rem",
    width: "10.25rem",
  },
};
