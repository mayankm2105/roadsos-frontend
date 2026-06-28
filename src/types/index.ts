export type Lang = "en" | "hi";

export type Severity = "low" | "medium" | "high" | "critical";

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  pincode?: string;
  accuracy?: number;
}

export type ServiceCategory =
  | "police"
  | "hospital"
  | "ambulance"
  | "towing"
  | "mechanic";

export interface EmergencyService {
  id: string;
  name: string;
  category: ServiceCategory;
  address?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  distance_km?: number;
  drive_time_min?: number;
  trauma_centre?: boolean;
  source?: "live" | "cached" | string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  suggestions?: string[];
  services?: EmergencyService[];
  typing?: boolean;
}

export interface TriageQuestion {
  id?: string;
  question: string;
  options: string[];
}

export interface TriageState {
  triage_id: string;
  question?: TriageQuestion;
  question_number?: number;
  total_questions?: number;
  severity_score?: number;
  complete?: boolean;
  recommendation?: string;
  recommended_service?: EmergencyService;
}

export interface SOSResult {
  link: string;
  expires_at?: string;
  sos_id?: string;
}
