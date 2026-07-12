import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen bg-paper bg-dot-grid flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-line rounded-md p-8 relative text-center">
        {/* Punched hole */}
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 w-[6px] h-[6px] rounded-full bg-paper border border-line"
        />

        <span className="font-mono text-3xl font-semibold text-accent block mb-2">404</span>
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Page Not Found</h1>
        <p className="font-sans text-sm text-ink/50 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block py-2 px-4 text-sm font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;