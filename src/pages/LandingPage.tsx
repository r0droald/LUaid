import { Link } from "react-router";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-base px-6 py-12 text-neutral-100">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-logo text-4xl font-bold text-neutral-50">Kapwa Help</h1>
        <p className="mt-4 text-lg text-neutral-100/90">
          Citizen-led disaster relief for La Union, Philippines.
        </p>
        <Link
          to="/demo/en"
          className="mt-8 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/80 transition-all"
        >
          View Live Demo →
        </Link>
      </div>
    </div>
  );
}
