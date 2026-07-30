import { useNavigate, useParams } from "react-router";
import {
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from "@chakra-ui/react";
import { useStore } from "utils";
import { TableStatusIcon } from "components/tables/TableStatusIcon";
import { submittableMetricsSelector } from "utils/state/selectors";

export const StatusTableElement = () => {
  const { report } = useStore();
  const { reportType, state, reportId } = useParams();
  const navigate = useNavigate();
  const submittableMetrics = useStore(submittableMetricsSelector);

  if (!report) {
    return null;
  }

  const handleEditClick = (sectionId: string) => {
    const path = `/report/${reportType}/${state}/${reportId}/${sectionId}`;
    navigate(path);
  };

  // Build Rows
  const rows = submittableMetrics?.sections.map((sectionDetails, index) => {
    if (!sectionDetails) return;
    const { section, displayStatus: status } = sectionDetails;
    return (
      <Tr key={section.id || index} p={0}>
        <Td>
          <Text>{section.title}</Text>
        </Td>
        <Td>
          <TableStatusIcon tableStatus={status} showLabel={true} />
        </Td>
        <Td>
          <Button
            variant="outline"
            width="100%"
            onClick={() => handleEditClick(section.id)}
          >
            Edit
          </Button>
        </Td>
      </Tr>
    );
  });

  return (
    <>
      <Table variant="status">
        <Thead>
          <Tr>
            <Th>Section</Th>
            <Th>Status</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>{rows}</Tbody>
      </Table>
    </>
  );
};
