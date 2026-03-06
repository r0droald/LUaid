export default function StatusFooter() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <footer className="mt-6 flex items-center gap-6 rounded-xl border-t border-neutral-400/20 bg-secondary px-6 py-4 text-sm text-neutral-400">
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-success" />
        Online
      </span>
      <span className="flex items-center gap-2">
        🕐 Last Updated: {time}
      </span>
    </footer>
  );
}
