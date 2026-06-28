import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/lib/roadsos";

export function GPSStrip({
  address,
  loading,
}: {
  address?: string;
  loading: boolean;
}) {
  const online = useAppStore((s) => s.online);
  const { t } = useTranslation();

  return (
    <div className="flex h-11 items-center justify-between border-b border-line bg-surface px-4">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            background: "var(--accent-green)",
            animation: "gps-pulse 1.5s ease-in-out infinite",
          }}
        />
        <span className="truncate text-xs text-secondary">
          {loading ? t("locating") : (address ?? t("locating"))}
        </span>
      </div>
      <span
        className="shrink-0 rounded-pill px-2.5 py-1 text-[10px] font-semibold tracking-wide"
        style={{
          background: online ? "rgba(34,197,94,0.15)" : "rgba(136,136,136,0.15)",
          color: online ? "var(--accent-green)" : "var(--text-secondary)",
        }}
      >
        {online ? t("online") : t("offline")}
      </span>
    </div>
  );
}
