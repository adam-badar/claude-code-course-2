"use client";

const EMAIL = "adam@bavlio.com";

export function CalendarSlotButton({
  slotKey,
  label,
}: {
  slotKey: string;
  label: string;
}) {
  const onClick = () => {
    const subject = encodeURIComponent(`Chat on ${slotKey}`);
    const body = encodeURIComponent(`Hi Adam, I'd like to chat on ${slotKey}.`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-md border border-border bg-transparent px-3.5 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {label}
    </button>
  );
}
