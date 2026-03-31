import { Image as ImageIcon } from "lucide-react";
import roboaiLogo from "../assets/RoboAI_logo.png";
import {
  buildPrintedTagData,
  getSelectedLogoLabel,
  type LabelFormValues,
} from "../utils/schema";

type Props = {
  values: LabelFormValues;
};

const logoMap: Record<string, string> = {
  RoboAI: roboaiLogo,
};

export default function TagPreview({ values }: Props) {
  const tag = buildPrintedTagData(values);

  return (
    <div className="rounded-3xl border border-blue-200 bg-white/90 p-4 shadow-xl">
      <div className="w-full">
        {/* Outer dark frame */}
        <div className="rounded-[28px] bg-slate-900 p-[8px] shadow-lg">
          {/* Actual white label */}
          <div className="overflow-hidden rounded-[22px] bg-white">
            <div className="aspect-[3.23/1.5] w-full">
              <div className="flex h-full flex-col">
                {/* Top section */}
                <div className="flex flex-1 border-b border-slate-300">
                  {/* Left text area */}
                  <div className="flex-1 px-5 py-4">
                    <div className="flex h-full flex-col justify-between">
                      <PreviewLine label="Name" value={tag.name} />
                      <PreviewLine label="Person" value={tag.responsiblePerson} />
                      <PreviewLine label="Storage" value={tag.storageLocation} />

                      <div className="grid grid-cols-2 gap-4">
                        <PreviewLine label="Date printed" value={tag.printedDate} />
                        <PreviewLine label="Check-by" value={tag.checkByDate} />
                      </div>
                    </div>
                  </div>

                  {/* Right logo area */}
                  <div className="w-[165px] border-l border-slate-300 px-4 py-4">
                    <div className="flex h-full items-center justify-center">
                      <div className="w-full rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
                        <img
                            src={logoMap[values.organizationLogo]}
                            alt={getSelectedLogoLabel(values.organizationLogo)}
                            className="mx-auto h-16 w-auto object-contain"
                          />
                        <div className="mt-3 text-base font-semibold text-slate-700">
                          {getSelectedLogoLabel(values.organizationLogo)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom barcode footer */}
                <div className="px-5 py-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Barcode
                  </div>

                  <div className="grid grid-cols-[1fr_auto] items-end gap-4">
                    <div className="h-12 w-full rounded bg-[repeating-linear-gradient(90deg,#111_0px,#111_2px,#fff_2px,#fff_4px)]" />
                    <div className="whitespace-nowrap text-xs text-slate-600">
                      {tag.barcodeNumber || "Generated barcode"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-sm text-slate-500">
          Live printed tag preview
        </p>
      </div>
    </div>
  );
}

function PreviewLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
        {label}
      </div>
      <div className="mt-1 min-h-[24px] border-b border-slate-300 pb-1 text-sm text-slate-900">
        {value || "-"}
      </div>
    </div>
  );
}