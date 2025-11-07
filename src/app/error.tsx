'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex-1 p-6 min-h-screen">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-neutral-400 break-words">{error.message}</p>
        <button
          onClick={() => reset()}
          className="button-press h-12 px-6 rounded-md bg-white text-black font-semibold hover:bg-neutral-100"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
