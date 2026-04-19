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
                Shared with everyone
              </span>
            </h1>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-landing-ink">
              An open-source coordination tool for disaster relief, born during Typhoon Emong, built by the volunteers who were there.
            </p>
            <p
              className="mt-5 text-[19px] italic text-landing-sunset-deep"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              — Para sa komunidad. Ng komunidad.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/demo/en"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-landing-ink px-5 py-3 text-sm font-semibold text-landing-cream hover:opacity-90"
              >
                View Live Demo →
              </a>
              <a
                href="#story"
                className="rounded-md border-2 border-landing-ink px-5 py-[10px] text-sm font-semibold text-landing-ink hover:bg-landing-ink/5"
              >
                Read the Story
              </a>
            </div>
          </div>

          <a href="/demo/en" target="_blank" rel="noopener noreferrer" className="block">
            <img
              src="/landing/dashboard.png"
              alt="Kapwa Help dashboard showing relief coordination map and donation tracking"
              className="landing-screenshot-frame w-full rounded-[10px] border-[3px] border-landing-ink"
              loading="eager"
            />
          </a>
        </div>
      </section>

      {/* ---------- STORY ---------- */}
      <section id="story" className="bg-landing-ink px-6 py-20 text-landing-cream md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1100px] gap-10 md:grid-cols-[1fr_2fr] md:gap-14">
          <div>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.3em] text-landing-sunset">
              The Story
            </p>
            <h2 className="font-logo text-4xl leading-[0.95] md:text-[56px]">
              Born during{" "}
              <span
                className="italic text-landing-sunset"
                style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
              >
                Emong
              </span>
            </h2>
          </div>

          <div className="landing-story-body space-y-4 text-base leading-relaxed text-landing-cream/80">
            <p>
              When Typhoon Emong hit La Union in 2025, volunteers self-organized across municipalities to distribute meals, relief goods, drinking water, and medical supplies. Coordination happened over group chats. Tracking happened in spreadsheets, when it happened at all.
            </p>
            <blockquote
              className="my-6 border-l-[3px] border-landing-sunset pl-4 text-[19px] italic leading-snug text-landing-cream"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              "The next disaster response should start where this one left off."
            </blockquote>
            <p>
              Kapwa Help was born out of that experience: a transparency and coordination tool built by the people who were on the ground. We publish this software openly in the hope that it's useful for disaster relief operations in your community too.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="bg-landing-cream px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.3em] text-landing-sunset">
            Features
          </p>
          <h2 className="mb-10 max-w-[16ch] font-logo text-4xl leading-[0.95] md:text-[56px]">
            Built for the field
          </h2>

          <ul className="grid grid-cols-1 border-t-2 border-landing-ink md:grid-cols-2">
            {/* 01 — Relief Map */}
            <li className="border-b-2 border-landing-ink py-6 md:border-r-2 md:pr-7">
              <div className="mb-2 flex items-center gap-3">
                <p className="font-logo text-[14px] tracking-[0.2em] text-landing-sunset">
                  01 / RELIEF MAP
                </p>
                <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.3em] text-landing-live">
                  <span className="landing-pulse-dot" aria-hidden="true" />
                  Live
                </div>
              </div>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                View live needs and hazards
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                See what's happening on the ground, pinned and updated as reports come in.
              </p>
            </li>

            {/* 02 — Transparency Dashboard */}
            <li className="border-b-2 border-landing-ink py-6 md:pl-7">
              <p className="mb-2 font-logo text-[14px] tracking-[0.2em] text-landing-sunset">
                02 / TRANSPARENCY DASHBOARD
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                Know what's been given, and to whom
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                Donations, beneficiaries, volunteer hours, and deployments, all in one place, all open to the public.
              </p>
            </li>

            {/* 03 — Offline First */}
            <li className="border-b-2 border-landing-ink py-6 md:border-r-2 md:pr-7">
              <p className="mb-2 font-logo text-[14px] tracking-[0.2em] text-landing-sunset">
                03 / OFFLINE FIRST
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                Works without internet
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                Submit reports when the signal's out; they'll sync when you're back online.
              </p>
            </li>

            {/* 04 — Multilingual */}
            <li className="border-b-2 border-landing-ink py-6 md:pl-7">
              <p className="mb-2 font-logo text-[14px] tracking-[0.2em] text-landing-sunset">
                04 / MULTILINGUAL
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                Built to speak your language
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                Multilingual support is built in. Ships with English, Filipino, and Ilocano; add your own translations when you deploy.
              </p>
            </li>
          </ul>

          {/* 05 — Open Source closer (full-width) */}
          <div className="border-b-2 border-landing-ink py-10 text-center md:py-14">
            <p className="mb-2 font-logo text-[14px] tracking-[0.2em] text-landing-sunset">
              05 / OPEN SOURCE
            </p>
            <h3 className="mx-auto mb-4 max-w-[32ch] font-logo text-[28px] leading-tight text-landing-ink md:text-[40px]">
              Take it. Run it for your community
            </h3>
            <p className="mx-auto mb-6 max-w-[82ch] text-sm leading-relaxed text-landing-ink/75 md:text-base">
              Kapwa Help is free and open source. It runs on free-tier tools, so a disaster response doesn't stall when a budget runs out. Fork the repo, deploy it for your own community, or help us improve it.
            </p>
            <a
              href="https://github.com/kapwa-help/kapwa-help"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-landing-sunset px-5 py-3 text-sm font-semibold text-landing-cream hover:opacity-90 md:text-base"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </section>

      {/* ---------- GET INVOLVED ---------- */}
      <section
        id="get-involved"
        className="relative overflow-hidden bg-landing-sunset px-6 py-20 text-landing-ink md:px-10 md:py-28"
      >
        <span
          className="landing-riso"
          style={{
            top: "-60px",
            right: "-60px",
            width: "240px",
            height: "240px",
            background: "var(--color-primary)",
            opacity: 0.9,
          }}
          aria-hidden="true"
        />
        <span className="landing-grain absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto max-w-[700px]">
          <p className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.3em]">
            Get Involved
          </p>
          <h2 className="mb-4 font-logo text-4xl leading-[0.95] md:text-[58px]">
            Every skill set{" "}
            <span
              className="italic"
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
            >
              has a place
            </span>
          </h2>
          <p className="mb-3 max-w-[46ch] text-base leading-relaxed">
            Kapwa Help is volunteer-driven. We welcome help from anyone: developers, designers, writers, translators, relief coordinators, or anyone who wants to contribute.
          </p>
          <p
            className="mb-7 text-[19px] italic text-landing-sunset-deep"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            — Naimbag nga aldaw. Come join us.
          </p>
          <a
            href="mailto:contact@kapwahelp.org"
            className="inline-block rounded-md bg-landing-ink px-5 py-3 text-sm font-semibold text-landing-cream hover:opacity-90"
          >
            Get in Touch →
          </a>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t-[6px] border-landing-sunset bg-landing-ink px-6 py-8 text-xs text-landing-cream md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <p className="text-landing-cream/60">
            <span className="mr-5">MIT License</span>
            <span>Built for La Union, shared with everyone</span>
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/kapwa-help/kapwa-help"
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80"
            >
              GitHub
            </a>
            <a href="mailto:contact@kapwahelp.org" className="hover:opacity-80">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
