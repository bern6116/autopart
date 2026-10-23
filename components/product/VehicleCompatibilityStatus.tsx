"use client";

import type { VehicleCompatibility } from "@/lib/types";
import { matchesVehicle, useVehicleSelection } from "@/lib/vehicle";

export default function VehicleCompatibilityStatus({ fitments }: { fitments: VehicleCompatibility[] }) {
  const { vehicle } = useVehicleSelection();
  const hondaFitments = fitments.filter(f=>f.make==="Honda");
  if (!vehicle) return <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>Compatibility not verified for your vehicle.</strong> Choose a Honda model and year to check recorded fitment.</p>;
  const matched=matchesVehicle(hondaFitments,vehicle);
  return <p className={`rounded-xl border p-3 text-sm ${matched?"border-green-200 bg-green-50 text-green-800":"border-amber-200 bg-amber-50 text-amber-900"}`}><strong>{matched?"Confirmed compatible":"Compatibility not verified"}</strong> for {vehicle.year} Honda {vehicle.model}{vehicle.engine?` · ${vehicle.engine}`:""}.{!matched&&" No matching fitment record was found."}</p>;
}
