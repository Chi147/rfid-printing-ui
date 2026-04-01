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
        <OptionCard
          id="general"
          value="general"
          selected={value === "general"}
          title="General organizing"
          description="For shelves, loose items, boxes, and general storage."
          icon={<Package className="h-7 w-6 text-blue-700" />}
          onSelect={onChange}
        />

        <OptionCard
          id="project"
          value="project"
          selected={value === "project"}
          title="Project"
          description="For project boxes, grouped materials, and kits."
          icon={<FolderKanban className="h-7 w-6 text-blue-700" />}
          onSelect={onChange}
        />
      </RadioGroup>
    </div>
  );
}

type OptionCardProps = {
  id: string;
  value: LabelMode;
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onSelect: (value: LabelMode) => void;
};

function OptionCard({
  value,
  selected,
  title,
  description,
  icon,
  onSelect,
}: OptionCardProps) {
  return (
    <div
      onClick={() => onSelect(value)}
      className={`cursor-pointer rounded-2xl border p-4 transition ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {icon}
        </div>

        <div className="flex flex-col justify-center">
          <div className="font-semibold text-slate-900">{title}</div>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}