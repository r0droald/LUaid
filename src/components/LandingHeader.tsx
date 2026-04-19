import { Link } from "react-router";

export default function LandingHeader() {
  return (
    <header className="bg-landing-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between border-b-2 border-landing-ink px-6 pt-3 pb-6 md:px-10">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-logo text-2xl tracking-tight text-landing-ink hover:opacity-90"
        >
          <img
            src="/icons/kapwahelp_v1.svg"
            alt=""
            aria-hidden="true"
            className="h-9 w-9"
          />
          Kapwa Help
        </Link>

        <nav className="flex items-center gap-6 text-[13px] font-medium text-landing-ink">
          <a href="#story" className="hidden hover:opacity-70 sm:inline">
            The Story
          </a>
          <a href="#what-it-does" className="hidden hover:opacity-70 sm:inline">
            What it does
          </a>
          <a href="#get-involved" className="hidden hover:opacity-70 sm:inline">
            Get Involved
          </a>
          <Link
            to="/demo/en"
            className="rounded-md bg-landing-ink px-4 py-2 font-semibold text-landing-cream hover:opacity-90"
          >
            View Demo →
          </Link>
        </nav>
      </div>
    </header>
  );
}
