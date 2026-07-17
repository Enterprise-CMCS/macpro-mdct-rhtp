import {
  ElementType,
  InitiativePageTemplate,
  InitiativesTableTemplate,
  isCompleteStatus,
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
import { elementSatisfiesRequired } from "utils/state/reportLogic/completeness";
import { TableStatusIcon } from "components/tables/TableStatusIcon";

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
  const [showStatus, setShowStatus] = useState<boolean>(false);

  useEffect(() => {
    const table = report?.pages
      .find((page) => page.id === "initiatives")
      ?.elements?.find(
        (element) => element.type === ElementType.InitiativesTable
      ) ?? { required: false };

    setShowStatus(table.required);

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

  const getStatus = (initiative: InitiativePageTemplate) => {
    if (initiative.status === "Abandoned") return undefined;

    const elements = initiative.elements.filter(
      (element) => "required" in element && element.required
    );
    const statuses = elements.map((element) =>
      elementSatisfiesRequired(element, elements)
    );
    return statuses.every(Boolean)
      ? PageStatus.COMPLETE
      : PageStatus.NOT_STARTED;
  };

  const getMinimumRequirement = (initiative: InitiativePageTemplate) => {
    switch (getStatus(initiative)) {
      case PageStatus.COMPLETE:
        return "Minimum requirements met";
      case PageStatus.NOT_STARTED:
        return "Minimum requirements not met";
      default:
        return initiative.status;
    }
  };

  // Build Rows
  const rows = initiatives.map(
    (initiative: InitiativePageTemplate, index: number) => {
      const displayName = `${initiative.initiativeNumber}: ${initiative.title}`;
      const buttonName =
        initiative.status === PageStatus.ABANDONED || disabled
          ? `View`
          : `Edit`;
      return (
        <Tr key={index}>
          {showStatus && (
            <Td>
              <TableStatusIcon tableStatus={getStatus(initiative)} />
            </Td>
          )}
          <Td>
            <Text fontWeight="bold">{displayName}</Text>
            {showStatus && (
              <Text>{`Status: ${getMinimumRequirement(initiative)}`}</Text>
            )}
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
              aria-label={`${buttonName} ${displayName}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(
                  `/report/${reportType}/${state}/${reportId}/${initiative.id}`
                );
              }}
            >
              {buttonName}
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
            {showStatus && <Th>Status</Th>}
            <Th>Initiative</Th>
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
          disabled={isCompleteStatus(report?.status)}
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
