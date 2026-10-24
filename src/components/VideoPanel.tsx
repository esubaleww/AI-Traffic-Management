import { Card } from "./Card";
import { UploadBox } from "./UploadBox";
import { Film } from "lucide-react";

type Props = {
  videoUrl: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  onFile: (file: File) => void;
};

export function VideoPanel({ videoUrl, uploading, progress, error, onFile }: Props) {
  return (
    <Card title="Traffic Video" icon={<Film className="h-4 w-4 text-sky-400" />} className="h-full">
      <div className="space-y-4">
        <UploadBox onFile={onFile} uploading={uploading} progress={progress} error={error} />
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-black">
          {videoUrl ? (
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
              <Film className="h-10 w-10" />
              <p className="text-sm">Upload a traffic clip to begin.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
