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
  Image,
} from "@chakra-ui/react";
import { JSX } from "react";
import sortIcon from "assets/icons/sort/icon_sort.svg";
import sortAscIcon from "assets/icons/sort/icon_sort_asc.svg";
import sortDescIcon from "assets/icons/sort/icon_sort_desc.svg";

type TableRowType = string | number | JSX.Element | undefined | boolean;

export enum SORT_TYPE {
  DEFAULT,
  ASCENDING,
  DESCENDING,
}

let sort = { label: "", type: SORT_TYPE.DEFAULT };

const getSortIcon = (type: SORT_TYPE) => {
  switch (type) {
    case SORT_TYPE.ASCENDING:
      return sortAscIcon;
    case SORT_TYPE.DESCENDING:
      return sortDescIcon;
    default:
      return sortIcon;
  }
};

const setNextSort = (type: SORT_TYPE) => {
  switch (type) {
    case SORT_TYPE.DESCENDING:
      return SORT_TYPE.ASCENDING;
    case SORT_TYPE.ASCENDING:
      return SORT_TYPE.DEFAULT;
    case SORT_TYPE.DEFAULT:
      return SORT_TYPE.DESCENDING;
  }
};

const HorizontalTable = (
  headers: { label: string; sortable?: boolean }[],
  rows: TableRowType[][],
  sorting: (header: string, type: SORT_TYPE) => void,
  variant: string
) => {
  const onSort = (sortName: string) => {
    const type =
      sortName === sort.label ? setNextSort(sort.type) : SORT_TYPE.DESCENDING;
    sort = { label: sortName, type };
    sorting(sortName, type);
  };

  return (
    <Table variant={variant}>
      <Thead>
        <Tr>
          {headers.map((item) => (
            <Th key={item.label}>
              {item.sortable ? (
                <Button
                  variant="sort"
                  onClick={() => onSort(item.label)}
                  rightIcon={
                    <Image
                      src={
                        item.label === sort.label
                          ? getSortIcon(sort.type)
                          : sortIcon
                      }
                    ></Image>
                  }
                >
                  {item.label}
                </Button>
              ) : (
                item.label
              )}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((column: TableRowType[], rowIndex) => (
          <Tr key={rowIndex}>
            {column.map((data) => (
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
          {row.map((data, dataIndex) => (
            <Grid templateColumns="repeat(2, 250px)" gap="1.5rem">
              <Text fontSize="1rem" color="#71767a" fontWeight="bold">
                {headers[dataIndex]}
              </Text>
              <Box>{data ?? "N/A"}</Box>
            </Grid>
          ))}
          <Divider></Divider>
        </>
      ))}
    </VStack>
  );
};

export const ResponsiveTable = (
  headers: { label: string; sortable?: boolean }[],
  rows: TableRowType[][],
  variant?: string,
  sorting: (header: string, type: SORT_TYPE) => void = () => {}
) => {
  return (
    <>
      <Hide below="md" key="table">
        {HorizontalTable(headers, rows, sorting, variant ?? "")}
      </Hide>
      <Show below="md" key="table-mobile">
        {VerticalTable(
          headers.map((header) => header.label),
          rows
        )}
      </Show>
    </>
  );
};
