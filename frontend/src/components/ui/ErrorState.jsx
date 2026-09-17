import { AlertTriangle } from "lucide-react";
import Button from "./Button";

function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/15 bg-red-500/5 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
        <AlertTriangle size={22} />
      </div>
      <p className="max-w-sm text-sm text-red-200">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
