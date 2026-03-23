import { InitiativesTableTemplate } from "types";
import { PageElementProps } from "./Elements";
import { useStore } from "utils";
import {
  Button,
  Image,
  Link,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import { AddEditInitiativeModal } from "components/modals/AddEditInitiativeModal";

export const InitiativesTable = (
  _props: PageElementProps<InitiativesTableTemplate>
) => {
  const { report } = useStore();
  const { reportType, state, reportId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInitiative, setSelectedInitiative] = useState<any>(undefined);

  const initiatives =
    report?.pages.filter((page) => !page.sidebar && page.id !== "root") || [];

  const editInitiative = (initiative: object) => {
    setSelectedInitiative(initiative);
    onOpen();
  };

  const onModalClose = () => {
    setSelectedInitiative(undefined);
    onClose();
  };

  const navigate = useNavigate();

  // Build Rows
  const rows = initiatives.map((initiative, index) => (
    <Tr key={index}>
      <Td>
        <Text fontWeight="bold">{initiative.title}</Text>
        <Text>Status: Not started</Text>
      </Td>
      <Td>
        <Button
          variant="link"
          onClick={() => editInitiative(initiative)}
          aria-label={`Edit name or status of ${initiative.title}`}
        >
          Edit name/status
        </Button>
        <Button
          as={Link}
          variant="outline"
          href={`/report/${reportType}/${state}/${reportId}/${initiative.id}`}
          aria-label={`Edit ${initiative.title}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(
              `/report/${reportType}/${state}/${reportId}/${initiative.id}`
            );
          }}
        >
          Edit
        </Button>
      </Td>
    </Tr>
  ));

  return (
    <Stack gap="1.5rem" width="100%">
      <Table variant="initiative">
        <Thead>
          <Tr>
            <Th>
              Initiative name <br />
              Status
            </Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>{rows}</Tbody>
      </Table>
      <Button
        width="fit-content"
        onClick={onOpen}
        variant="outline"
        leftIcon={<Image src={addIconPrimary} />}
      >
        Add initiative
      </Button>
      <AddEditInitiativeModal
        modalDisclosure={{
          isOpen,
          onClose: onModalClose,
        }}
        selectedInitiative={selectedInitiative}
      />
    </Stack>
  );
};
