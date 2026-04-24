import {
  InitiativePageTemplate,
  InitiativesTableTemplate,
  PageStatus,
} from "@rhtp/shared";
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
import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import { AddEditInitiativeModal } from "components/modals/AddEditInitiativeModal";

export const InitiativesTable = (
  props: PageElementProps<InitiativesTableTemplate>
) => {
  const { disabled } = props;
  const { report } = useStore();
  const { userIsAdmin } = useStore().user ?? {};
  const { reportType, state, reportId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInitiative, setSelectedInitiative] = useState<
    InitiativePageTemplate | undefined
  >(undefined);
  const [initiatives, setInitiatives] = useState<any[]>([]);

  useEffect(() => {
    const initiatives = (report?.pages.filter(
      (page) => "initiativeNumber" in page
    ) || []) as InitiativePageTemplate[];
    setInitiatives(initiatives);
  }, [report]);

  const editInitiative = (initiative: InitiativePageTemplate) => {
    setSelectedInitiative(initiative);
    onOpen();
  };

  const onModalClose = () => {
    setSelectedInitiative(undefined);
    onClose();
  };

  const navigate = useNavigate();

  // Build Rows
  const rows = initiatives.map(
    (initiative: InitiativePageTemplate, index: number) => {
      const displayName = `${initiative.initiativeNumber}: ${initiative.title}`;
      return (
        <Tr key={index}>
          <Td>
            <Text fontWeight="bold">{displayName}</Text>
            <Text>{`Status: ${initiative.status || "Not started"}`}</Text>
          </Td>
          <Td>
            {userIsAdmin && initiative.status !== PageStatus.ABANDONED && (
              <Button
                variant="link"
                onClick={() => editInitiative(initiative)}
                aria-label={`Edit status of ${displayName}`}
                disabled={disabled}
              >
                Edit status
              </Button>
            )}
            <Button
              as={Link}
              variant="outline"
              href={`/report/${reportType}/${state}/${reportId}/${initiative.id}`}
              aria-label={`Edit ${displayName}`}
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
      );
    }
  );

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
      {userIsAdmin && (
        <Button
          width="fit-content"
          onClick={onOpen}
          variant="outline"
          leftIcon={<Image src={addIconPrimary} />}
        >
          Add initiative
        </Button>
      )}
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
