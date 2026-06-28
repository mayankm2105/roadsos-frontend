import { useEffect, useRef, useState } from "react";
import type { GeoLocation } from "@/types";
import { useAppStore } from "@/store/useAppStore";

interface GPSHookState {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
}

// Default to central Gurugram (Haryana) so the app is usable before/without GPS.
const FALLBACK: GeoLocation = {
  lat: 28.4595,
  lng: 77.0266,
  address: "Gurugram, Haryana",
  pincode: "122001",
};

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return "";
    const data = (await res.json()) as {
      display_name?: string;
      address?: { postcode?: string };
    };
    return data.display_name ?? "";
  } catch {
    return "";
  }
}

export function useGPS(): GPSHookState {
  const [state, setState] = useState<GPSHookState>({
    location: null,
    loading: true,
    error: null,
  });
  const setLocation = useAppStore((s) => s.setLocation);
  const watchId = useRef<number | null>(null);
  const lastGeocode = useRef(0);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ location: FALLBACK, loading: false, error: "GPS not supported" });
      setLocation(FALLBACK);
      return;
    }

    const onSuccess = async (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const base: GeoLocation = {
        lat: latitude,
        lng: longitude,
        accuracy,
        address: "Locating address…",
      };
      setState({ location: base, loading: false, error: null });
      setLocation(base);

      // Throttle reverse geocoding to once every 30s.
      const now = Date.now();
      if (now - lastGeocode.current > 30000) {
        lastGeocode.current = now;
        const address = await reverseGeocode(latitude, longitude);
        if (address) {
          const enriched = { ...base, address };
          setState({ location: enriched, loading: false, error: null });
          setLocation(enriched);
        }
      }
    };

    const onError = () => {
      setState({
        location: FALLBACK,
        loading: false,
        error: "Location unavailable",
      });
      setLocation(FALLBACK);
    };

    watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000,
    });

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
