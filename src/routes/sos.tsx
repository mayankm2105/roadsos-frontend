import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { X, CheckCircle2, Copy, MapPin } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/services/api";
import { SEVERITY_META } from "@/lib/roadsos";
import type { Severity, SOSResult } from "@/types";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "Emergency SOS — RoadSoS" },
      {
        name: "description",
        content:
          "Create an instant emergency link with your live location and share it on WhatsApp.",
      },
    ],
  }),
  component: SOS,
});

const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

function SOS() {
  const navigate = useNavigate();
  const location = useAppStore((s) => s.location);

  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("high");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SOSResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!result?.expires_at) return;
    const tick = () => {
      const ms = new Date(result.expires_at!).getTime() - Date.now();
      if (ms <= 0) return setRemaining("Expired");
      const h = Math.floor(ms / 3.6e6);
      const m = Math.floor((ms % 3.6e6) / 6e4);
      setRemaining(`Expires in ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [result]);

  const generate = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    const res = await api.sosCreate({
      lat: location.lat,
      lng: location.lng,
      description: description.trim() || "Road accident — assistance needed",
      severity,
      reporter_name: name.trim() || undefined,
    });
    if (res.error || !res.data) {
      setError("Couldn't create the link. Call 108 immediately for urgent help.");
    } else {
      const link =
        res.data.share_url ?? `https://maps.google.com/?q=${location.lat},${location.lng}`;
      setResult({ ...res.data, link });
    }
    setLoading(false);
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappHref = result
    ? `https://wa.me/?text=I need help! Track my location: ${encodeURIComponent(result.link)}`
    : "#";

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <TopBar
        title="Emergency SOS"
        titleColor="var(--accent-red)"
        right={
          <button
            onClick={() => navigate({ to: "/" })}
            aria-label="Close"
            className="press flex h-9 w-9 items-center justify-center rounded-full bg-elevated"
          >
            <X size={18} color="var(--text-secondary)" />
          </button>
        }
      />

      <div className="px-4 py-6">
        {error && (
          <div
            className="mb-4 rounded-md border px-4 py-3 text-[13px]"
            style={{
              background: "rgba(239,68,68,0.1)",
              borderColor: "rgba(239,68,68,0.3)",
              color: "var(--accent-red)",
            }}
          >
            {error}
          </div>
        )}

        {/* Location preview */}
        <div className="mb-5 rounded-lg border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin size={16} color="var(--accent-green)" /> Your Location
            </span>
            <span
              className="rounded-pill px-2.5 py-1 text-[10px] font-semibold"
              style={{
                background: location ? "rgba(34,197,94,0.15)" : "rgba(136,136,136,0.15)",
                color: location ? "var(--accent-green)" : "var(--text-secondary)",
              }}
            >
              {location ? "GPS Active" : "Locating…"}
            </span>
          </div>
          <p className="text-xs text-secondary">
            {location?.address ?? "Acquiring your position…"}
          </p>
          {location && (
            <p className="mt-1 font-mono text-[11px] text-secondary">
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>
          )}
        </div>

        {!result ? (
          <>
            <label className="text-label mb-2 block">Describe the accident</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What happened? Number of people injured, vehicle type…"
              className="mb-5 w-full rounded-md bg-elevated p-4 text-[15px] text-foreground outline-none placeholder:text-secondary"
              style={{ border: "1px solid var(--border-subtle)" }}
            />

            <label className="text-label mb-2 block">Your name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reporter name"
              className="mb-5 w-full rounded-md bg-elevated px-4 py-3.5 text-[15px] text-foreground outline-none placeholder:text-secondary"
              style={{ border: "1px solid var(--border-subtle)" }}
            />

            <label className="text-label mb-2 block">Severity</label>
            <div className="mb-6 grid grid-cols-4 gap-2">
              {SEVERITIES.map((s) => {
                const meta = SEVERITY_META[s];
                const active = severity === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className="press rounded-pill py-3 text-xs font-semibold"
                    style={{
                      background: active ? meta.color : "var(--bg-elevated)",
                      color: active ? "#0a0a0a" : "var(--text-secondary)",
                      border: `1px solid ${active ? meta.color : "var(--border-subtle)"}`,
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={generate}
              disabled={loading || !location}
              className="press h-14 w-full rounded-pill text-base font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--accent-red)" }}
            >
              {loading ? "Generating…" : "Generate Emergency Link"}
            </button>
          </>
        ) : (
          <div
            className="rounded-lg border bg-surface p-5"
            style={{ borderColor: "var(--accent-green)" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 size={22} color="var(--accent-green)" />
              <span className="text-heading">Emergency link created</span>
            </div>
            <p className="mb-4 truncate rounded-md bg-elevated px-3 py-2 font-mono text-[13px] text-secondary">
              {result.link}
            </p>
            <div className="flex gap-3">
              <button
                onClick={copy}
                className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-pill border border-line bg-elevated text-sm font-semibold text-foreground"
              >
                <Copy size={16} /> {copied ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-pill text-sm font-semibold text-white"
                style={{ background: "var(--accent-green)" }}
              >
                Share on WhatsApp
              </a>
            </div>
            {remaining && (
              <p
                className="mt-4 text-center text-xs font-medium"
                style={{ color: "var(--accent-orange)" }}
              >
                {remaining}
              </p>
            )}
            <button
              onClick={() => setResult(null)}
              className="press mt-3 w-full text-center text-xs text-secondary"
            >
              Create another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
