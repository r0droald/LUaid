import { Link } from "react-router";
import LandingHeader from "../components/LandingHeader";
import "../styles/landing.css";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-landing-cream font-[Public_Sans,system-ui,sans-serif] text-landing-ink">
      <LandingHeader />

      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-landing-cream px-6 pt-10 pb-20 md:px-10 md:pt-14 md:pb-28">
        {/* Riso circles */}
        <span
          className="landing-riso"
          style={{
            top: "-80px",
            right: "-120px",
            width: "360px",
            height: "360px",
            background: "var(--color-landing-sunset)",
            opacity: 0.88,
          }}
          aria-hidden="true"
        />
        <span
          className="landing-riso"
          style={{
            bottom: "-180px",
            left: "40%",
            width: "360px",
            height: "360px",
            background: "var(--color-primary)",
            opacity: 0.85,
          }}
          aria-hidden="true"
        />
        {/* Grain */}
        <span className="landing-grain absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div>
            <div className="landing-stamp mb-6 inline-block border-[2.5px] border-landing-ink bg-landing-cream px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em]">
              Ginawa sa La Union · 2025
            </div>
            <h1 className="font-logo text-[52px] leading-[0.95] tracking-tight text-landing-ink md:text-[72px]">
              Built on the ground.{" "}
              <span className="font-serif italic tracking-normal text-landing-sunset" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Shared with everyone.
              </span>
            </h1>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-landing-ink">
              An open-source coordination tool for disaster relief — born during Typhoon Emong, built by the volunteers who were there.
            </p>
            <p
              className="mt-5 text-[19px] italic text-landing-sunset-deep"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              — Para sa komunidad. Ng komunidad.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/demo/en"
                className="rounded-md bg-landing-ink px-5 py-3 text-sm font-semibold text-landing-cream hover:opacity-90"
              >
                View Live Demo →
              </Link>
              <a
                href="#story"
                className="rounded-md border-2 border-landing-ink px-5 py-[10px] text-sm font-semibold text-landing-ink hover:bg-landing-ink/5"
              >
                Read the Story
              </a>
            </div>
          </div>

          <Link to="/demo/en" className="block">
            <img
              src="/landing/dashboard.png"
              alt="Kapwa Help dashboard showing relief coordination map and donation tracking"
              className="landing-screenshot-frame w-full rounded-[10px] border-[3px] border-landing-ink"
              loading="eager"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
