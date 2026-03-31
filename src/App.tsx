import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import PrintPurposeSelector from "./components/PrintPurposeSelector";
import SchemaForm from "./components/SchemaForm";
import TagPreview from "./components/TagPreview";
import TagInfoPanel from "./components/TagInfoPanel";

import {
  createInitialValues,
  type LabelFormValues,
  validateForm,
} from "./utils/schema";

export default function App() {
  const [values, setValues] = useState<LabelFormValues>(createInitialValues());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: keyof LabelFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleModeChange = (mode: "general" | "project") => {
    setValues((prev) => ({ ...prev, mode }));
  };

  const handleValidate = () => {
    setErrors(validateForm(values));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 px-6 py-6">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px] items-start">
          <Card className="rounded-3xl border-blue-200 bg-white/90 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-2xl">Tag information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
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
                  onClick={() => {
                    setValues(createInitialValues());
                    setErrors({});
                  }}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 xl:sticky xl:top-6">
            <TagPreview values={values} />
            <TagInfoPanel values={values} />
          </div>
        </div>
      </div>
    </div>
  );
}