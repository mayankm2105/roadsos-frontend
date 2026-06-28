import { Phone, Navigation, ShieldCheck } from "lucide-react";
import type { EmergencyService } from "@/types";
import {
  CATEGORY_COLOR,
  formatDistance,
  formatDriveTime,
} from "@/lib/roadsos";

function dialHref(phone?: string) {
  return phone ? `tel:${phone.replace(/\s+/g, "")}` : "tel:108";
}

function directionsHref(s: EmergencyService) {
  if (s.lat != null && s.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    s.name,
  )}`;
}

export function ServiceCard({ service }: { service: EmergencyService }) {
  const color = CATEGORY_COLOR[service.category] ?? "var(--accent-blue)";
  const isLive = (service.source ?? "live") === "live";

  return (
    <div className="mb-2 rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: color }}
            />
          </span>
          {service.trauma_centre && (
            <ShieldCheck size={14} color="var(--accent-green)" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-foreground">
            {service.name}
          </p>
          {service.address && (
            <p className="mt-0.5 line-clamp-1 text-xs text-secondary">
              {service.address}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs" style={{ color: "var(--accent-green)" }}>
              {formatDistance(service.distance_m)}
              {service.drive_time_min != null &&
                ` · ${formatDriveTime(service.drive_time_min)}`}
            </span>
            <span className="flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: isLive
                    ? "var(--accent-green)"
                    : "var(--text-secondary)",
                }}
              />
              <span className="text-[10px] uppercase tracking-wide text-secondary">
                {isLive ? "Live" : "Cached"}
              </span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={dialHref(service.phone)}
            aria-label={`Call ${service.name}`}
            className="press flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "rgba(34,197,94,0.15)" }}
          >
            <Phone size={18} color="var(--accent-green)" />
          </a>
          <a
            href={directionsHref(service)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Directions to ${service.name}`}
            className="press flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "rgba(31,71,136,0.25)" }}
          >
            <Navigation size={18} color="var(--accent-blue)" />
          </a>
        </div>
      </div>
    </div>
  );
}
