import {
  Table,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
  Text,
  Heading,
  Box,
} from "@chakra-ui/react";
import { notAnsweredText } from "../../constants";
import { ElementType } from "@rhtp/shared";
import { ReactElement } from "react";
import { parseHtml } from "utils";

export type ReportTableType = {
  indicator: string;
  response?: string | number | ReactElement | undefined | string[];
  helperText?: string;
  type?: ElementType;
  required?: boolean;
};

interface Props {
  rows: ReportTableType[];
}

export const ExportedReportTable = ({ rows }: Props) => {
  const buildRowValues = (element: ReportTableType) => {
    const text = element.response ?? notAnsweredText;
    const color =
      text === notAnsweredText && element.required ? "error_darker" : "";
    const isOptional =
      !element.required && text === notAnsweredText ? ", optional" : "";
    return { text, color, isOptional };
  };

  return (
    <Table variant="export">
      <Thead>
        <Tr>
          <Th>Indicator</Th>
          <Th>Response</Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row: ReportTableType, idx) => {
          const value = buildRowValues(row);
          return (
            <Tr key={`${row.indicator}.${idx}`}>
              <Td>
                <Text>{row.indicator}</Text>
                {row.helperText && (
                  <Text color="gray">{parseHtml(row.helperText)}</Text>
                )}
                {row.type === ElementType.Date && <Text>MM/DD/YYYY</Text>}
              </Td>
              <Td color={value.color}>
                {value.text}
                {value.isOptional}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export const ExportRateTable = (
  tableData: { label: string; rows: ReportTableType[] }[]
) => {
  return tableData.map(
    (data: { label: string; rows: ReportTableType[] }, idx) => (
      <Box key={`${data.label}.${idx}`}>
        <Heading as="h5" variant="h5" className="performance-rate-header">
          {data?.label}
        </Heading>
        <ExportedReportTable rows={data?.rows} />
      </Box>
    )
  );
};
