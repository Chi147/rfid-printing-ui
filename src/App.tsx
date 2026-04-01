import { useEffect, useState, useRef } from "react";
import { fetchLatestRfid, saveLabel} from "./lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { printLabelFromHtml } from "./services/printService";

import PrintPurposeSelector from "./components/PrintPurposeSelector";
import SchemaForm from "./components/SchemaForm";
import TagPreview from "./components/TagPreview";
import TagInfoPanel from "./components/TagInfoPanel";

import {
  createInitialValues,
  resolveStorageLocation,
  type LabelFormValues,
  validateForm,
} from "./utils/schema";
import {
  buildCurrentJobFromValues,
  isPlaceholderEpc,
  type CurrentJob,
} from "./services/jobService";

type UiState =
  | "ready"
  | "printing"
  | "waiting_scan"
  | "saving"
  | "saved"
  | "timeout"
  | "error";


type WindowWithInitialSerialNumber = Window & {
  initialSerialNumber?: number;
};

function getInitialSerialNumber() {
  if (typeof window === "undefined") return 1000;

  const value = Number(
    (window as WindowWithInitialSerialNumber).initialSerialNumber ?? 1000
  );

  return Number.isFinite(value) && value > 0 ? value : 1000;
}

const UI_STATE_TEXT: Record<UiState, string> = {
  ready: "Ready to print.",
  printing: "Printing…",
  waiting_scan: "Printed. Scan the tag at the antenna (waiting for EPC)…",
  saving: "Saving to database…",
  saved: "Saved to database ✅",
  timeout: "Still waiting for EPC. Scan the tag again, or cancel the job.",
  error: "Something went wrong.",
};

export default function App() {
  const [serialNumber, setSerialNumber] = useState<number>(() =>
    getInitialSerialNumber()
  );

  const [values, setValues] = useState<LabelFormValues>(() => ({
    ...createInitialValues(),
    barcodeNumber: String(getInitialSerialNumber()),
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uiState, setUiState] = useState<UiState>("ready");
  const [currentJob, setCurrentJob] = useState<CurrentJob | null>(null);

  const previewRef = useRef<HTMLDivElement | null>(null);

  //TIMEOUT 60s
  const SCAN_TIMEOUT_MS = 60000;
  const scanTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const data = await fetchLatestRfid();

        const entries = Object.entries(data || {}).filter(
          ([, value]) => value && value.latest_timestamp
        );

        entries.sort(
          (a, b) =>
            new Date(a[1].latest_timestamp).getTime() -
            new Date(b[1].latest_timestamp).getTime()
        );

        const latest = entries.at(-1);

        if (!mounted) return;

        if (!latest) {
          setValues((prev) => ({
            ...prev,
            epc: "No tag detected",
            lastUpdated: "-",
          }));
          return;
        }

        const [latestEpc, latestInfo] = latest;

        setValues((prev) => ({
          ...prev,
          epc: latestEpc,
          lastUpdated: latestInfo.latest_timestamp,
        }));
      } catch (error) {
        if (!mounted) return;

        setValues((prev) => ({
          ...prev,
          epc: "Connection error",
          lastUpdated: "-",
        }));
      }
    };

    poll();
    const intervalId = window.setInterval(poll, 1000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

    useEffect(() => {
      if (!currentJob) return;

      const latestEpc = values.epc.trim();
      const latestTimestamp = values.lastUpdated.trim();

      if (!latestEpc || !latestTimestamp) return;
      if (isPlaceholderEpc(latestEpc)) return;
      if (currentJob._savingDone) return;

      const scanTime = new Date(latestTimestamp).getTime();
      const printTime = new Date(currentJob.printedAtISO).getTime();

      if (Number.isNaN(scanTime) || Number.isNaN(printTime)) return;

      const isAfterPrint = scanTime > printTime;
      const isNewEpc = latestEpc !== (currentJob.prePrintEpc ?? "");

      if (!isAfterPrint || !isNewEpc) return;

      const jobToSave: CurrentJob = {
        ...currentJob,
        epc: latestEpc,
        _savingDone: true,
      };

      setCurrentJob(jobToSave);
      clearScanTimeout();
      setUiState("saving");

      void (async () => {
        try {
          await saveLabel({
            epc: latestEpc,
            barcode: jobToSave.barcode,
            itemName: jobToSave.mode === "general" ? jobToSave.name : "",
            projectName: jobToSave.mode === "project" ? jobToSave.name : "",
            responsiblePerson: jobToSave.responsiblePerson,
            organization: jobToSave.organizationLogo,
            storageLocation: jobToSave.storageLocation,
            checkbyDate: jobToSave.checkByDate,
            itemImageFilename: jobToSave.itemImageFilename ?? null,
          });

          setUiState("saved");
          setCurrentJob(null);
          advanceToNextBarcode();

          window.setTimeout(() => {
            setUiState("ready");
          }, 2500);
        } catch (error) {
          console.error("Auto-save failed:", error);

          setCurrentJob((prev) =>
            prev ? { ...prev, _savingDone: false } : prev
          );
          setUiState("error");
        }
      })();
    }, [currentJob, values.epc, values.lastUpdated]);
  
    useEffect(() => {
      return () => {
        clearScanTimeout();
      };
    }, []);

  const advanceToNextBarcode = () => {
    const next = serialNumber + 1;

    setSerialNumber(next);
    setValues((prev) => ({
      ...prev,
      barcodeNumber: String(next),
    }));
  };

  const updateField = (key: keyof LabelFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleModeChange = (mode: "general" | "project") => {
    setValues((prev) => ({ ...prev, mode }));
  };

  const handleValidate = () => {
    setErrors(validateForm(values));
  };

  const handleReset = () => {
    clearScanTimeout();

    setValues({
      ...createInitialValues(),
      barcodeNumber: String(serialNumber),
      epc: values.epc,
      lastUpdated: values.lastUpdated,
    });
    setErrors({});
    setUiState("ready");
    setCurrentJob(null);
  };

  const handleManualSave = async () => {
    const validationErrors = validateForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setUiState("error");
      return;
    }

    const epc = (currentJob?.epc ?? values.epc ?? "").trim();

    if (isPlaceholderEpc(epc)) {
      setUiState("error");
      return;
    }

    clearScanTimeout();
    setUiState("saving");

    try {
      await saveLabel({
        epc,
        barcode: currentJob?.barcode ?? values.barcodeNumber ?? "N/A",
        itemName: values.mode === "general" ? values.name : "",
        projectName: values.mode === "project" ? values.name : "",
        responsiblePerson: values.responsiblePerson,
        organization: values.organizationLogo,
        storageLocation: resolveStorageLocation(values),
        checkbyDate: values.checkByDate,
        itemImageFilename: currentJob?.itemImageFilename ?? null,
      });

      setUiState("saved");
      setCurrentJob(null);
      advanceToNextBarcode();

      window.setTimeout(() => {
        setUiState("ready");
      }, 2500);
    } catch (error) {
      console.error("Manual save failed:", error);
      setUiState("error");
    }
  };
  
  const handleStartPrintJob = () => {
    const validationErrors = validateForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setUiState("error");
      return;
    }

    if (currentJob) {
      setUiState("waiting_scan");
      return;
    }

    if (!previewRef.current) {
      setUiState("error");
      return;
    }

    const job = buildCurrentJobFromValues(values, serialNumber);
    setUiState("printing");

    const didPrintOpen = printLabelFromHtml(previewRef.current.innerHTML);

    if (!didPrintOpen) {
      setUiState("error");
      return;
    }

    setCurrentJob({
      ...job,
      printedAtISO: new Date().toISOString(),
    });
    setUiState("waiting_scan");
    startScanTimeout();
  };

  const handleCancelJob = () => {
    clearScanTimeout;
    setCurrentJob(null);
    setUiState("ready");
  };

  const clearScanTimeout = () => {
  if (scanTimeoutRef.current !== null) {
    window.clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = null;
  }
};

  const startScanTimeout = () => {
    clearScanTimeout();

    scanTimeoutRef.current = window.setTimeout(() => {
      setCurrentJob((prev) => {
        if (!prev || prev._savingDone) return prev;
        setUiState("timeout");
        return prev;
      });
    }, SCAN_TIMEOUT_MS);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 px-6 py-6">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
          <Card className="rounded-3xl border-blue-200 bg-white/90 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-2xl">
                Tag information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
                {UI_STATE_TEXT[uiState]}
              </div>

              <PrintPurposeSelector
                value={values.mode}
                onChange={handleModeChange}
              />

              <SchemaForm
                values={values}
                errors={errors}
                onChange={updateField}
              />

              <div className="flex gap-3 pt-2">
                <Button onClick={handleValidate}>Validate</Button>

                <Button
                  variant="outline"
                  onClick={handleStartPrintJob}
                  disabled={uiState === "printing" || uiState === "saving" || uiState === "waiting_scan"}
                >
                  Print label
                </Button>

                <Button
                  onClick={handleManualSave}
                  disabled={
                    uiState === "printing" ||
                    uiState === "saving" ||
                    uiState === "saved"
                  }
                >
                  Save to database
                </Button>

                {currentJob && (
                  <Button
                    variant="outline"
                    onClick={handleCancelJob}
                    disabled={uiState === "saving"}
                  >
                    Cancel job
                  </Button>
                )}

                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 xl:sticky xl:top-6">
            <div ref={previewRef}>
              <TagPreview values={values} />
            </div>
            <TagInfoPanel values={values} />
          </div>
        </div>
      </div>
    </div>
  );
}