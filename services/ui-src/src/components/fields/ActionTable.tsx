import {
  Flex,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from "@chakra-ui/react";
import { Label, TextField, SingleInputDateField } from "@cmsgov/design-system";
import { PageElementProps } from "components/report/Elements";
import { useState } from "react";
import { ActionTableTemplate, ElementType, Row } from "types";

const buildElement = (defaultValue: string, element: ElementType) => {
  switch (element) {
    case ElementType.Textbox:
      return (
        <TextField
          label=""
          name="description"
          onBlur={() => {}}
          onChange={() => {}}
          value={defaultValue}
        />
      );
    case ElementType.Date:
      return (
        <SingleInputDateField
          name=""
          label=""
          onChange={() => {}}
          value={defaultValue}
        />
      );
  }
  return element;
};
//look into making it type generate and use the row id as consts
const buildRows = (rows: Row[], answer: any[]) => {
  const filledRows: any = [];
  answer.forEach((item) => {
    const rowElement: any = [];
    rows.map((row) => {
      const value = row.type
        ? buildElement(item[row.id], row.type)
        : item[row.id];
      rowElement.push(<Td>{value}</Td>);
    });
    rowElement.push(
      <Td>
        <Button variant="link">Edit/Abandon</Button>
      </Td>
    );
    filledRows.push(rowElement);
  });
  return filledRows;
};

export const ActionTable = (props: PageElementProps<ActionTableTemplate>) => {
  const { label, hintText, modal, rows, answer } = props.element;
  const [_isModalOpen, setModalOpen] = useState<boolean>(false);

  console.log(modal);

  const formattedRows = buildRows(rows, answer ?? []);

  return (
    <Flex gap="1.25rem" flexDirection="column" width="100%">
      <Label>{label}</Label>
      <Text>{hintText}</Text>
      <Button
        aria-label="Upload attachments"
        variant="outline"
        alignSelf="flex-start"
        onClick={() => setModalOpen(true)}
      >
        Add {label.toLowerCase()}
      </Button>
      <Table variant="metric">
        <Thead>
          <Tr>
            {rows.map((row) => (
              <Th>{row.header}</Th>
            ))}
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {formattedRows.map((row: any) => (
            <Tr>{row}</Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
};
