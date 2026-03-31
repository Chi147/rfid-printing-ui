import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getVisibleFields, type LabelFormValues } from "../utils/schema";

type Props = {
  values: LabelFormValues;
  errors?: Record<string, string>;
  onChange: (key: keyof LabelFormValues, value: string) => void;
};

const DB_ONLY_KEYS: Array<keyof LabelFormValues> = [
  "printedBy",
  "secondResponsiblePerson",
  "description",
  "epc",
  "barcodeNumber",
  "lastUpdated",
];

export default function SchemaForm({
  values,
  errors = {},
  onChange,
}: Props) {
  const fields = getVisibleFields(values);

  const { mainFields, dbFields } = useMemo(() => {
    return {
      mainFields: fields.filter((field) => !DB_ONLY_KEYS.includes(field.key)),
      dbFields: fields.filter((field) => DB_ONLY_KEYS.includes(field.key)),
    };
  }, [fields]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Printed tag details"
        subtitle="These fields appear on the physical printed label."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {mainFields.map((field) => (
          <FieldRenderer
            key={String(field.key)}
            field={field}
            values={values}
            errors={errors}
            onChange={onChange}
          />
        ))}
      </div>

      <details className="rounded-2xl border border-slate-200 bg-slate-50/80 open:bg-white">
        <summary className="cursor-pointer list-none rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800">
          Database details
          <span className="ml-2 text-slate-500 font-normal">
            Not printed on the tag
          </span>
        </summary>

        <div className="border-t border-slate-200 px-4 py-4">
          <div className="mb-4">
            <SectionTitle
              title="Database-only information"
              subtitle="Saved in the system for traceability and RFID tracking."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {dbFields.map((field) => (
              <FieldRenderer
                key={String(field.key)}
                field={field}
                values={values}
                errors={errors}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function FieldRenderer({
  field,
  values,
  errors,
  onChange,
}: {
  field: ReturnType<typeof getVisibleFields>[number];
  values: LabelFormValues;
  errors: Record<string, string>;
  onChange: (key: keyof LabelFormValues, value: string) => void;
}) {
  const value = String(values[field.key] ?? "");
  const error = errors[field.key as string];
  const isWide = field.type === "textarea";

  return (
    <div className={isWide ? "md:col-span-2" : ""}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Label className="mb-2 block text-sm font-semibold text-slate-800">
          {field.label}
        </Label>

        {field.type === "textarea" ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="min-h-[110px] rounded-xl border-slate-300 bg-white text-sm"
          />
        ) : field.type === "select" ? (
          <Select
            value={value || undefined}
            onValueChange={(v) => onChange(field.key, v ?? "")}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-slate-300 bg-white text-sm">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={field.type === "date" ? "date" : "text"}
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
            className="h-11 rounded-xl border-slate-300 bg-white text-sm"
          />
        )}

        {field.helperText && (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {field.helperText}
          </p>
        )}

        {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}