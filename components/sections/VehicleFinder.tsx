"use client";
import { useState } from "react";
import { Search, Car } from "lucide-react";
import { VEHICLE_MAKES, VEHICLE_MODELS, VEHICLE_YEARS, VEHICLE_TYPES } from "@/lib/types";

export default function VehicleFinder() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");

  const models = make ? (VEHICLE_MODELS[make] ?? []) : [];

  const handleMakeChange = (v: string) => {
    setMake(v);
    setModel("");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (year) params.set("year", year);
    if (type) params.set("type", type);
    window.location.href = `/shop?${params.toString()}`;
  };

  const selectClass =
    "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:border-transparent transition appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400";

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#0d0d0d] rounded-xl flex items-center justify-center shrink-0">
            <Car size={18} className="text-[#d4f000]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0d0d0d]">Find Parts For Your Vehicle</h2>
            <p className="text-xs text-gray-500">Select your vehicle to see compatible parts</p>
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Make */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Make</label>
            <div className="relative">
              <select
                value={make}
                onChange={(e) => handleMakeChange(e.target.value)}
                className={selectClass}
              >
                <option value="">Select Make</option>
                {VEHICLE_MAKES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1l5 5 5-5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Model */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Model</label>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!make}
                className={selectClass}
              >
                <option value="">Select Model</option>
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1l5 5 5-5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Year */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Year</label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={selectClass}
              >
                <option value="">Select Year</option>
                {VEHICLE_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1l5 5 5-5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Vehicle Type</label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={selectClass}
              >
                <option value="">Select Type</option>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1l5 5 5-5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end col-span-2 md:col-span-4 lg:col-span-1">
            <button
              onClick={handleSearch}
              disabled={!make}
              className="w-full flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold px-6 py-3 rounded-xl hover:bg-[#c4e000] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              <Search size={16} />
              Search Parts
            </button>
          </div>
        </div>

        {/* Popular searches */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400">Popular:</span>
          {["Toyota Camry 2022", "Ford F-150 2021", "Honda Civic 2020", "BMW 3 Series 2023"].map((v) => (
            <button
              key={v}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-[#d4f000]/20 hover:text-[#0d0d0d] text-gray-600 rounded-full transition-colors font-medium"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
