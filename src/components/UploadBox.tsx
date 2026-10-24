import { useRef, useState, type DragEvent } from "react";
import { CloudUpload, Film, Loader2, UploadCloud } from "lucide-react";

type Props = {
  onFile: (file: File) => void;
  uploading: boolean;
  progress: number;
  error: string | null;
};

export function UploadBox({ onFile, uploading, progress, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a traffic video"
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging
            ? "border-sky-400 bg-sky-500/10"
            : "border-slate-700 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-sky-400">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <CloudUpload className="h-6 w-6" />}
        </div>
        <p className="text-sm font-medium text-slate-200">
          {uploading ? "Uploading…" : "Drop a traffic clip here or click to browse"}
        </p>
        <p className="text-xs text-slate-500">MP4 / MOV / WebM — sent to the backend for analysis</p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-3" aria-live="polite">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-sky-300">{progress}%</span>
        </div>
      )}

      {!uploading && error && <p className="text-sm text-red-300">{error}</p>}

      {!uploading && !error && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Film className="h-3.5 w-3.5" />
          The video plays here once uploaded; analysis runs server-side.
        </p>
      )}
      {/* aria-hidden helper icon for screen readers is the title above */}
      <span className="sr-only">
        <UploadCloud />
      </span>
    </div>
  );
}
