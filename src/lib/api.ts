const API_BASE = "http://10.80.26.210:5000";

export type RfidReadResponse = Record<
  string,
  { latest_timestamp: string }
>;

export type SaveJobPayload = {
  epc: string;
  barcode?: string;
  itemName?: string;
  projectName?: string;
  responsiblePerson?: string;
  organization?: string;
  storageLocation?: string;
  checkbyDate?: string;
  itemImageFilename?: string | null;
};

export async function fetchLatestRfid(): Promise<RfidReadResponse> {
  const res = await fetch(`${API_BASE}/rfid/read/`);

  if (!res.ok) {
    throw new Error("Failed to read RFID data");
  }

  return (await res.json()) as RfidReadResponse;
}

export async function saveLabel(payload: SaveJobPayload) {
  const formData = new FormData();

  formData.append("epc", payload.epc);
  formData.append("barcode", payload.barcode || "N/A");
  formData.append("item_name", payload.itemName || "");
  formData.append("project_name", payload.projectName || "");
  formData.append("responsible", payload.responsiblePerson || "");
  formData.append("organization", payload.organization || "");
  formData.append("storage_location", payload.storageLocation || "");
  formData.append("checkby_date", payload.checkbyDate || "");

  if (payload.itemImageFilename) {
    formData.append("image_filename", payload.itemImageFilename);
  }

  const res = await fetch(`${API_BASE}/rfid/save/`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || data.status !== "success") {
    throw new Error(data.message || "Save failed");
  }

  return data;
}