import { VenturesDashboard } from "@/components/ventures-dashboard";
import { CalendarWidget } from "@/components/calendar-widget";

export default function Home() {
  return (
    <>
      <header className="border-b border-border py-7">
        <div className="container mx-auto flex max-w-[1100px] items-center justify-between gap-6 px-6">
          <div className="font-semibold tracking-[-0.01em]">Adam</div>
          <nav className="flex items-center gap-7 text-sm text-muted">
            <a href="#what" className="transition-colors hover:text-foreground">
              What I do
            </a>
            <a href="#schedule" className="transition-colors hover:text-foreground">
              Schedule
            </a>
            <a href="#contact" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-28 md:py-32">
          <div className="container mx-auto max-w-[1100px] px-6">
            <h1 className="mb-6 text-5xl font-bold leading-[1.05] tracking-[-0.03em] md:text-7xl">
              Hey, I&apos;m <span className="text-accent">Adam</span>.
            </h1>
            <p className="mb-10 max-w-[620px] text-lg text-muted md:text-xl">
              Building Maple Bit, Bavlio, SapienEx, and BaviMail. UofT CS &apos;26.
              Currently shipping AI-native infrastructure for sales and ops teams.
            </p>
            <a
              href="mailto:adam@bavlio.com"
              className="inline-block rounded-lg bg-accent px-7 py-3.5 font-semibold text-[#1a1206] transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Get in touch
            </a>
          </div>
        </section>

        <VenturesDashboard />

        <CalendarWidget />

        <section id="contact" className="border-t border-border py-20">
          <div className="container mx-auto max-w-[1100px] px-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-accent">
              Contact
            </p>
            <h2 className="mb-8 text-4xl font-bold tracking-[-0.02em]">Let&apos;s talk.</h2>
            <p className="mb-6 max-w-[560px] text-muted">
              Email is the fastest way to reach me. Click a calendar slot above to
              prefill a meeting subject, or just say hi.
            </p>
            <a
              href="mailto:adam@bavlio.com"
              className="inline-block rounded-lg bg-accent px-7 py-3.5 font-semibold text-[#1a1206] transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              adam@bavlio.com
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-sm text-muted">
        <div className="container mx-auto max-w-[1100px] px-6">&copy; 2026 Adam Badar</div>
      </footer>
    </>
  );
}
