"use client";
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endsAt: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(endsAt: string): TimeLeft {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({ endsAt, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(endsAt));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(endsAt)), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <div className="bg-[#0d0d0d] text-[#d4f000] font-mono font-bold text-sm px-2 py-1 rounded min-w-[32px] text-center">
              {pad(u.value)}
            </div>
            <span className="text-[10px] text-gray-500 mt-0.5">{u.label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-gray-400 font-bold mb-3">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
