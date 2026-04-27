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
import { JSX, useState } from "react";
import sortIcon from "assets/icons/sort/icon_sort.svg";
import sortAscIcon from "assets/icons/sort/icon_sort_asc.svg";
import sortDescIcon from "assets/icons/sort/icon_sort_desc.svg";

type TableRowType = string | number | JSX.Element | undefined | boolean;

export enum SORT_TYPE {
  DEFAULT,
  ASCENDING,
  DESCENDING,
}

const HorizontalTable = (
  headers: string[],
  rows: TableRowType[][],
  sort: (header: string, type: SORT_TYPE) => void,
  variant?: string
) => {
  const [sorting, setSorting] = useState<{
    sort: string;
    state: SORT_TYPE;
  }>({ sort: "", state: SORT_TYPE.DEFAULT });

  const getSortState = (item: string) => {
    if (item === sorting.sort) {
      switch (sorting.state) {
        case SORT_TYPE.ASCENDING:
          return sortAscIcon;
        case SORT_TYPE.DESCENDING:
          return sortDescIcon;
      }
    }
    return sortIcon;
  };

  const setSort = (sortName: string) => {
    if (sorting.sort === sortName) {
      const type = (type: SORT_TYPE) => {
        switch (type) {
          case SORT_TYPE.DESCENDING:
            return SORT_TYPE.ASCENDING;
          case SORT_TYPE.ASCENDING:
            return SORT_TYPE.DEFAULT;
          case SORT_TYPE.DEFAULT:
            return SORT_TYPE.DESCENDING;
        }
      };
      sort(sortName, type(sorting.state));
      setSorting({ sort: sortName, state: type(sorting.state) });
    } else {
      setSorting({ sort: sortName, state: SORT_TYPE.DESCENDING });
      sort(sortName, SORT_TYPE.DESCENDING);
    }
  };

  return (
    <Table variant={variant ?? ""}>
      <Thead>
        <Tr>
          {headers.map((item) => (
            <Th key={item}>
              <span>
                <Button
                  variant="sort"
                  onClick={() => setSort(item)}
                  rightIcon={<Image src={getSortState(item)}></Image>}
                >
                  {item}
                </Button>
              </span>
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
  sort?: (header: string, type: SORT_TYPE) => void
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
