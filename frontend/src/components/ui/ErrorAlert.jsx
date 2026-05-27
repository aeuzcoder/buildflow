export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p>{message || "Something went wrong. Please try again."}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 font-medium text-red-800 underline hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
