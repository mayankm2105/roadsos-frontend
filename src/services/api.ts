import axios from 'axios';
import type {
  EmergencyService,
  GeoLocation,
  Lang,
  Severity,
  SOSResult,
  TriageState,
} from "@/types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://roadsos-backend-sjbc.onrender.com/api/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds (Whisper can be slow)
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

/** Normalise the many shapes a services endpoint might return into a flat list. */
function extractServices(raw: any): EmergencyService[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as EmergencyService[];
  const obj = raw as Record<string, any>;
  
  // If we have a key like 'results' that contains an object of arrays
  for (const key of ["services", "results", "data", "items"]) {
    const val = obj[key];
    if (Array.isArray(val)) return val as EmergencyService[];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const merged: EmergencyService[] = [];
      for (const subVal of Object.values(val)) {
        if (Array.isArray(subVal)) merged.push(...(subVal as EmergencyService[]));
      }
      if (merged.length > 0) return merged;
    }
  }

  // category-keyed object at root e.g. { police: [], hospitals: [] }
  const merged: EmergencyService[] = [];
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) merged.push(...(value as EmergencyService[]));
  }
  return merged;
}

export const api = {
  health: async () => {
    try {
      const response = await apiClient.get<{ status?: string }>("/health");
      return { data: response.data, error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  i18n: async (lang: Lang) => {
    try {
      const response = await apiClient.get<Record<string, string>>(`/i18n/strings?lang=${lang}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  async servicesNearby(loc: GeoLocation): Promise<ApiResult<EmergencyService[]>> {
    try {
      const response = await apiClient.get(`/services/nearby?lat=${loc.lat}&lng=${loc.lng}`);
      return { data: extractServices(response.data), error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  async police(loc: GeoLocation): Promise<ApiResult<EmergencyService[]>> {
    try {
      const response = await apiClient.get(`/services/police?lat=${loc.lat}&lng=${loc.lng}`);
      return { data: extractServices(response.data), error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  async hospitals(
    loc: GeoLocation,
    traumaOnly = false,
  ): Promise<ApiResult<EmergencyService[]>> {
    try {
      const response = await apiClient.get(`/services/hospitals?lat=${loc.lat}&lng=${loc.lng}&trauma_only=${traumaOnly}`);
      return { data: extractServices(response.data), error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  async ambulances(loc: GeoLocation): Promise<ApiResult<EmergencyService[]>> {
    try {
      const response = await apiClient.get(`/services/ambulances?lat=${loc.lat}&lng=${loc.lng}`);
      return { data: extractServices(response.data), error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  async towing(loc: GeoLocation): Promise<ApiResult<EmergencyService[]>> {
    try {
      const response = await apiClient.get(`/services/towing?lat=${loc.lat}&lng=${loc.lng}`);
      return { data: extractServices(response.data), error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  async mechanics(loc: GeoLocation): Promise<ApiResult<EmergencyService[]>> {
    try {
      const response = await apiClient.get(`/services/mechanics?lat=${loc.lat}&lng=${loc.lng}`);
      return { data: extractServices(response.data), error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  chatMessage: async (payload: {
    session_id: string;
    message: string;
    location: GeoLocation;
    lang: Lang;
  }) => {
    try {
      const response = await apiClient.post<{
        reply?: { text: string };
        intent?: string;
        services?: EmergencyService[];
        session_id?: string;
        suggested_actions?: string[];
      }>("/chat/message", payload);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  chatVoice: async (form: FormData) => {
    try {
      const response = await apiClient.post<{ reply?: string; transcript?: string }>("/chat/voice", form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  triageStart: async (payload: {
    injury_description: string;
    location: GeoLocation;
    lang: Lang;
  }) => {
    try {
      const response = await apiClient.post<TriageState>("/triage/start", payload);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  triageAnswer: async (payload: { triage_id: string; answer: string }) => {
    try {
      const response = await apiClient.post<TriageState>("/triage/answer", payload);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },

  sosCreate: async (payload: {
    lat: number;
    lng: number;
    description: string;
    severity: Severity;
    reporter_name?: string;
  }) => {
    try {
      const response = await apiClient.post<SOSResult & Record<string, any>>("/sos/create", payload);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('API Error:', error);
      return { data: null, error: 'Request failed. Please try again.' };
    }
  },
};

export { BASE_URL };
