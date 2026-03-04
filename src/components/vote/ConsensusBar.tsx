"use client";

import { motion } from "framer-motion";
import { Crown, Users, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatTime, getAvatarColor, getInitials } from "@/lib/utils";
import { AvatarFacepile } from "./AvatarFacepile";
import { cn } from "@/lib/utils";
import type { EventSlot } from "@/types";

interface ConsensusBarProps {
  slots: EventSlot[];
}

export function ConsensusBar({ slots }: ConsensusBarProps) {
  if (!slots.length) return null;

  const maxVotes = Math.max(...slots.map((s) => s.votes.length));
  if (maxVotes === 0) return null;

  const winnerSlots = slots.filter((s) => s.votes.length === maxVotes);
  const winner = winnerSlots[0];

  const allParticipants = new Set<string>();
  for (const slot of slots) {
    for (const v of slot.votes) allParticipants.add(v.participantName);
  }
  const totalParticipants = allParticipants.size;

  const allNames = Array.from(allParticipants);
  const pct = totalParticipants > 0 ? Math.round((maxVotes / totalParticipants) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-yellow-500/25 bg-yellow-500/5 p-4 sm:p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
            <Crown size={18} className="text-yellow-400" fill="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                Best Time
              </span>
              {winnerSlots.length > 1 && (
                <span className="text-xs text-yellow-500/70">
                  ({winnerSlots.length} tied)
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-foreground">
              {format(parseISO(winner.date), "EEEE, MMMM d")}
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              {formatTime(winner.startTime)} – {formatTime(winner.endTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Participants */}
          <div className="flex items-center gap-2">
            <AvatarFacepile
              names={winner.votes.map((v) => v.participantName)}
              maxVisible={5}
              size="sm"
            />
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">
                {maxVotes}
                {totalParticipants > 0 && (
                  <span className="text-muted-foreground font-normal">
                    /{totalParticipants}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">available</p>
            </div>
          </div>

          {/* Progress ring */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="rgba(234, 179, 8, 0.15)"
                strokeWidth="3"
              />
              <motion.circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#EAB308"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 15}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 15 * (1 - pct / 100),
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-400">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* All participants */}
      {allNames.length > 0 && (
        <div className="mt-4 pt-4 border-t border-yellow-500/15 flex items-center gap-2 flex-wrap">
          <Users size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Responded:
          </span>
          {allNames.map((name) => (
            <div
              key={name}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                winner.votes.some((v) => v.participantName === name)
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-white/5 text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  `bg-gradient-to-br ${getAvatarColor(name)}`
                )}
              />
              {name}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
