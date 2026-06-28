import type {
  EmergencyService,
  GeoLocation,
  Lang,
  Severity,
  SOSResult,
  TriageState,
} from "@/types";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://roadsos-backend.onrender.com/api/v1";

export interface ApiResult<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers:
        options?.body instanceof FormData
          ? undefined
          : { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      return { error: `Request failed (${res.status})` };
    }
    const data = (await res.json()) as T;
    return { data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/** Normalise the many shapes a services endpoint might return into a flat list. */
function extractServices(raw: unknown): EmergencyService[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as EmergencyService[];
  const obj = raw as Record<string, unknown>;
  for (const key of ["services", "results", "data", "items"]) {
    if (Array.isArray(obj[key])) return obj[key] as EmergencyService[];
  }
  // category-keyed object e.g. { police: [], hospitals: [] }
  const merged: EmergencyService[] = [];
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) merged.push(...(value as EmergencyService[]));
  }
  return merged;
}

export const api = {
  health: () => request<{ status?: string }>("/health"),

  i18n: (lang: Lang) =>
    request<Record<string, string>>(`/i18n/strings?lang=${lang}`),

  async servicesNearby(loc: GeoLocation): Promise<ApiResult<EmergencyService[]>> {
    const r = await request<unknown>(
      `/services/nearby?lat=${loc.lat}&lng=${loc.lng}`,
    );
    return r.error ? { error: r.error } : { data: extractServices(r.data) };
  },

  async police(loc: GeoLocation): Promise<ApiResult<EmergencyService[]>> {
    const r = await request<unknown>(
      `/services/police?lat=${loc.lat}&lng=${loc.lng}`,
    );
    return r.error ? { error: r.error } : { data: extractServices(r.data) };
  },

  async hospitals(
    loc: GeoLocation,
    traumaOnly = false,
  ): Promise<ApiResult<EmergencyService[]>> {
    const r = await request<unknown>(
      `/services/hospitals?lat=${loc.lat}&lng=${loc.lng}&trauma_only=${traumaOnly}`,
    );
    return r.error ? { error: r.error } : { data: extractServices(r.data) };
  },

  async ambulances(loc: GeoLocation): Promise<ApiResult<EmergencyService[]>> {
    const r = await request<unknown>(
      `/services/ambulances?lat=${loc.lat}&lng=${loc.lng}`,
    );
    return r.error ? { error: r.error } : { data: extractServices(r.data) };
  },

  chatMessage: (payload: {
    session_id: string;
    message: string;
    location: GeoLocation;
    lang: Lang;
  }) =>
    request<{
      reply?: string;
      message?: string;
      response?: string;
      suggestions?: string[];
      services?: EmergencyService[];
    }>("/chat/message", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  chatVoice: (form: FormData) =>
    request<{ reply?: string; transcript?: string }>("/chat/voice", {
      method: "POST",
      body: form,
    }),

  triageStart: (payload: {
    injury_description: string;
    location: GeoLocation;
    lang: Lang;
  }) =>
    request<TriageState>("/triage/start", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  triageAnswer: (payload: { triage_id: string; answer: string }) =>
    request<TriageState>("/triage/answer", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  sosCreate: (payload: {
    lat: number;
    lng: number;
    description: string;
    severity: Severity;
    reporter_name?: string;
  }) =>
    request<SOSResult & Record<string, unknown>>("/sos/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export { BASE_URL };
