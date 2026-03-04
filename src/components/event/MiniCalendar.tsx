"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  selectedDates: Date[];
  onToggleDate: (date: Date) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function MiniCalendar({ selectedDates, onToggleDate }: MiniCalendarProps) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding days for the start of the month
  const startPad = getDay(monthStart);
  const paddingDays = Array.from({ length: startPad }, (_, i) => i);

  const isSelected = (day: Date) =>
    selectedDates.some((d) => isSameDay(d, day));
  const isPast = (day: Date) => isBefore(day, today);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"select" | "deselect">("select");

  const handleMouseDown = (day: Date) => {
    if (isPast(day)) return;
    setIsDragging(true);
    const willSelect = !isSelected(day);
    setDragMode(willSelect ? "select" : "deselect");
    onToggleDate(day);
  };

  const handleMouseEnter = (day: Date) => {
    if (!isDragging || isPast(day)) return;
    const sel = isSelected(day);
    if (dragMode === "select" && !sel) onToggleDate(day);
    if (dragMode === "deselect" && sel) onToggleDate(day);
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      className="select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <AnimatePresence mode="wait">
          <motion.h3
            key={viewMonth.toISOString()}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-semibold text-foreground"
          >
            {format(viewMonth, "MMMM yyyy")}
          </motion.h3>
        </AnimatePresence>
        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-muted-foreground font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding */}
        {paddingDays.map((i) => (
          <div key={`pad-${i}`} />
        ))}

        {/* Days */}
        {days.map((day) => {
          const selected = isSelected(day);
          const past = isPast(day);
          const isToday = isSameDay(day, today);

          return (
            <motion.button
              key={day.toISOString()}
              whileHover={!past ? { scale: 1.1 } : {}}
              whileTap={!past ? { scale: 0.95 } : {}}
              onMouseDown={() => handleMouseDown(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              className={cn(
                "cal-day relative w-full aspect-square rounded-lg flex items-center justify-center text-sm transition-all duration-150",
                selected && "cal-day-selected bg-violet-600/25 border border-violet-500/50 text-violet-200 font-semibold",
                !selected && !past && "text-foreground hover:bg-white/8",
                past && "cal-day-disabled text-muted-foreground/40 cursor-not-allowed",
                isToday && !selected && "border border-white/20 text-foreground font-medium"
              )}
            >
              {format(day, "d")}
              {selected && (
                <motion.div
                  layoutId={`sel-${day.toISOString()}`}
                  className="absolute inset-0 rounded-lg bg-violet-600/20"
                  initial={false}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-violet-600/25 border border-violet-500/50" />
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border border-white/20" />
          <span className="text-xs text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
}
