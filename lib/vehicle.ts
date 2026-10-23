"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedVehicle, VehicleCompatibility } from "@/lib/types";

const KEY = "autocore_vehicle";
const EVENT = "autocore-vehicle-change";

function readVehicle(): SavedVehicle | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<SavedVehicle> | null;
    return value?.make === "Honda" && value.makeId && value.model && value.modelId && value.year
      ? value as SavedVehicle
      : null;
  } catch { return null; }
}

export function saveVehicle(vehicle: SavedVehicle | null) {
  if (vehicle) localStorage.setItem(KEY, JSON.stringify(vehicle));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useVehicleSelection() {
  const [vehicle, setVehicle] = useState<SavedVehicle | null>(null);
  useEffect(() => {
    const sync = () => setVehicle(readVehicle());
    sync(); window.addEventListener(EVENT, sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return { vehicle, setVehicle: useCallback((next:SavedVehicle|null) => saveVehicle(next), []), clearVehicle: useCallback(() => saveVehicle(null), []) };
}

export function matchesVehicle(fitments: VehicleCompatibility[], vehicle: SavedVehicle | null) {
  if (!vehicle) return false;
  return fitments.some((f) => f.make === "Honda" && f.model === vehicle.model && Number(vehicle.year) >= f.yearFrom && Number(vehicle.year) <= f.yearTo && (!vehicle.engine || f.engine === vehicle.engine));
}
