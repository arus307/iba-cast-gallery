export default function SharePreparationStatus() {
  return (
    <div
      aria-live="polite"
      className="flex flex-col items-center gap-4 py-16"
      role="status"
    >
      <span
        aria-label="共有ポストを準備中"
        className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
        role="progressbar"
      />
      <p>共有ポストを開いています…</p>
    </div>
  );
}
