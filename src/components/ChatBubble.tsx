import { Phone } from "lucide-react";
import type { ChatMessage } from "@/types";
import { formatDistance } from "@/lib/roadsos";

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatBubble({
  message,
  onSuggestion,
}: {
  message: ChatMessage;
  onSuggestion?: (text: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className="max-w-[82%] px-4 py-3 text-[15px] leading-relaxed"
        style={
          isUser
            ? {
                background: "var(--accent-blue)",
                color: "#ffffff",
                borderRadius: "18px 18px 4px 18px",
              }
            : {
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                borderRadius: "18px 18px 18px 4px",
              }
        }
      >
        {message.typing ? (
          <span className="flex items-center gap-1 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full"
                style={{
                  background: "var(--text-secondary)",
                  animation: `typing-dot 1.2s ${i * 0.2}s infinite ease-in-out`,
                }}
              />
            ))}
          </span>
        ) : (
          message.text
        )}
      </div>

      {!!message.services?.length && (
        <div className="mt-2 w-[82%] space-y-2">
          {message.services.slice(0, 2).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-line bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {s.name}
                </p>
                <p className="text-xs" style={{ color: "var(--accent-green)" }}>
                  {formatDistance(s.distance_km)}
                </p>
              </div>
              <a
                href={s.phone ? `tel:${s.phone}` : "tel:108"}
                className="press flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: "rgba(34,197,94,0.15)" }}
              >
                <Phone size={16} color="var(--accent-green)" />
              </a>
            </div>
          ))}
        </div>
      )}

      {!!message.suggestions?.length && (
        <div className="mt-2 flex flex-wrap gap-2">
          {message.suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion?.(s)}
              className="press rounded-pill border border-line bg-elevated px-3 py-1.5 text-[13px] text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {!message.typing && (
        <span className="mt-1 px-1 text-[11px] text-secondary">
          {timeLabel(message.timestamp)}
        </span>
      )}
    </div>
  );
}
