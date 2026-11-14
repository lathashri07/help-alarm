export default function App() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Help Alarm</h1>
      <p className="text-ink-muted">Design tokens are working.</p>
      <div className="rounded-card border border-line bg-card p-4">A card on the dark surface</div>
      <button className="min-h-touch rounded-btn bg-primary px-6 font-semibold hover:bg-primary-hover">
        Primary button
      </button>
      <button className="flex h-24 w-24 items-center justify-center rounded-full bg-danger text-lg font-extrabold">
        SOS
      </button>
    </div>
  );
}