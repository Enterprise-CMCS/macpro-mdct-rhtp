import { Accordion, Box, Button } from "@chakra-ui/react";
import { Page } from "components/report/Page";
import { AccordionItem } from "components";
import { PageElementProps } from "components/report/Elements";
import { AccordionGroupTemplate, PageElement } from "types";
import { useState } from "react";

export const AccordionGroup = (
  props: PageElementProps<AccordionGroupTemplate>
) => {
  const { accordions } = props.element;
  const [accordionState, setAccordionState] = useState<number[]>([]);

  const setAccordionChildren = (element: PageElement[], index: number) => {
    const updatedAnswer = accordions[index];

    props.updateElement({
      accordions: [
        ...accordions.slice(0, index),
        { ...updatedAnswer, children: element },
        ...accordions.slice(index + 1),
      ],
    });
  };

  const expandAll = () => {
    const items = accordions.reduce((prev: number[], _curr, index) => {
      prev.push(index);
      return prev;
    }, []);

    setAccordionState(items);
  };

  const collapseAll = () => {
    setAccordionState([]);
  };

  const toggle = (index: number) => {
    if (accordionState.includes(index)) {
      setAccordionState(accordionState.filter((number) => number != index));
    } else {
      setAccordionState([...accordionState, index]);
    }
  };

  return (
    <Box width="100%">
      <Box padding="1.5rem">
        <Button
          onClick={expandAll}
          variant="link"
          marginRight="1.5rem"
          fontWeight="bold"
        >
          Expand all
        </Button>
        <Button onClick={collapseAll} variant="link" fontWeight="bold">
          Collapse all
        </Button>
      </Box>
      <Accordion allowMultiple variant="border" index={accordionState}>
        {accordions.map((accordion, index) => (
          <AccordionItem label={accordion.label} onClick={() => toggle(index)}>
            <Page
              id="radio-children"
              setElements={(element) => setAccordionChildren(element, index)}
              elements={accordion.children}
            />
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};
