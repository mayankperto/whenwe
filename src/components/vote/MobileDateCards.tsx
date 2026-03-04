"use client";

import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Crown } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { AvatarFacepile } from "./AvatarFacepile";
import type { EventSlot } from "@/types";

interface MobileDateCardsProps {
  slots: EventSlot[];
  participantName: string;
  myVotes: Set<string>;
  onToggle: (slotId: string) => void;
}

function groupByDate(slots: EventSlot[]): Map<string, EventSlot[]> {
  const map = new Map<string, EventSlot[]>();
  for (const slot of slots) {
    if (!map.has(slot.date)) map.set(slot.date, []);
    map.get(slot.date)!.push(slot);
  }
  return map;
}

function getWinnerIds(slots: EventSlot[]): Set<string> {
  if (!slots.length) return new Set();
  const maxVotes = Math.max(...slots.map((s) => s.votes.length));
  if (maxVotes === 0) return new Set();
  return new Set(slots.filter((s) => s.votes.length === maxVotes).map((s) => s.id));
}

export function MobileDateCards({
  slots,
  participantName,
  myVotes,
  onToggle,
}: MobileDateCardsProps) {
  const grouped = groupByDate(slots);
  const winnerIds = getWinnerIds(slots);
  const dates = Array.from(grouped.keys()).sort();

  const allParticipants = new Set<string>();
  for (const slot of slots) {
    for (const v of slot.votes) allParticipants.add(v.participantName);
  }
  if (myVotes.size > 0) allParticipants.add(participantName);
  const totalParticipants = allParticipants.size;

  return (
    <div className="space-y-4">
      {dates.map((date, dateIdx) => {
        const dateSlots = grouped.get(date)!;
        const dateObj = parseISO(date);
        const hasWinner = dateSlots.some((s) => winnerIds.has(s.id));

        return (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dateIdx * 0.05 }}
            className={cn(
              "rounded-2xl border overflow-hidden",
              hasWinner
                ? "border-yellow-500/30 bg-yellow-500/5"
                : "glass"
            )}
          >
            {/* Date header */}
            <div
              className={cn(
                "px-4 py-3 border-b flex items-center justify-between",
                hasWinner
                  ? "border-yellow-500/20 bg-yellow-500/8"
                  : "border-white/8 bg-white/3"
              )}
            >
              <div>
                <p
                  className={cn(
                    "text-xs font-medium uppercase tracking-wider",
                    hasWinner ? "text-yellow-500" : "text-muted-foreground"
                  )}
                >
                  {format(dateObj, "EEEE")}
                </p>
                <p
                  className={cn(
                    "text-lg font-bold",
                    hasWinner ? "text-yellow-300" : "text-foreground"
                  )}
                >
                  {format(dateObj, "MMMM d, yyyy")}
                </p>
              </div>
              {hasWinner && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/25">
                  <Crown size={12} className="text-yellow-400" fill="currentColor" />
                  <span className="text-xs font-medium text-yellow-400">
                    Best day
                  </span>
                </div>
              )}
            </div>

            {/* Time slots */}
            <div className="p-3 space-y-2">
              {dateSlots.map((slot) => {
                const isMyVote = myVotes.has(slot.id);
                const isWinner = winnerIds.has(slot.id);
                const voterNames = slot.votes.map((v) => v.participantName);
                const voteCount = slot.votes.length;
                const fillPct = totalParticipants > 0 ? voteCount / totalParticipants : 0;

                return (
                  <motion.button
                    key={slot.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onToggle(slot.id)}
                    className={cn(
                      "relative w-full rounded-xl border p-3.5 text-left transition-all duration-200 overflow-hidden",
                      "flex items-center justify-between gap-3",
                      isMyVote
                        ? "bg-violet-600/20 border-violet-500/50"
                        : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15",
                      isWinner && "winner-slot"
                    )}
                  >
                    {/* Fill bar */}
                    {voteCount > 0 && (
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 transition-all duration-500 rounded-xl",
                          isWinner ? "bg-yellow-500/8" : "bg-emerald-500/8"
                        )}
                        style={{ width: `${fillPct * 100}%` }}
                      />
                    )}

                    <div className="relative z-10 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isWinner && (
                          <Crown size={12} className="text-yellow-400" fill="currentColor" />
                        )}
                        <p className="text-sm font-semibold text-foreground font-mono">
                          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                        </p>
                        {isMyVote && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium">
                            You ✓
                          </span>
                        )}
                      </div>

                      {voterNames.length > 0 && (
                        <div className="flex items-center gap-2">
                          <AvatarFacepile names={voterNames} maxVisible={4} size="xs" />
                          <span className="text-xs text-muted-foreground">
                            {voteCount} available
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tap indicator */}
                    <div
                      className={cn(
                        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                        isMyVote
                          ? "bg-violet-500/30 text-violet-300"
                          : "bg-white/5 text-muted-foreground/50"
                      )}
                    >
                      {isMyVote ? (
                        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="8" cy="8" r="6" />
                        </svg>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
