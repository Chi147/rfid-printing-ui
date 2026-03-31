// src/utils/schema.ts

export type LabelMode = "general" | "project";

export type OrganizationLogoId = "RoboAI" | "EU" | "SAMK" | "custom";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "select"
  | "readonly";

export type StorageLocationOption =
  | "Lab Shelf A"
  | "Lab Shelf B"
  | "Lab Shelf C"
  | "Project Rack A"
  | "Project Rack B"
  | "Storage Room"
  | "Office"
  | "Other";

export interface LabelFormValues {
  mode: LabelMode;

  // printed on tag
  name: string;
  responsiblePerson: string;
  storageLocation: string;
  storageLocationOther: string;
  printedDate: string;
  checkByDate: string;
  organizationLogo: OrganizationLogoId;

  // db only
  printedBy: string;
  secondResponsiblePerson: string;
  description: string;
  epc: string;
  barcodeNumber: string;
  lastUpdated: string;
}

export interface FieldSchema {
  key: keyof LabelFormValues;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  options?: string[];
  readOnly?: boolean;
  showWhen?: (values: LabelFormValues) => boolean;
}

export interface LabelSchema {
  mode: LabelMode;
  modeLabel: string;
  description: string;
  fields: FieldSchema[];
  printedFieldOrder: Array<
    | "name"
    | "responsiblePerson"
    | "storageLocation"
    | "printedDate"
    | "checkByDate"
  >;
  dbOnlyFields: Array<
    | "printedBy"
    | "secondResponsiblePerson"
    | "description"
    | "epc"
    | "barcodeNumber"
    | "lastUpdated"
    | "storageLocationOther"
  >;
}

export const STORAGE_LOCATION_OPTIONS: StorageLocationOption[] = [
  "Lab Shelf A",
  "Lab Shelf B",
  "Lab Shelf C",
  "Project Rack A",
  "Project Rack B",
  "Storage Room",
  "Office",
  "Other",
];

export const ORGANIZATION_LOGO_OPTIONS: Array<{
  value: OrganizationLogoId;
  label: string;
}> = [
  { value: "RoboAI", label: "RoboAI" },
  { value: "EU", label: "EU" },
  { value: "SAMK", label: "SAMK" },
  { value: "custom", label: "Custom" },
];

export const DEFAULT_LOGO: OrganizationLogoId = "RoboAI";

export const createInitialValues = (): LabelFormValues => ({
  mode: "general",

  // printed on tag
  name: "",
  responsiblePerson: "",
  storageLocation: "",
  storageLocationOther: "",
  printedDate: getTodayISODate(),
  checkByDate: "",
  organizationLogo: DEFAULT_LOGO,

  // db only
  printedBy: "",
  secondResponsiblePerson: "",
  description: "",
  epc: "",
  barcodeNumber: "",
  lastUpdated: "",
});

const commonPrintedFields: FieldSchema[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Example: Erikoisteipit",
    helperText:
      "Use a clear name that makes sense immediately when someone reads the tag.",
  },
  {
    key: "responsiblePerson",
    label: "Responsible person",
    type: "text",
    required: true,
    placeholder: "Who is responsible for this box/item?",
    helperText: "This person is responsible for the item and its check-by date.",
  },
  {
    key: "storageLocation",
    label: "Storage location",
    type: "select",
    required: true,
    options: [...STORAGE_LOCATION_OPTIONS],
    helperText:
      "Choose where the item is stored. Select Other if the location is not listed.",
  },
  {
    key: "storageLocationOther",
    label: "Other storage location",
    type: "text",
    required: true,
    placeholder: "Enter storage location manually",
    helperText: "Fill this only if you selected Other.",
    showWhen: (values) => values.storageLocation === "Other",
  },
  {
    key: "printedDate",
    label: "Printed date",
    type: "readonly",
    required: true,
    helperText: "Auto-filled with today's date.",
    readOnly: true,
  },
  {
    key: "checkByDate",
    label: "Check-by date",
    type: "date",
    required: true,
    helperText: "Set the date when this item should be checked again.",
  },
  {
    key: "organizationLogo",
    label: "Organization logo",
    type: "select",
    required: true,
    options: ORGANIZATION_LOGO_OPTIONS.map((x) => x.value),
    helperText: "Default logo is preselected.",
  },
];

const commonDbOnlyFields: FieldSchema[] = [
  {
    key: "printedBy",
    label: "Printed by",
    type: "text",
    required: true,
    placeholder: "Who printed this label?",
    helperText: "Saved in the database only. Not printed on the tag.",
  },
  {
    key: "secondResponsiblePerson",
    label: "Second responsible person",
    type: "text",
    required: true,
    placeholder: "Example: Lab engineer",
    helperText: "Saved in the database only. Not printed on the tag.",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    required: true,
    placeholder:
      "Write a short description of contents, purpose, serial numbers, origin, or project details.",
    helperText:
      "Required. Even a short description is better than leaving it blank.",
  },
  {
    key: "epc",
    label: "EPC",
    type: "text",
    required: true,
    placeholder: "Read from RFID tag",
    helperText: "Saved in the database only. Not printed on the tag.",
  },
  {
    key: "barcodeNumber",
    label: "Barcode number",
    type: "text",
    required: true,
    placeholder: "Generated barcode number",
    helperText: "Saved in the database and used for barcode preview.",
  },
  {
    key: "lastUpdated",
    label: "Last updated",
    type: "readonly",
    required: true,
    helperText: "Auto-filled when the record is saved or updated.",
    readOnly: true,
  },
];

export const labelSchemas: Record<LabelMode, LabelSchema> = {
  general: {
    mode: "general",
    modeLabel: "General organizing",
    description:
      "Use this when printing labels for storage, organization, loose items, or non-project boxes.",
    fields: [
      {
        ...commonPrintedFields[0],
        label: "Name",
        placeholder: "Example: Erikoisteipit",
        helperText:
          "Describe what is in the box or item as clearly as possible.",
      },
      commonPrintedFields[1],
      commonPrintedFields[2],
      commonPrintedFields[3],
      commonPrintedFields[4],
      commonPrintedFields[5],
      commonPrintedFields[6],
      {
        ...commonDbOnlyFields[0],
        label: "Printed by",
      },
      {
        ...commonDbOnlyFields[1],
        label: "Second responsible person",
        placeholder: "Example: Backup responsible person",
      },
      commonDbOnlyFields[2],
      commonDbOnlyFields[3],
      commonDbOnlyFields[4],
      commonDbOnlyFields[5],
    ],
    printedFieldOrder: [
      "name",
      "responsiblePerson",
      "storageLocation",
      "printedDate",
      "checkByDate",
    ],
    dbOnlyFields: [
      "printedBy",
      "secondResponsiblePerson",
      "description",
      "epc",
      "barcodeNumber",
      "lastUpdated",
      "storageLocationOther",
    ],
  },

  project: {
    mode: "project",
    modeLabel: "Project",
    description:
      "Use this when printing labels for project-related boxes, kits, or grouped project materials.",
    fields: [
      {
        ...commonPrintedFields[0],
        label: "Project name",
        placeholder: "Example: RoboArm V2",
        helperText:
          "Use the project name that the team will immediately recognize.",
      },
      {
        ...commonPrintedFields[1],
        label: "Project responsible person",
        placeholder: "Who is doing the project?",
        helperText: "Main person responsible for the project items.",
      },
      commonPrintedFields[2],
      commonPrintedFields[3],
      commonPrintedFields[4],
      commonPrintedFields[5],
      commonPrintedFields[6],
      {
        ...commonDbOnlyFields[0],
        label: "Printed by",
      },
      {
        ...commonDbOnlyFields[1],
        label: "Lab engineer / second responsible person",
        placeholder: "Example: Lab engineer name",
      },
      commonDbOnlyFields[2],
      commonDbOnlyFields[3],
      commonDbOnlyFields[4],
      commonDbOnlyFields[5],
    ],
    printedFieldOrder: [
      "name",
      "responsiblePerson",
      "storageLocation",
      "printedDate",
      "checkByDate",
    ],
    dbOnlyFields: [
      "printedBy",
      "secondResponsiblePerson",
      "description",
      "epc",
      "barcodeNumber",
      "lastUpdated",
      "storageLocationOther",
    ],
  },
};

export const PRINTED_TAG_FIELD_LABELS: Record<
  | "name"
  | "responsiblePerson"
  | "storageLocation"
  | "printedDate"
  | "checkByDate",
  string
> = {
  name: "Name",
  responsiblePerson: "Person",
  storageLocation: "Storage",
  printedDate: "Date printed",
  checkByDate: "Check-by",
};

export function getSchema(mode: LabelMode): LabelSchema {
  return labelSchemas[mode];
}

export function getVisibleFields(values: LabelFormValues): FieldSchema[] {
  return getSchema(values.mode).fields.filter((field) =>
    field.showWhen ? field.showWhen(values) : true,
  );
}

export function resolveStorageLocation(values: LabelFormValues): string {
  if (values.storageLocation === "Other") {
    return values.storageLocationOther.trim();
  }
  return values.storageLocation.trim();
}

export function getSelectedLogoLabel(logo: OrganizationLogoId): string {
  return (
    ORGANIZATION_LOGO_OPTIONS.find((option) => option.value === logo)?.label ??
    "RoboAI"
  );
}

export function validateForm(values: LabelFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  const fields = getVisibleFields(values);

  for (const field of fields) {
    const rawValue = values[field.key];
    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    if (field.required && !value) {
      errors[field.key] = `${field.label} is required.`;
    }
  }

  if (values.description.trim().length < 3) {
    errors.description = "Description must be at least 3 characters.";
  }

  if (values.storageLocation === "Other" && !values.storageLocationOther.trim()) {
    errors.storageLocationOther = "Please enter the manual storage location.";
  }

  return errors;
}

export function buildPrintedTagData(values: LabelFormValues) {
  return {
    logo: values.organizationLogo,
    name: values.name,
    responsiblePerson: values.responsiblePerson,
    storageLocation: resolveStorageLocation(values),
    printedDate: values.printedDate,
    checkByDate: values.checkByDate,
    barcodeNumber: values.barcodeNumber,
  };
}

export function buildDatabasePayload(values: LabelFormValues) {
  return {
    mode: values.mode,

    // printed fields
    name: values.name,
    responsiblePerson: values.responsiblePerson,
    storageLocation: resolveStorageLocation(values),
    printedDate: values.printedDate,
    checkByDate: values.checkByDate,
    organizationLogo: values.organizationLogo,

    // db-only fields
    printedBy: values.printedBy,
    secondResponsiblePerson: values.secondResponsiblePerson,
    description: values.description,
    epc: values.epc,
    barcodeNumber: values.barcodeNumber,
    lastUpdated: values.lastUpdated || new Date().toISOString(),
  };
}

function getTodayISODate(): string {
  return new Date().toISOString().split("T")[0];
}