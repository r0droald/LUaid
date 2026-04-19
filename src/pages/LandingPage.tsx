import { Link } from "react-router";
import LandingHeader from "../components/LandingHeader";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-base text-neutral-100">
      <LandingHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <h1 className="font-logo text-4xl font-bold leading-tight text-neutral-50 md:text-5xl">
              Citizen-led disaster relief for La Union.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-neutral-100/90 md:text-xl">
              An open-source, offline-first coordination tool — born on the ground during Typhoon Emong, built by the people who were there.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/demo/en"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_12px_rgba(14,154,167,0.3)] hover:bg-primary/80 transition-all"
              >
                View Live Demo →
              </Link>
              <a
                href="#get-involved"
                className="rounded-lg border border-neutral-400/30 px-5 py-2.5 text-sm font-medium text-neutral-100 hover:bg-neutral-400/10 transition-all"
              >
                Get Involved
              </a>
            </div>
          </div>
          <Link to="/demo/en" className="block">
            <img
              src="/landing/dashboard.png"
              alt="Kapwa Help dashboard showing relief coordination map and donation tracking"
              className="w-full rounded-2xl border border-neutral-400/20 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
              loading="eager"
            />
          </Link>
        </div>
      </section>

      {/* The Story */}
      <section id="story" className="border-t border-neutral-400/10 bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="text-xs uppercase tracking-widest text-neutral-400">The Story</p>
          <h2 className="mt-3 text-3xl font-bold text-neutral-50">Born during Typhoon Emong.</h2>
          <div className="mt-6 space-y-5 leading-relaxed text-neutral-100/90">
            <p>
              When Typhoon Emong hit La Union in 2025, volunteers self-organized across municipalities to distribute meals, relief goods, drinking water, and medical supplies. Coordination happened over group chats. Tracking happened in spreadsheets — when it happened at all.
            </p>
            <p>
              Kapwa Help was born out of that experience: a transparency and coordination tool built by the people who were on the ground, designed so the next disaster response starts where this one left off.
            </p>
            <p>
              We publish this software openly in the hope that it's useful for disaster relief operations in your community too.
            </p>
          </div>
        </div>
      </section>

      {/* What it does */}
      <section className="border-t border-neutral-400/10">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="text-xs uppercase tracking-widest text-neutral-400">What it does</p>
          <h2 className="mt-3 text-3xl font-bold text-neutral-50">Five things.</h2>
          <ul className="mt-8 space-y-7">
            <li>
              <h3 className="font-semibold text-neutral-50">Transparency dashboard</h3>
              <p className="mt-1 leading-relaxed text-neutral-100/85">
                Live tracking of donations, beneficiaries, volunteer counts, and deployment activity across organizations.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-neutral-50">Interactive deployment map</h3>
              <p className="mt-1 leading-relaxed text-neutral-100/85">
                GPS-tagged aid deliveries visualized on a Leaflet / OpenStreetMap layer.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-neutral-50">Offline-capable PWA</h3>
              <p className="mt-1 leading-relaxed text-neutral-100/85">
                The full app shell is cached on-device via service worker — works without internet.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-neutral-50">Multilingual</h3>
              <p className="mt-1 leading-relaxed text-neutral-100/85">
                English, Filipino, and Ilocano with a one-click language switcher.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-neutral-50">Zero-budget infrastructure</h3>
              <p className="mt-1 leading-relaxed text-neutral-100/85">
                Supabase free tier for the database, Vercel for hosting, no paid services.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Get Involved */}
      <section id="get-involved" className="border-t border-neutral-400/10 bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="text-xs uppercase tracking-widest text-neutral-400">Get Involved</p>
          <h2 className="mt-3 text-3xl font-bold text-neutral-50">Every skill set has a place here.</h2>
          <p className="mt-6 leading-relaxed text-neutral-100/90">
            Kapwa Help is a volunteer-driven project and we welcome help from anyone — developers, designers, writers, translators, relief coordinators, or anyone who wants to contribute.
          </p>
          <div className="mt-8">
            <a
              href="mailto:contact@kapwahelp.org"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/80 transition-all"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-400/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-neutral-400">
          MIT License · Built for La Union, shared with everyone
        </div>
      </footer>
    </div>
  );
}
