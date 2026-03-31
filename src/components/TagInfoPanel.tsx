import type { LabelFormValues } from "@/utils/schema";

type Props = {
  values: LabelFormValues;
};

export default function TagInfoPanel({ values }: Props) {
  return (
    <div className="rounded-3xl border border-blue-200 bg-white/90 p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-900">RFID Tag Info</h3>

      <div className="mt-4 space-y-4 text-sm">
        <InfoRow label="EPC" value={values.epc || "-"} />
        <InfoRow label="Barcode number" value={values.barcodeNumber || "-"} />
        <InfoRow label="Printed by" value={values.printedBy || "-"} />
        <InfoRow
          label="Second responsible person"
          value={values.secondResponsiblePerson || "-"}
        />
        <InfoRow label="Last updated" value={values.lastUpdated || "-"} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 break-all text-slate-900">{value}</div>
    </div>
  );
}