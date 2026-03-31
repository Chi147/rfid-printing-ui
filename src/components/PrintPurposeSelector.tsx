import { FolderKanban, Package } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { LabelMode } from "@/utils/schema";

type Props = {
  value: LabelMode;
  onChange: (value: LabelMode) => void;
};

export default function PrintPurposeSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Printing purpose</h3>

      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as LabelMode)}
        className="grid gap-3 md:grid-cols-2"
      >
        <label
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            value === "general"
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <RadioGroupItem value="general" id="general" className="mt-1" />
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <Package className="h-4 w-4 text-blue-700" />
                General organizing
              </div>
              <p className="mt-1 text-sm text-slate-600">
                For shelves, loose items, boxes, and general storage.
              </p>
            </div>
          </div>
        </label>

        <label
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            value === "project"
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <RadioGroupItem value="project" id="project" className="mt-1" />
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <FolderKanban className="h-4 w-4 text-blue-700" />
                Project
              </div>
              <p className="mt-1 text-sm text-slate-600">
                For project boxes, grouped materials, and kits.
              </p>
            </div>
          </div>
        </label>
      </RadioGroup>
    </div>
  );
}