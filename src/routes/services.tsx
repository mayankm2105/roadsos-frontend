import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { TopBar } from "@/components/TopBar";
import { GPSStrip } from "@/components/GPSStrip";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceCardSkeleton } from "@/components/SkeletonLoader";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/services/api";
import type { EmergencyService, ServiceCategory } from "@/types";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Emergency Services — RoadSoS" },
      {
        name: "description",
        content:
          "Browse nearby police stations, hospitals, ambulances, towing and mechanics across Haryana & Delhi.",
      },
    ],
  }),
  component: Services,
});

const TABS: { key: "all" | ServiceCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "police", label: "Police" },
  { key: "hospital", label: "Hospital" },
  { key: "ambulance", label: "Ambulance" },
  { key: "towing", label: "Towing" },
  { key: "mechanic", label: "Mechanic" },
];

function Services() {
  const location = useAppStore((s) => s.location);
  const [tab, setTab] = useState<"all" | ServiceCategory>("all");
  const [traumaOnly, setTraumaOnly] = useState(false);

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["services", tab, traumaOnly, location?.lat, location?.lng],
    queryFn: async (): Promise<EmergencyService[]> => {
      if (!location) return [];
      let res;
      if (tab === "police") res = await api.police(location);
      else if (tab === "hospital") res = await api.hospitals(location, traumaOnly);
      else if (tab === "ambulance") res = await api.ambulances(location);
      else if (tab === "towing") res = await api.towing(location);
      else if (tab === "mechanic") res = await api.mechanics(location);
      else res = await api.servicesNearby(location);
      
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
    enabled: !!location,
    staleTime: 60000,
  });

  const list = useMemo(() => {
    let items = (data ?? []).map((s, i) => ({
      ...s,
      id: s.id ?? String(i),
      category: (s.category ?? tab) as ServiceCategory,
    }));
    if (tab !== "all" && tab !== "hospital") {
      items = items.filter((s) => !s.category || s.category === tab);
    }
    if (traumaOnly) items = items.filter((s) => s.trauma_centre);
    return items;
  }, [data, tab, traumaOnly]);

  return (
    <div>
      <TopBar title="Emergency Services" />
      <GPSStrip address={location?.address} loading={!location} />

      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-3">
        {TABS.map((tb) => {
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className="press shrink-0 rounded-pill px-4 py-2 text-[13px] font-semibold"
              style={{
                background: active ? "var(--accent-blue)" : "var(--bg-elevated)",
                color: active ? "#fff" : "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {tb.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-label">
          {list.length} {list.length === 1 ? "result" : "results"}
        </span>
        <button
          onClick={() => setTraumaOnly((v) => !v)}
          className="press flex items-center gap-2 text-xs text-secondary"
        >
          Trauma only
          <span
            className="relative h-5 w-9 rounded-full transition-colors"
            style={{
              background: traumaOnly
                ? "var(--accent-green)"
                : "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span
              className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all"
              style={{ left: traumaOnly ? "18px" : "2px" }}
            />
          </span>
        </button>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={() => refetch()}
          className="press mb-3 w-full rounded-lg border border-line bg-surface py-2 text-xs text-secondary"
        >
          {isRefetching ? "Refreshing…" : "Pull data to refresh"}
        </button>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
            {error instanceof Error ? error.message : "Failed to load services."} <button onClick={() => refetch()} className="underline ml-2">Retry</button>
          </div>
        ) : list.length > 0 ? (
          list.map((s) => <ServiceCard key={s.id} service={s} />)
        ) : (
          <div className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-secondary">
            No services found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
