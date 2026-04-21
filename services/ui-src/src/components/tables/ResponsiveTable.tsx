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

type TableRowType = string | number | JSX.Element | undefined | boolean;

const HorizontalTable = (
  headers: string[],
  rows: TableRowType[][],
  variant?: string
) => {
  return (
    <Table variant={variant ?? ""}>
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
  console.log(rows);
  return (
    <VStack gap="1.5rem" alignItems="flex-start">
      {rows.map((row) => (
        <>
          <Grid templateColumns="repeat(3, 1fr)" gap="1.5rem" columnGap="4rem">
            {row.map((data, dataIndex) => (
              <Box>
                <Text fontSize="1rem" color="#71767a">
                  {headers[dataIndex]}
                </Text>
                <Box>{data ?? "N/A"}</Box>
              </Box>
            ))}
          </Grid>
          <Divider></Divider>
        </>
      ))}
    </VStack>
  );
};

export const ResponsiveTable = (
  headers: string[],
  rows: TableRowType[][],
  variant?: string
) => {
  return (
    <>
      <Hide below="md" key="table">
        {HorizontalTable(headers, rows, variant)}
      </Hide>
      <Show below="md" key="table-mobile">
        {VerticalTable(headers, rows)}
      </Show>
    </>
  );
};
