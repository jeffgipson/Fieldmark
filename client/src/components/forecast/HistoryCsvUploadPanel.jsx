import { useRef, useState } from "react";
import * as historyImportsApi from "../../api/historyImports";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { friendlyError } from "../../utils/errors";

export default function HistoryCsvUploadPanel({ farmId, onImported }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleUpload(preview = false) {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const data = await historyImportsApi.importFarmHistoryCsv(farmId, file, { preview });
      setResult(data);
      if (!preview && (data.seasons_applied > 0 || data.costs_applied > 0)) {
        onImported?.();
      }
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="border border-dashed border-fm-teal/50">
      <p className="fm-eyebrow">Past seasons on this farm</p>
      <h3 className="font-display mt-1 text-lg font-semibold">Upload history CSV</h3>
      <p className="mt-1 text-sm text-fm-gray-medium">
        Drop in a spreadsheet from your accountant, FSA, or elevator — Dale reads it and files season actuals and
        per-field costs. No column mapping.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="mt-4 block w-full text-sm text-fm-charcoal file:mr-4 file:rounded-lg file:border-0 file:bg-fm-teal file:px-4 file:py-2 file:font-bold file:text-white"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" disabled={uploading} onClick={() => handleUpload(false)}>
          {uploading ? "Importing…" : "Import with Dale"}
        </Button>
        <Button type="button" variant="secondary" disabled={uploading} onClick={() => handleUpload(true)}>
          Preview only
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-fm-alert">{error}</p>}

      {result && (
        <div className="mt-4 rounded-lg border border-fm-gray-light bg-fm-gray-light/30 p-3 text-sm">
          <p className="font-semibold text-fm-charcoal">{result.summary}</p>
          {result.status === "applied" && (
            <p className="mt-1 text-fm-teal">
              Applied {result.seasons_applied} season(s), {result.costs_applied} cost line(s).
            </p>
          )}
          {result.status === "parsed" && (
            <p className="mt-1 text-fm-gray-medium">Preview — nothing saved yet. Run Import with Dale to apply.</p>
          )}
          {result.warnings?.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-fm-gray-medium">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
