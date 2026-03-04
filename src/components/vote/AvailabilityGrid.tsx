"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Crown, Users } from "lucide-react";
import { cn, formatTime, getAvatarColor, getInitials } from "@/lib/utils";
import { AvatarFacepile } from "./AvatarFacepile";
import type { EventSlot } from "@/types";

interface AvailabilityGridProps {
  slots: EventSlot[];
  participantName: string;
  myVotes: Set<string>; // slot IDs where current user is available
  onToggle: (slotId: string) => void;
}

// Group slots by date
function groupByDate(slots: EventSlot[]): Map<string, EventSlot[]> {
  const map = new Map<string, EventSlot[]>();
  for (const slot of slots) {
    if (!map.has(slot.date)) map.set(slot.date, []);
    map.get(slot.date)!.push(slot);
  }
  return map;
}

// Find winner slot(s)
function getWinnerIds(slots: EventSlot[]): Set<string> {
  if (!slots.length) return new Set();
  const maxVotes = Math.max(...slots.map((s) => s.votes.length));
  if (maxVotes === 0) return new Set();
  return new Set(slots.filter((s) => s.votes.length === maxVotes).map((s) => s.id));
}

interface SlotCellProps {
  slot: EventSlot;
  isMyVote: boolean;
  isWinner: boolean;
  totalParticipants: number;
  onToggle: (id: string) => void;
  participantName: string;
}

function SlotCell({
  slot,
  isMyVote,
  isWinner,
  totalParticipants,
  onToggle,
  participantName,
}: SlotCellProps) {
  const [hovered, setHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);

  const voteCount = slot.votes.length;
  const voterNames = slot.votes.map((v) => v.participantName);
  const fillPct = totalParticipants > 0 ? voteCount / totalParticipants : 0;

  const handleMouseEnter = () => {
    setHovered(true);
    tooltipTimer.current = setTimeout(() => setShowTooltip(true), 300);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onToggle(slot.id)}
        className={cn(
          "relative w-full rounded-xl border transition-all duration-150 overflow-hidden cursor-pointer",
          "flex flex-col items-center justify-between p-2.5 gap-2 min-h-[80px]",
          // Base state
          "bg-white/3 border-white/8",
          // My vote state
          isMyVote && "bg-violet-600/20 border-violet-500/50",
          // Winner state
          isWinner && "winner-slot",
          // Hover state
          hovered && !isMyVote && "bg-white/6 border-white/15",
          hovered && isMyVote && "border-violet-400/70"
        )}
      >
        {/* Fill bar (background) */}
        {voteCount > 0 && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 transition-all duration-500",
              isWinner ? "bg-yellow-500/12" : "bg-emerald-500/10"
            )}
            style={{ height: `${fillPct * 100}%` }}
          />
        )}

        {/* Winner crown */}
        {isWinner && voteCount > 0 && (
          <div className="absolute top-1.5 right-1.5">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Crown size={12} className="text-yellow-400" fill="currentColor" />
            </motion.div>
          </div>
        )}

        {/* My availability indicator */}
        {isMyVote && (
          <div className="absolute top-1.5 left-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          </div>
        )}

        {/* Vote count */}
        <div className="relative z-10 text-center">
          {voteCount > 0 ? (
            <span
              className={cn(
                "text-xs font-semibold",
                isWinner ? "text-yellow-400" : "text-emerald-400"
              )}
            >
              {voteCount}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40 font-medium">
              —
            </span>
          )}
        </div>

        {/* Avatar facepile */}
        <div className="relative z-10 flex justify-center">
          {voterNames.length > 0 ? (
            <AvatarFacepile names={voterNames} maxVisible={3} size="xs" />
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground/30">
              <Users size={12} />
            </div>
          )}
        </div>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 glass-strong rounded-xl p-3 min-w-[140px] shadow-2xl"
            style={{ pointerEvents: "none" }}
          >
            <p className="text-xs font-semibold text-foreground mb-1.5">
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </p>
            {voterNames.length > 0 ? (
              <>
                <p className="text-xs text-muted-foreground mb-1.5">
                  {voteCount} available
                </p>
                <div className="space-y-1">
                  {voterNames.slice(0, 5).map((n) => (
                    <div key={n} className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0",
                          `bg-gradient-to-br ${getAvatarColor(n)}`
                        )}
                      >
                        {getInitials(n)}
                      </div>
                      <span
                        className={cn(
                          "text-xs",
                          n === participantName
                            ? "text-violet-300 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {n === participantName ? "You" : n}
                      </span>
                    </div>
                  ))}
                  {voterNames.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{voterNames.length - 5} more
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No one yet</p>
            )}
            {isWinner && (
              <div className="mt-2 pt-2 border-t border-yellow-500/20 flex items-center gap-1">
                <Crown size={10} className="text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">
                  Most popular
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AvailabilityGrid({
  slots,
  participantName,
  myVotes,
  onToggle,
}: AvailabilityGridProps) {
  const grouped = groupByDate(slots);
  const winnerIds = getWinnerIds(slots);

  // Get all unique participants for fill calculations
  const allParticipants = new Set<string>();
  for (const slot of slots) {
    for (const v of slot.votes) allParticipants.add(v.participantName);
  }
  if (myVotes.size > 0) allParticipants.add(participantName);
  const totalParticipants = allParticipants.size;

  const dates = Array.from(grouped.keys()).sort();

  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* Grid header */}
      <div className="min-w-[400px]">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${dates.length}, minmax(120px, 1fr))` }}
        >
          {/* Date headers */}
          {dates.map((date) => {
            const dateObj = parseISO(date);
            const hasWinner = grouped.get(date)!.some((s) => winnerIds.has(s.id));
            return (
              <div key={date} className="text-center pb-1">
                <div
                  className={cn(
                    "inline-block px-3 py-2 rounded-xl",
                    hasWinner
                      ? "bg-yellow-500/10 border border-yellow-500/20"
                      : "glass"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider",
                      hasWinner ? "text-yellow-400" : "text-muted-foreground"
                    )}
                  >
                    {format(dateObj, "EEE")}
                  </p>
                  <p
                    className={cn(
                      "text-lg font-bold leading-none mt-0.5",
                      hasWinner ? "text-yellow-300" : "text-foreground"
                    )}
                  >
                    {format(dateObj, "d")}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      hasWinner ? "text-yellow-500" : "text-muted-foreground"
                    )}
                  >
                    {format(dateObj, "MMM")}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Slot cells per date */}
          {(() => {
            // Get max slots across dates
            const maxSlots = Math.max(...Array.from(grouped.values()).map((s) => s.length));
            const rows: React.ReactElement[] = [];

            for (let row = 0; row < maxSlots; row++) {
              rows.push(
                ...dates.map((date) => {
                  const dateSlots = grouped.get(date)!;
                  const slot = dateSlots[row];
                  if (!slot) return <div key={`${date}-empty-${row}`} />;

                  return (
                    <div key={slot.id}>
                      {row === 0 && (
                        <div className="text-center text-xs text-muted-foreground/60 mb-1 font-mono">
                          {formatTime(slot.startTime)}
                        </div>
                      )}
                      <SlotCell
                        slot={slot}
                        isMyVote={myVotes.has(slot.id)}
                        isWinner={winnerIds.has(slot.id)}
                        totalParticipants={totalParticipants}
                        onToggle={onToggle}
                        participantName={participantName}
                      />
                      {row === dateSlots.length - 1 && (
                        <div className="text-center text-xs text-muted-foreground/60 mt-1 font-mono">
                          {formatTime(slot.endTime)}
                        </div>
                      )}
                    </div>
                  );
                })
              );
            }
            return rows;
          })()}
        </div>
      </div>
    </div>
  );
}
