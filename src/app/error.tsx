"use client";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="text-4xl mb-4">:(</div>
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        An unexpected error occurred. Your assessment data is safe — try again.
      </p>
      <button
        onClick={reset}
        className="bg-purple-600 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
