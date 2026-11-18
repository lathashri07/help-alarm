/** Stand-in for every screen until it is built in Phase 6. Delete per screen as you go. */
export default function Placeholder({ id, title }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm text-ink-muted">Board {id}</p>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-ink-muted">Not built yet. See Help_Alarm_UI_UX_Design.html.</p>
    </div>
  );
}