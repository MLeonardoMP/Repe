export default function Loading() {
  return (
    <div className="flex-1 p-4 md:p-6 min-h-screen">
      <div className="max-w-md mx-auto space-y-8 pt-8" aria-busy>
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="h-12 skeleton rounded-lg w-40 mx-auto" />
            <div className="h-4 skeleton rounded w-48 mx-auto" />
          </div>
          <div className="space-y-3">
            <div className="h-14 skeleton rounded-lg" />
            <div className="h-12 skeleton rounded-lg" />
          </div>
          <div className="h-48 skeleton rounded-xl border border-neutral-800" />
        </div>
      </div>
    </div>
  );
}
