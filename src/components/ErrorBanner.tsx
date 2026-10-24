import { AlertTriangle, X } from "lucide-react";

type Props = {
  message: string;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="rounded p-1 text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
