import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Ambulance,
  Shield,
  Hospital,
  Stethoscope,
  MessageCircle,
  Settings,
} from "lucide-react";

import { TopBar, LangSwitch } from "@/components/TopBar";
import { GPSStrip } from "@/components/GPSStrip";
import { EmergencyButton } from "@/components/EmergencyButton";
import { SOSModal } from "@/components/SOSModal";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceTileSkeleton } from "@/components/SkeletonLoader";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/lib/roadsos";
import { api } from "@/services/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RoadSoS — Emergency Road Safety" },
      {
        name: "description",
        content:
          "One-tap emergency road assistance for Haryana & Delhi: ambulance, police, hospitals and instant SOS links.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [sosOpen, setSosOpen] = useState(false);
  const location = useAppStore((s) => s.location);
  const { t } = useTranslation();

  const { data: services, isLoading } = useQuery({
    queryKey: ["nearby", location?.lat, location?.lng],
    queryFn: async () => {
      const res = await api.servicesNearby(location!);
      return res.data ?? [];
    },
    enabled: !!location,
    staleTime: 60000,
  });

  const actions = [
    {
      label: t("ambulance"),
      sub: "Call 108",
      Icon: Ambulance,
      color: "var(--accent-green)",
      onClick: () => (window.location.href = "tel:108"),
    },
    {
      label: t("police"),
      sub: "Call 112",
      Icon: Shield,
      color: "var(--accent-blue)",
      onClick: () => (window.location.href = "tel:112"),
    },
    {
      label: t("hospital"),
      sub: "Nearby",
      Icon: Hospital,
      color: "var(--accent-blue)",
      onClick: () => navigate({ to: "/services" }),
    },
    {
      label: t("triage"),
      sub: "Assess injury",
      Icon: Stethoscope,
      color: "var(--accent-orange)",
      onClick: () => navigate({ to: "/triage" }),
    },
  ];

  return (
    <div>
      <TopBar
        title={t("appName")}
        titleColor="var(--accent-red)"
        right={
          <>
            <LangSwitch />
            <button
              aria-label="Settings"
              className="press flex h-9 w-9 items-center justify-center rounded-full bg-elevated"
            >
              <Settings size={18} color="var(--text-secondary)" />
            </button>
          </>
        }
      />
      <GPSStrip address={location?.address} loading={!location} />

      <div className="px-4">
        <div className="py-8 text-center">
          <p className="text-label mb-1">Road Emergency · Haryana & Delhi</p>
          <h1 className="text-display mb-2">{t("tagline")}</h1>
          <p className="mx-auto max-w-xs text-sm text-secondary">
            Press for instant help. We route your live location to the nearest
            responders.
          </p>
        </div>

        <div className="flex justify-center py-2">
          <EmergencyButton onClick={() => setSosOpen(true)} />
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {actions.map(({ label, sub, Icon, color, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="press flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-4 text-left"
            >
              <Icon size={24} color={color} />
              <div>
                <p className="text-[13px] font-semibold text-foreground">
                  {label}
                </p>
                <p className="text-[11px] text-secondary">{sub}</p>
              </div>
            </button>
          ))}
          <button
            onClick={() => navigate({ to: "/chat" })}
            className="press col-span-2 flex items-center gap-3 rounded-lg border border-line bg-surface p-4 text-left"
          >
            <MessageCircle size={24} color="var(--pure-white)" />
            <div>
              <p className="text-[13px] font-semibold text-foreground">
                AI Assistant
              </p>
              <p className="text-[11px] text-secondary">
                Ask anything — get guidance instantly
              </p>
            </div>
          </button>
        </div>

        {/* Nearest services */}
        <div className="mt-8 pb-8">
          <p className="text-label mb-3">{t("nearestServices")}</p>
          {isLoading ? (
            <div className="no-scrollbar flex gap-3 overflow-x-auto">
              <ServiceTileSkeleton />
              <ServiceTileSkeleton />
              <ServiceTileSkeleton />
            </div>
          ) : services && services.length > 0 ? (
            <div className="space-y-2">
              {services.slice(0, 4).map((s, i) => (
                <ServiceCard key={s.id ?? i} service={{ ...s, id: s.id ?? String(i) }} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-line bg-surface p-6 text-center text-sm text-secondary">
              No nearby services found yet. Pull up Services to explore.
            </div>
          )}
        </div>
      </div>

      {sosOpen && <SOSModal onClose={() => setSosOpen(false)} />}
    </div>
  );
}
