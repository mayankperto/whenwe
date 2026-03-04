"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeRangeSelectorProps {
  startTime: string;
  endTime: string;
  onStartChange: (t: string) => void;
  onEndChange: (t: string) => void;
}

function generateTimeOptions() {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 || 12;
      const displayM = String(m).padStart(2, "0");
      options.push({ value, label: `${displayH}:${displayM} ${ampm}` });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

export function TimeRangeSelector({ startTime, endTime, onStartChange, onEndChange }: TimeRangeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock size={14} />
        <span className="font-medium">Time range for each day</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium mb-1.5 block">From</label>
          <select
            value={startTime}
            onChange={(e) => onStartChange(e.target.value)}
            className={cn(
              "w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900",
              "focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
              "transition-all duration-200 cursor-pointer hover:border-gray-300"
            )}
          >
            {TIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="text-gray-400 text-sm mt-5">to</div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium mb-1.5 block">Until</label>
          <select
            value={endTime}
            onChange={(e) => onEndChange(e.target.value)}
            className={cn(
              "w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900",
              "focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
              "transition-all duration-200 cursor-pointer hover:border-gray-300"
            )}
          >
            {TIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
