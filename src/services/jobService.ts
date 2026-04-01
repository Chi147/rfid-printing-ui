import { resolveStorageLocation, type LabelFormValues } from "../utils/schema";

export type CurrentJob = {
  barcode: string;
  prePrintEpc: string | null;
  printedAtISO: string;
  epc: string | null;
  _savingDone: boolean;

  mode: LabelFormValues["mode"];
  name: string;
  responsiblePerson: string;
  storageLocation: string;
  printedDate: string;
  checkByDate: string;
  organizationLogo: LabelFormValues["organizationLogo"];

  printedBy: string;
  secondResponsiblePerson: string;
  description: string;

  itemImageFilename?: string | null;
};

export function isPlaceholderEpc(epc: string) {
  const value = epc.trim();

  if (!value) return true;

  return [
    "No tag detected",
    "Connection error",
    "Ei tunnistetta",
    "Yhteysvirhe",
    "UNKNOWN_EPC",
    "-",
  ].includes(value);
}

export function buildCurrentJobFromValues(
  values: LabelFormValues,
  serialNumber: number
): CurrentJob {
  return {
    barcode: values.barcodeNumber || String(serialNumber),
    prePrintEpc: values.epc?.trim() || null,
    printedAtISO: new Date().toISOString(),
    epc: null,
    _savingDone: false,

    mode: values.mode,
    name: values.name,
    responsiblePerson: values.responsiblePerson,
    storageLocation: resolveStorageLocation(values),
    printedDate: values.printedDate,
    checkByDate: values.checkByDate,
    organizationLogo: values.organizationLogo,

    printedBy: values.printedBy,
    secondResponsiblePerson: values.secondResponsiblePerson,
    description: values.description,

    itemImageFilename: null,
  };
}