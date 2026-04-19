import { Link } from "react-router";

export default function LandingHeader() {
  return (
    <header className="border-b border-neutral-400/10 bg-secondary/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-logo text-xl font-bold text-white hover:text-neutral-100"
        >
          <img
            src="/icons/kapwahelp_v1.svg"
            alt=""
            aria-hidden="true"
            className="h-8 w-8"
          />
          Kapwa Help
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <a href="#story" className="hidden text-neutral-100 hover:text-neutral-50 sm:inline">
            The Story
          </a>
          <a href="#get-involved" className="hidden text-neutral-100 hover:text-neutral-50 sm:inline">
            Get Involved
          </a>
          <Link
            to="/demo/en"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white shadow-[0_0_12px_rgba(14,154,167,0.3)] hover:bg-primary/80 transition-all"
          >
            View Demo →
          </Link>
        </nav>
      </div>
    </header>
  );
}
