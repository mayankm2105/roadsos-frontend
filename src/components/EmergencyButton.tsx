export function EmergencyButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        aria-label="Open emergency SOS"
        className="press relative flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: "var(--accent-red)",
          boxShadow:
            "0 0 0 8px rgba(239,68,68,0.15), 0 0 0 16px rgba(239,68,68,0.08)",
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: "var(--accent-red)",
            animation: "sos-ring 1.5s ease-out infinite",
          }}
        />
        <span className="relative text-xl font-bold text-white">SOS</span>
      </button>
      <span className="text-label" style={{ color: "var(--accent-red)" }}>
        Emergency
      </span>
    </div>
  );
}
