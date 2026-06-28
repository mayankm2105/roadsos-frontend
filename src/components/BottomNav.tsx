import { Link, useRouterState } from "@tanstack/react-router";
import {
  House,
  MessageCircle,
  HeartPulse,
  TriangleAlert,
  MapPin,
} from "lucide-react";

const TABS = [
  { to: "/", label: "Home", Icon: House },
  { to: "/chat", label: "Chat", Icon: MessageCircle },
  { to: "/triage", label: "Triage", Icon: HeartPulse },
  { to: "/sos", label: "SOS", Icon: TriangleAlert, sos: true },
  { to: "/services", label: "Services", Icon: MapPin },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[72px] max-w-md items-stretch border-t border-line bg-background"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ to, label, Icon, sos }) => {
        const active = pathname === to;
        const color = sos
          ? "var(--accent-red)"
          : active
            ? "var(--accent-blue)"
            : "#444444";
        return (
          <Link
            key={to}
            to={to}
            className="press flex flex-1 flex-col items-center justify-center gap-1"
          >
            <Icon
              size={sos ? 28 : 22}
              color={color}
              strokeWidth={active || sos ? 2.4 : 2}
            />
            <span
              className="text-[10px] font-medium"
              style={{
                color: sos
                  ? "var(--accent-red)"
                  : active
                    ? "var(--accent-blue)"
                    : "#444444",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
