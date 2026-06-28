import { useAppStore } from "@/store/useAppStore";

export function TopBar({
  title,
  titleColor,
  left,
  right,
}: {
  title: React.ReactNode;
  titleColor?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-background/90 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        {left}
        <span className="text-heading" style={titleColor ? { color: titleColor } : undefined}>
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}

export function LangSwitch() {
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);

  return (
    <div className="flex items-center rounded-pill border border-line bg-elevated p-0.5">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="press rounded-pill px-3 py-1 text-xs font-semibold"
          style={{
            background: lang === l ? "var(--accent-blue)" : "transparent",
            color: lang === l ? "#fff" : "var(--text-secondary)",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
