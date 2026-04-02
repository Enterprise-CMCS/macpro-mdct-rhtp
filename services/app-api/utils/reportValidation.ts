import {
  array,
  boolean,
  lazy,
  mixed,
  number,
  object,
  Schema,
  string,
} from "yup";
import {
  Report,
  ReportStatus,
  ReportType,
  PageType,
  ElementType,
  PageElement,
  CreateReportOptions,
  CreateInitiativeOptions,
  UpdateInitiativeOptions,
} from "../types/reports";
import { error } from "./constants";

const hideConditionSchema = object()
  .shape({
    controllerElementId: string().required(),
    answer: string().required(),
  })
  .notRequired()
  .default(undefined);

const headerTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.Header)),
  id: string().required(),
  text: string().required(),
  icon: string().notRequired(),
});

const subHeaderTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.SubHeader)),
  id: string().required(),
  text: string().required(),
  helperText: string().notRequired(),
  hideCondition: hideConditionSchema,
});

const paragraphTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.Paragraph)),
  id: string().required(),
  text: string().required(),
  title: string().notRequired(),
  weight: string().notRequired(),
});

const textboxTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.Textbox)),
  id: string().required(),
  label: string().required(),
  helperText: string().notRequired(),
  answer: string().notRequired(),
  required: boolean().required(),
  hideCondition: hideConditionSchema,
  quarterly: boolean().notRequired(),
  disabled: boolean().notRequired(),
});

const listInputTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.ListInput)),
  id: string().required(),
  label: string().required(),
  fieldLabel: string().required(),
  helperText: string().required(),
  buttonText: string().required(),
  answer: array().of(string()).notRequired(),
  required: boolean().required(),
  validation: string().notRequired(),
});

const numberFieldTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.NumberField)),
  id: string().required(),
  label: string().required(),
  helperText: string().notRequired(),
  answer: number().notRequired(),
  required: boolean().required(),
});

const textAreaTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.TextAreaField)),
  id: string().required(),
  label: string().required(),
  helperText: string().notRequired(),
  answer: string().notRequired(),
  hideCondition: hideConditionSchema,
  required: boolean().required(),
});

const dateTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.Date)),
  id: string().required(),
  label: string().required(),
  helperText: string().required(),
  answer: string().notRequired(),
  required: boolean().required(),
});

const dropdownTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.Dropdown)),
  id: string().required(),
  label: string().required(),
  helperText: string().required(),
  options: array().of(
    object().shape({
      label: string().required(),
      value: string().required(),
      checked: boolean().notRequired(),
      checkedChildren: lazy(() => array().of(pageElementSchema).notRequired()),
    })
  ),
  answer: string().notRequired(),
  required: boolean().required(),
});

const accordionTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.Accordion)),
  id: string().required(),
  label: string().required(),
  value: string().required(),
});

const useOfFundsTableSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.UseOfFundsTable)),
  id: string().required(),
  dropDownOptions: object().shape({
    budgetPeriodOptions: array().of(
      object().shape({
        label: string().required(),
        value: string().notRequired(),
      })
    ),
    useOfFundsOptions: array().of(
      object().shape({
        label: string().required(),
        value: string().notRequired(),
      })
    ),
    recipientCategoryOptions: array().of(
      object().shape({
        label: string().required(),
        value: string().notRequired(),
      })
    ),
  }),
  answer: array()
    .of(
      object().shape({
        id: string().required(),
        budgetPeriod: string().required(),
        spentFunds: string().required(),
        description: string().required(),
        initiative: string().required(),
        useOfFunds: string().required(),
        recipientName: string().required(),
        recipientCategory: string().required(),
      })
    )
    .notRequired(),
});

const pageElementSchema = lazy((value: PageElement): Schema => {
  if (!value.type) {
    throw new Error("Some error message");
  }
  switch (value.type) {
    case ElementType.Header:
      return headerTemplateSchema;
    case ElementType.SubHeader:
      return subHeaderTemplateSchema;
    case ElementType.Paragraph:
      return paragraphTemplateSchema;
    case ElementType.Textbox:
      return textboxTemplateSchema;
    case ElementType.TextAreaField:
      return textAreaTemplateSchema;
    case ElementType.NumberField:
      return numberFieldTemplateSchema;
    case ElementType.Date:
      return dateTemplateSchema;
    case ElementType.Dropdown:
      return dropdownTemplateSchema;
    case ElementType.Accordion:
      return accordionTemplateSchema;
    case ElementType.Radio:
      return radioTemplateSchema;
    case ElementType.Checkbox:
      return checkboxTemplateSchema;
    case ElementType.ButtonLink:
      return buttonLinkTemplateSchema;
    case ElementType.StatusTable:
      return statusTableTemplateSchema;
    case ElementType.StatusAlert:
      return statusAlertSchema;
    case ElementType.Divider:
      return dividerSchema;
    case ElementType.SubmissionParagraph:
      return submissionParagraphSchema;
    case ElementType.ListInput:
      return listInputTemplateSchema;
    case ElementType.TableCheckpoint:
      return tableCheckpointTemplateSchema;
    case ElementType.UseOfFundsTable:
      return useOfFundsTableSchema;
    case ElementType.InitiativesTable:
      return initiativesTableSchema;
    case ElementType.AttachmentArea:
      return attachmentAreaSchema;
    case ElementType.AccordionGroup:
      return accordionGroupTemplateSchema;
    case ElementType.AttachmentTable:
      return attachmentTableSchema;
    case ElementType.ActionTable:
      return actionTableSchema;
    default:
      throw new Error("Page Element type is not valid");
  }
});

const radioTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.Radio)),
  id: string().required(),
  label: string().required(),
  helperText: string().notRequired(),
  choices: array().of(
    object().shape({
      label: string().required(),
      value: string().required(),
      checked: boolean().notRequired(),
      checkedChildren: lazy(() => array().of(pageElementSchema).notRequired()),
    })
  ),
  answer: string().notRequired(),
  required: boolean().required(),
  clickAction: string().notRequired(),
  hideCondition: hideConditionSchema,
});

const checkboxTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.Checkbox)),
  id: string().required(),
  label: string().required(),
  helperText: string().notRequired(),
  choices: array().of(
    object().shape({
      label: string().required(),
      value: string().required(),
      checked: boolean().notRequired(),
      checkedChildren: lazy(() => array().of(pageElementSchema).notRequired()),
    })
  ),
  answer: array().of(string()).notRequired(),
  required: boolean().required(),
});

const tableCheckpointTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.TableCheckpoint)),
  id: string().required(),
  label: string().required(),
  helperText: string().notRequired(),
  stage: number().required(),
  checkpoints: array().of(
    object().shape({
      id: string().required(),
      label: string().required(),
      attachable: boolean().notRequired(),
    })
  ),
  answer: array()
    .of(
      object().shape({
        id: string().required(),
        label: string().required(),
        completed: boolean().required(),
        attachments: array()
          .of(
            object().shape({
              name: string().required(),
              size: number().required(),
              fileId: string().required(),
            })
          )
          .notRequired(),
      })
    )
    .notRequired(),
  required: boolean().required(),
});

const accordionGroupTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.AccordionGroup)),
  id: string().required(),
  accordions: array()
    .of(
      object().shape({
        label: string().required(),
        children: lazy(() => array().of(pageElementSchema).required()),
      })
    )
    .required(),
  required: boolean().required(),
  answer: array().of(boolean()).notRequired(),
});

const buttonLinkTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.ButtonLink)),
  id: string().required(),
  label: string().required(),
  to: string().required(),
  style: string().optional(),
});

const attachmentAreaSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.AttachmentArea)),
  id: string().required(),
  label: string().required(),
  helperText: string().optional(),
  required: boolean().required(),
  answer: array().of(
    object().shape({
      name: string().required(),
      size: number().required(),
      fileId: string().required(),
    })
  ),
});

const ActionElementsSchema = {
  id: string().required(),
  type: string().required(),
  disabled: boolean().notRequired(),
};

const actionTableSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.ActionTable)),
  id: string().required(),
  label: string().required(),
  hintText: string().required(),
  modal: object()
    .shape({
      title: string().required(),
      hintText: string().notRequired(),
      elements: array()
        .of(
          object().shape({
            ...ActionElementsSchema,
            editOnly: boolean().notRequired(),
            children: array()
              .of(
                object().shape({
                  label: string().required(),
                  value: string().required(),
                })
              )
              .notRequired(),
            required: boolean().required(),
          })
        )
        .required(),
    })
    .required(),
  rows: array()
    .of(
      object().shape({
        ...ActionElementsSchema,
        header: string().required(),
      })
    )
    .required(),
  answer: array().of(mixed()).notRequired(),
});

const initiativesTableSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.InitiativesTable)),
  id: string().required(),
});

const attachmentTableSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.AttachmentTable)),
  id: string().required(),
  answer: array()
    .of(
      object().shape({
        attachment: object().shape({
          name: string().required(),
          size: number().required(),
          fileId: string().required(),
        }),
        initiatives: array().of(string()).required(),
        stage: string().required(),
        checkpoints: string().required(),
        status: string().required(),
        comments: array().of(
          object().shape({
            name: string().required(),
            date: string().required(),
          })
        ),
      })
    )
    .notRequired(),
});

const dividerSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.Divider)),
  id: string().required(),
});

const submissionParagraphSchema = object().shape({
  type: string()
    .required()
    .matches(new RegExp(ElementType.SubmissionParagraph)),
  id: string().required(),
});

const statusTableTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.StatusTable)),
  id: string().required(),
  to: string().required(),
});

const parentPageTemplateSchema = object().shape({
  id: string().required(),
  childPageIds: array().of(string()).required(),
});

const statusAlertSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.StatusAlert)),
  id: string().required(),
  title: string().required(),
  text: string().required(),
  status: string().required(),
});

const formPageTemplateSchema = object().shape({
  id: string().required(),
  title: string().required(),
  type: mixed<PageType>().oneOf(Object.values(PageType)).required(),
  status: string().notRequired(),
  elements: array().of(pageElementSchema).required(),
  sidebar: boolean().notRequired(),
  hideNavButtons: boolean().notRequired(),
  childPageIds: array().of(string()).notRequired(),
});

const initiativePageTemplateSchema = formPageTemplateSchema.shape({
  initiativeNumber: string().required(),
});

const reviewSubmitTemplateSchema = formPageTemplateSchema.shape({
  submittedView: array().of(pageElementSchema).required(),
});

/**
 * This schema is meant to represent the pages field in the ReportTemplate type.
 * The following yup `lazy` function is building up the union type:
 * `(ParentPageTemplate | FormPageTemplate)[]`
 * and outputs the correct type in the union based on various fields
 * on the page object that gets passed through.
 */
const pagesSchema = array()
  .of(
    lazy((pageObject) => {
      if (pageObject.initiativeNumber) {
        return initiativePageTemplateSchema;
      }
      if (!pageObject.type) {
        if (pageObject.id && pageObject.childPageIds) {
          return parentPageTemplateSchema;
        } else {
          throw new Error("Some error message");
        }
      } else {
        switch (pageObject.type) {
          case PageType.ReviewSubmit:
            return reviewSubmitTemplateSchema;
          default:
            return formPageTemplateSchema;
        }
      }
    })
  )
  .required();

export const isCreateReportOptions = (
  obj: object | undefined
): obj is CreateReportOptions => {
  const createReportOptionsValidationSchema = object()
    .shape({
      copyFromReportId: string().notRequired(),
    })
    .required()
    .noUnknown();

  return createReportOptionsValidationSchema.isValidSync(obj, {
    stripUnknown: false,
    strict: true,
  });
};

export const isCreateInitiativeBody = (
  obj: object | undefined
): obj is CreateInitiativeOptions => {
  const createInitiativeSchema = object()
    .shape({
      initiativeName: string().required(),
      initiativeNumber: string().required(),
    })
    .required()
    .noUnknown();

  return createInitiativeSchema.isValidSync(obj, {
    stripUnknown: false,
    strict: true,
  });
};

export const isUpdateInitiativeBody = (
  obj: object | undefined
): obj is UpdateInitiativeOptions => {
  const updateInitiativeSchema = object()
    .shape({
      initiativeAbandon: boolean().required(),
    })
    .required()
    .noUnknown();

  return updateInitiativeSchema.isValidSync(obj, {
    stripUnknown: false,
    strict: true,
  });
};

const reportValidateSchema = object().shape({
  id: string().notRequired(),
  state: string().required(),
  created: number().notRequired(),
  copyFromReportId: string().notRequired(),
  lastEdited: number().notRequired(),
  lastEditedBy: string().required(),
  lastEditedByEmail: string().notRequired(),
  submitted: number().notRequired(),
  submissionDates: array()
    .of(
      object().shape({
        submitted: number().notRequired(),
      })
    )
    .notRequired(),
  submittedBy: string().notRequired(),
  submittedByEmail: string().notRequired(),
  status: mixed<ReportStatus>().oneOf(Object.values(ReportStatus)).required(),
  name: string().required(),
  type: mixed<ReportType>().oneOf(Object.values(ReportType)).required(),
  subType: number().notRequired(),
  year: number().required(),
  submissionCount: number().required(),
  pages: pagesSchema,
});

export const validateReportPayload = async (payload: object | undefined) => {
  if (!payload) {
    throw new Error(error.MISSING_DATA);
  }
  const validatedPayload = await reportValidateSchema.validate(payload, {
    stripUnknown: true,
  });

  return validatedPayload as Report;
};
