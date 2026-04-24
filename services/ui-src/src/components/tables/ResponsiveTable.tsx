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
  Button,
} from "@chakra-ui/react";
import { JSX } from "react";

type TableRowType = string | number | JSX.Element | undefined | boolean;

const HorizontalTable = (
  headers: string[],
  rows: TableRowType[][],
  sort: (header: string) => void,
  variant?: string
) => {
  return (
    <Table variant={variant ?? ""}>
      <Thead>
        <Tr>
          {headers.map((item) => (
            <Th key={item}>
              {item}{" "}
              <Button variant="link" onClick={() => sort(item)}>
                S
              </Button>
            </Th>
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
  variant?: string,
  sort?: (header: string) => void
) => {
  const sortable = sort ?? (() => {});
  return (
    <>
      <Hide below="md" key="table">
        {HorizontalTable(headers, rows, sortable, variant)}
      </Hide>
      <Show below="md" key="table-mobile">
        {VerticalTable(headers, rows)}
      </Show>
    </>
  );
};
