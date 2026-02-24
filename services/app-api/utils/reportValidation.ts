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
  ReportOptions,
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

const pageElementSchema = lazy((value: PageElement): Schema => {
  if (!value.type) {
    throw new Error();
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
    case ElementType.AttachmentArea:
      return attachmentAreaSchema;
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

const buttonLinkTemplateSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.ButtonLink)),
  id: string().required(),
  label: string().optional(),
  to: string().optional(),
  style: string().optional(),
});

const attachmentAreaSchema = object().shape({
  type: string().required().matches(new RegExp(ElementType.AttachmentArea)),
  id: string().required(),
  label: string().required(),
  helperText: string().optional(),
  required: boolean().required(),
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
      if (!pageObject.type) {
        if (pageObject.id && pageObject.childPageIds) {
          return parentPageTemplateSchema;
        } else {
          throw new Error();
        }
      } else {
        switch (pageObject.type) {
          case PageType.ReviewSubmit:
            return reviewSubmitTemplateSchema;
          case PageType.Standard:
          default:
            return formPageTemplateSchema;
        }
      }
    })
  )
  .required();

export const isReportOptions = (
  obj: object | undefined
): obj is ReportOptions => {
  const reportOptionsValidationSchema = object()
    .shape({
      name: string().required(),
      year: number().required(),
    })
    .required()
    .noUnknown();

  return reportOptionsValidationSchema.isValidSync(obj, {
    stripUnknown: false,
    strict: true,
  });
};

const reportValidateSchema = object().shape({
  id: string().notRequired(),
  state: string().required(),
  created: number().notRequired(),
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
  year: number().required(),
  submissionCount: number().required(),
  archived: boolean().required(),
  pages: pagesSchema,
});

// Can add more editable fields here in the future
const reportEditValidateSchema = object().shape({
  name: string().notRequired(),
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

export const validateReportEditPayload = async (
  payload: object | undefined
) => {
  if (!payload) {
    throw new Error(error.MISSING_DATA);
  }

  const validatedPayload = await reportEditValidateSchema.validate(payload, {
    stripUnknown: true,
  });

  return validatedPayload as Partial<Report>;
};
