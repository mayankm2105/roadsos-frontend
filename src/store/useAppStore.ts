import { create } from "zustand";
import type { GeoLocation, Lang } from "@/types";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr-session";
  let id = localStorage.getItem("roadsos_session_id");
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("roadsos_session_id", id);
  }
  return id;
}

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("roadsos_lang") as Lang) || "en";
}

interface AppState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;

  location: GeoLocation | null;
  setLocation: (loc: GeoLocation | null) => void;

  online: boolean;
  setOnline: (online: boolean) => void;

  sessionId: string;
}

export const useAppStore = create<AppState>((set, get) => ({
  lang: getInitialLang(),
  setLang: (lang) => {
    if (typeof window !== "undefined") localStorage.setItem("roadsos_lang", lang);
    set({ lang });
  },
  toggleLang: () => {
    const next: Lang = get().lang === "en" ? "hi" : "en";
    if (typeof window !== "undefined") localStorage.setItem("roadsos_lang", next);
    set({ lang: next });
  },

  location: null,
  setLocation: (location) => set({ location }),

  online: true,
  setOnline: (online) => set({ online }),

  sessionId: getSessionId(),
}));
