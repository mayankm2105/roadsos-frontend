import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, TriangleAlert, Phone } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/services/api";
import { severityColor } from "@/lib/roadsos";
import type { TriageState } from "@/types";

export const Route = createFileRoute("/triage")({
  head: () => ({
    meta: [
      { title: "Medical Triage — RoadSoS" },
      {
        name: "description",
        content:
          "Answer a few questions to assess injury severity and find the nearest trauma centre.",
      },
    ],
  }),
  component: Triage,
});

function Triage() {
  const navigate = useNavigate();
  const location = useAppStore((s) => s.location);
  const lang = useAppStore((s) => s.lang);

  const [description, setDescription] = useState("");
  const [state, setState] = useState<TriageState | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    const res = await api.triageStart({
      injury_description: description.trim(),
      location: location ?? { lat: 0, lng: 0, address: "" },
      lang,
    });
    if (res.error || !res.data) {
      setError("Couldn't start triage. For urgent help call 108 immediately.");
    } else {
      setState(res.data);
    }
    setLoading(false);
  };

  const answer = async (value: string) => {
    if (!state) return;
    setSelected(value);
    setLoading(true);
    const res = await api.triageAnswer({
      triage_id: state.triage_id,
      answer: value,
    });
    if (res.data) setState(res.data);
    else setError("Couldn't submit answer. Try again.");
    setSelected(null);
    setLoading(false);
  };

  const score = state?.severity_score ?? 0;
  const qNum = state?.question_number ?? 1;
  const total = state?.total_questions ?? 6;
  const progress = state?.complete ? 100 : Math.round(((qNum - 1) / total) * 100);
  const color = severityColor(score);

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <TopBar
        title="Medical Triage"
        left={
          <button
            onClick={() => (state ? setState(null) : navigate({ to: "/" }))}
            aria-label="Back"
            className="press flex h-9 w-9 items-center justify-center rounded-full bg-elevated"
          >
            <ArrowLeft size={18} color="var(--text-secondary)" />
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

        {!state ? (
          <div>
            <h1 className="text-display mb-2">What happened?</h1>
            <p className="mb-6 text-sm text-secondary">
              Briefly describe the injury so we can assess severity and guide you.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="e.g. Bleeding from the leg after a bike fall, conscious but in pain…"
              className="w-full rounded-md bg-elevated p-4 text-[15px] text-foreground outline-none placeholder:text-secondary"
              style={{ border: "1px solid var(--border-subtle)" }}
            />
            <button
              onClick={start}
              disabled={loading || !description.trim()}
              className="press mt-4 h-14 w-full rounded-pill text-base font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--accent-red)" }}
            >
              {loading ? "Starting…" : "Start Triage"}
            </button>
          </div>
        ) : (
          <div>
            {/* Severity ring */}
            <div className="mb-6 flex flex-col items-center">
              <div
                className="flex h-28 w-28 items-center justify-center rounded-full"
                style={{ border: `4px solid ${color}` }}
              >
                <span className="text-display" style={{ color }}>
                  {score.toFixed(1)}
                </span>
              </div>
              <span className="text-label mt-2">Severity Score</span>
            </div>

            {/* Progress */}
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: color }}
              />
            </div>
            <p className="mb-5 text-center text-xs text-secondary">
              {state.complete ? "Assessment complete" : `Question ${qNum} of ${total}`}
            </p>

            {score >= 8 && (
              <div
                className="mb-4 flex items-center gap-2 rounded-md border px-4 py-3"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  borderColor: "var(--accent-red)",
                }}
              >
                <TriangleAlert size={18} color="var(--accent-red)" />
                <span className="text-[13px] font-semibold" style={{ color: "var(--accent-red)" }}>
                  CRITICAL — Call 108 immediately
                </span>
              </div>
            )}

            {!state.complete && state.question ? (
              <div className="rounded-xl border border-line bg-surface p-6">
                <h2 className="text-heading mb-5">{state.question.question}</h2>
                <div className="space-y-3">
                  {state.question.options.map((opt) => {
                    const active = selected === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => answer(opt)}
                        disabled={loading}
                        className="press flex h-13 w-full items-center rounded-pill px-5 py-3.5 text-left text-[15px] font-medium text-foreground disabled:opacity-60"
                        style={{
                          background: active
                            ? "rgba(31,71,136,0.2)"
                            : "var(--bg-elevated)",
                          border: `1px solid ${active ? "var(--accent-blue)" : "var(--border-subtle)"}`,
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-line bg-surface p-6">
                <p className="text-label mb-2">Recommendation</p>
                <p className="mb-4 text-[15px] leading-relaxed text-foreground">
                  {state.recommendation ??
                    "Based on your answers, seek medical attention. Call 108 if symptoms worsen."}
                </p>
                {state.recommended_service && (
                  <p className="mb-4 text-sm text-secondary">
                    Nearest: {state.recommended_service.name}
                  </p>
                )}
                <div className="flex gap-3">
                  <a
                    href="tel:108"
                    className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-pill text-sm font-semibold text-white"
                    style={{ background: "var(--accent-red)" }}
                  >
                    <Phone size={18} /> Call 108
                  </a>
                  <button
                    onClick={() => navigate({ to: "/services" })}
                    className="press h-12 flex-1 rounded-pill border border-line bg-elevated text-sm font-semibold text-foreground"
                  >
                    Find Hospital
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
