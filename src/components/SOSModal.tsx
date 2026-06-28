import { useNavigate } from "@tanstack/react-router";
import { Phone, X, TriangleAlert, ShieldAlert, Link2 } from "lucide-react";

export function SOSModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md rounded-t-[28px] border-t border-line bg-surface p-6 pb-10">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TriangleAlert size={22} color="var(--accent-red)" />
            <h2 className="text-heading">Emergency</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="press flex h-9 w-9 items-center justify-center rounded-full bg-elevated"
          >
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>

        <p className="mb-5 text-sm text-secondary">
          Choose an action. If life is in danger, call emergency services
          immediately.
        </p>

        <a
          href="tel:108"
          className="press mb-3 flex h-14 w-full items-center justify-center gap-2 rounded-pill text-base font-semibold text-white"
          style={{ background: "var(--accent-red)" }}
        >
          <Phone size={20} /> Call Ambulance · 108
        </a>

        <a
          href="tel:112"
          className="press mb-3 flex h-14 w-full items-center justify-center gap-2 rounded-pill border border-line bg-elevated text-base font-semibold text-foreground"
        >
          <ShieldAlert size={20} color="var(--accent-blue)" /> Call Emergency · 112
        </a>

        <button
          onClick={() => {
            onClose();
            navigate({ to: "/sos" });
          }}
          className="press flex h-14 w-full items-center justify-center gap-2 rounded-pill border border-line bg-elevated text-base font-semibold text-foreground"
        >
          <Link2 size={20} color="var(--accent-green)" /> Create Emergency Link
        </button>
      </div>
    </div>
  );
}
