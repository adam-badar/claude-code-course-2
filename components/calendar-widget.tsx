import { CalendarSlotButton } from "./calendar-slot-button";

type Slot = { label: string; key: string };
type Day = { heading: string; slots: Slot[] };

const days: Day[] = [
  {
    heading: "Fri, May 1",
    slots: [
      { label: "11:00 AM", key: "Friday, May 1 at 11:00 AM ET" },
      { label: "2:00 PM", key: "Friday, May 1 at 2:00 PM ET" },
    ],
  },
  {
    heading: "Mon, May 4",
    slots: [
      { label: "10:00 AM", key: "Monday, May 4 at 10:00 AM ET" },
      { label: "2:00 PM", key: "Monday, May 4 at 2:00 PM ET" },
    ],
  },
  {
    heading: "Tue, May 5",
    slots: [
      { label: "10:00 AM", key: "Tuesday, May 5 at 10:00 AM ET" },
      { label: "2:00 PM", key: "Tuesday, May 5 at 2:00 PM ET" },
    ],
  },
  {
    heading: "Wed, May 6",
    slots: [
      { label: "10:00 AM", key: "Wednesday, May 6 at 10:00 AM ET" },
      { label: "2:00 PM", key: "Wednesday, May 6 at 2:00 PM ET" },
    ],
  },
  {
    heading: "Thu, May 7",
    slots: [
      { label: "10:00 AM", key: "Thursday, May 7 at 10:00 AM ET" },
      { label: "2:00 PM", key: "Thursday, May 7 at 2:00 PM ET" },
    ],
  },
];

export function CalendarWidget() {
  return (
    <section id="schedule" className="border-t border-border py-20">
      <div className="container mx-auto max-w-[1100px] px-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-accent">
          Schedule a chat
        </p>
        <h2 className="mb-14 text-4xl font-bold tracking-[-0.02em]">When I&apos;m free.</h2>
        <p className="mb-8 max-w-[620px] text-muted">
          All times Eastern (ET). 30-minute slots. Snapshot from{" "}
          <time dateTime="2026-04-30">April 30, 2026</time>. Click a time to email me.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          {days.map((day) => (
            <div
              key={day.heading}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.04em] text-muted">
                {day.heading}
              </h3>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {day.slots.map((slot) => (
                  <li key={slot.key}>
                    <CalendarSlotButton slotKey={slot.key} label={slot.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
