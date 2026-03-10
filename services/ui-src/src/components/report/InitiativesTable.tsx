import { InitiativesTableTemplate } from "types";
import { PageElementProps } from "./Elements";
import { useStore } from "utils";
import {
  Button,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";

export const InitiativesTable = (
  _props: PageElementProps<InitiativesTableTemplate>
) => {
  const { report } = useStore();
  const { reportType, state, reportId } = useParams();

  const initiatives = report?.pages.filter(
    (page) => !page.sidebar && page.id !== "root"
  );

  // Build Rows
  const rows = initiatives?.map((inititative, index) => (
    <Tr key={index}>
      <Td>
        <Text fontWeight="bold">{inititative.title}</Text>
        <Text>Status: Not started</Text>
      </Td>
      <Td>
        <Button
          as={Link}
          variant="outline"
          href={`/report/${reportType}/${state}/${reportId}/${inititative.id}`}
          aria-label={`Edit ${inititative.title}`}
        >
          Edit
        </Button>
      </Td>
    </Tr>
  ));
  return (
    <Table>
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
  );
};
