import { useAppStore } from "@/store/useAppStore";
import type { Lang, Severity } from "@/types";

type Dict = Record<string, { en: string; hi: string }>;

export const STRINGS: Dict = {
  appName: { en: "RoadSoS", hi: "RoadSoS" },
  online: { en: "ONLINE", hi: "ऑनलाइन" },
  offline: { en: "OFFLINE", hi: "ऑफ़लाइन" },
  locating: { en: "Locating…", hi: "स्थान खोज रहे हैं…" },
  emergency: { en: "Emergency", hi: "आपातकाल" },
  ambulance: { en: "Ambulance", hi: "एम्बुलेंस" },
  police: { en: "Police", hi: "पुलिस" },
  hospital: { en: "Hospital", hi: "अस्पताल" },
  triage: { en: "Triage", hi: "ट्राइएज" },
  chat: { en: "Chat", hi: "चैट" },
  callNow: { en: "Call 108", hi: "108 कॉल करें" },
  nearestServices: { en: "Nearest Services", hi: "निकटतम सेवाएं" },
  home: { en: "Home", hi: "होम" },
  services: { en: "Services", hi: "सेवाएं" },
  sos: { en: "SOS", hi: "एसओएस" },
  tagline: {
    en: "Help is one tap away.",
    hi: "मदद बस एक टैप दूर है।",
  },
};

export function useTranslation() {
  const lang = useAppStore((s) => s.lang);
  const t = (key: keyof typeof STRINGS): string =>
    STRINGS[key]?.[lang] ?? STRINGS[key]?.en ?? String(key);
  return { t, lang };
}

export function tFor(lang: Lang, key: keyof typeof STRINGS): string {
  return STRINGS[key]?.[lang] ?? STRINGS[key]?.en ?? String(key);
}

/** Map a 0-10 severity score to a token color. */
export function severityColor(score: number): string {
  if (score >= 8) return "var(--accent-red)";
  if (score >= 6) return "var(--accent-orange)";
  if (score >= 4) return "var(--accent-yellow)";
  return "var(--accent-green)";
}

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string }
> = {
  low: { label: "Low", color: "var(--accent-green)" },
  medium: { label: "Medium", color: "var(--accent-yellow)" },
  high: { label: "High", color: "var(--accent-orange)" },
  critical: { label: "Critical", color: "var(--accent-red)" },
};

export const CATEGORY_COLOR: Record<string, string> = {
  police: "var(--accent-blue)",
  hospital: "var(--accent-blue)",
  ambulance: "var(--accent-green)",
  towing: "var(--accent-orange)",
  mechanic: "var(--accent-yellow)",
};

export function formatDistance(km?: number): string {
  if (km == null) return "—";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function formatDriveTime(min?: number): string {
  if (min == null) return "";
  return `${Math.round(min)} min`;
}
