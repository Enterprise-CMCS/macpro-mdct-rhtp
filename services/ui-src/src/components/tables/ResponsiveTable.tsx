import {
  Grid,
  Hide,
  Show,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  VStack,
  Divider,
  Box,
} from "@chakra-ui/react";
import { JSX } from "react";

type TableRowType = string | JSX.Element | undefined | boolean;

const HorizontalTable = (headers: string[], rows: TableRowType[][]) => {
  return (
    <Table>
      <Thead>
        <Tr>
          {headers.map((item) => (
            <Th key={item}>{item}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((datas: TableRowType[], rowIndex) => (
          <Tr key={rowIndex}>
            {datas.map((data) => (
              <Td>{data}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const VerticalTable = (headers: string[], rows: TableRowType[][]) => {
  return (
    <VStack gap="1.5rem" alignItems="flex-start">
      {rows.map((row) => (
        <>
          <Grid templateColumns="repeat(3, 1fr)" gap="1.5rem">
            {row.map((data, dataIndex) => (
              <Box>
                <Text fontWeight="bold">{headers[dataIndex]}</Text>
                <span>{data}</span>
              </Box>
            ))}
          </Grid>
          <Divider></Divider>
        </>
      ))}
    </VStack>
  );
};

export const ResponsiveTable = (headers: string[], rows: TableRowType[][]) => {
  return (
    <>
      <Hide below="md" key="table">
        {HorizontalTable(headers, rows)}
      </Hide>
      <Show below="md" key="table-mobile">
        {VerticalTable(headers, rows)}
      </Show>
    </>
  );
};
