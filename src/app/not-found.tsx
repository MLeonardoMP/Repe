export default function NotFound() {
  return (
    <div className="flex-1 p-6 min-h-screen">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800">
          <span className="text-xl">404</span>
        </div>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-neutral-400 text-sm max-w-sm mx-auto">
          The content you are looking for doesn’t exist or was moved.
        </p>
        <a
          href="/"
          className="button-press inline-flex items-center justify-center h-12 px-6 rounded-md bg-white text-black font-semibold hover:bg-neutral-100"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
