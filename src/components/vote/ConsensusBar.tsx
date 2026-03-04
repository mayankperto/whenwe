"use client";

import { motion } from "framer-motion";
import { Trophy, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatTime, getAvatarColor } from "@/lib/utils";
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
      className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 sm:p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-200">
            <Trophy size={18} className="text-white" fill="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                🏆 Best Time
              </span>
              {winnerSlots.length > 1 && (
                <span className="text-xs text-orange-500">({winnerSlots.length} tied)</span>
              )}
            </div>
            <p className="text-base font-bold text-gray-900">
              {format(parseISO(winner.date), "EEEE, MMMM d")}
            </p>
            <p className="text-sm text-gray-600 font-mono">
              {formatTime(winner.startTime)} – {formatTime(winner.endTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <AvatarFacepile
              names={winner.votes.map((v) => v.participantName)}
              maxVisible={5}
              size="sm"
            />
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">
                {maxVotes}
                {totalParticipants > 0 && (
                  <span className="text-gray-400 font-normal">/{totalParticipants}</span>
                )}
              </p>
              <p className="text-xs text-gray-500">available</p>
            </div>
          </div>

          <div className="relative w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="3" />
              <motion.circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 15}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - pct / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-orange-600">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {allNames.length > 0 && (
        <div className="mt-4 pt-4 border-t border-orange-200 flex items-center gap-2 flex-wrap">
          <Users size={12} className="text-gray-500" />
          <span className="text-xs text-gray-500">Responded:</span>
          {allNames.map((name) => (
            <div
              key={name}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                winner.votes.some((v) => v.participantName === name)
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-white text-gray-500 border border-gray-200"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", `bg-gradient-to-br ${getAvatarColor(name)}`)} />
              {name}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
