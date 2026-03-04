"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Share2, Check, ChevronLeft, Loader2, Grid3X3, List, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticipantEntry } from "@/components/vote/ParticipantEntry";
import { AvailabilityGrid } from "@/components/vote/AvailabilityGrid";
import { MobileDateCards } from "@/components/vote/MobileDateCards";
import { ConsensusBar } from "@/components/vote/ConsensusBar";
import { cn } from "@/lib/utils";
import type { EventData } from "@/types";

const POLL_INTERVAL = 5000;

export default function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchEvent = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/events/${slug}`);
      if (!res.ok) throw new Error("Event not found");
      const data = await res.json();
      setEvent(data);
      setError(null);
    } catch (e) {
      setError("Event not found or has been deleted.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  useEffect(() => {
    if (!participantName) return;
    pollTimer.current = setInterval(() => fetchEvent(true), POLL_INTERVAL);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [participantName, fetchEvent]);

  useEffect(() => {
    if (!event || !participantName) return;
    const existing = new Set<string>();
    for (const slot of event.slots) {
      if (slot.votes.some((v) => v.participantName === participantName)) existing.add(slot.id);
    }
    setMyVotes(existing);
  }, [event, participantName]);

  const handleToggle = useCallback((slotId: string) => {
    setMyVotes((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) next.delete(slotId);
      else next.add(slotId);
      return next;
    });
    setEvent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        slots: prev.slots.map((slot) => {
          if (slot.id !== slotId) return slot;
          const hasVote = slot.votes.some((v) => v.participantName === participantName);
          return hasVote
            ? { ...slot, votes: slot.votes.filter((v) => v.participantName !== participantName) }
            : { ...slot, votes: [...slot.votes, { id: `opt-${slotId}`, participantName: participantName!, available: true }] };
        }),
      };
    });
  }, [participantName]);

  const handleSave = useCallback(async () => {
    if (!event || !participantName) return;
    setSaving(true);
    try {
      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName,
          votes: event.slots.map((slot) => ({ slotId: slot.id, available: myVotes.has(slot.id) })),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await fetchEvent(true);
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  }, [event, participantName, myVotes, fetchEvent]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="text-orange-500 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white">
        <div className="card p-10 text-center max-w-sm w-full">
          <p className="text-4xl mb-4">🗓</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Poll not found</h2>
          <p className="text-gray-500 text-sm mb-6">This poll may have expired or the link is invalid.</p>
          <Link href="/"><Button variant="gradient">Create a new poll</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 group">
          <ChevronLeft size={16} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
          <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            W
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors hidden sm:block">
            WhenWe
          </span>
        </Link>

        <Button variant="glass" size="sm" onClick={handleCopyLink}>
          {copied ? (
            <><Check size={14} className="text-green-500" /><span className="text-green-600">Copied!</span></>
          ) : (
            <><Share2 size={14} /><span className="hidden sm:inline">Share</span></>
          )}
        </Button>
      </nav>

      <div className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        {/* Event header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{event.title}</h1>
          {event.description && (
            <p className="text-gray-500 mt-1.5 text-sm leading-relaxed">{event.description}</p>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {!participantName ? (
            <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <ParticipantEntry onEnter={setParticipantName} />
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Consensus bar */}
              <ConsensusBar slots={event.slots} />

              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {participantName[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-900 font-medium">{participantName}</span>
                  <button
                    onClick={() => { setParticipantName(null); setMyVotes(new Set()); }}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors ml-1"
                  >
                    (change)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-xl p-1 bg-gray-50">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                        viewMode === "grid" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      )}
                    >
                      <Grid3X3 size={12} />Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                        viewMode === "list" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      )}
                    >
                      <List size={12} />List
                    </button>
                  </div>

                  <Button
                    variant={saved ? "secondary" : "gradient"}
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(saved && "text-green-600")}
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : saved ? (
                      <><Check size={14} />Saved</>
                    ) : (
                      <><Save size={14} /><span className="hidden sm:inline">Save</span></>
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100">
                <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-900">Click</span> dates to mark your availability, then{" "}
                  <span className="font-semibold text-gray-900">save</span>.
                </p>
              </div>

              {/* Grid / List */}
              <div>
                <div className={cn(viewMode === "list" ? "hidden" : "hidden sm:block")}>
                  <AvailabilityGrid slots={event.slots} participantName={participantName} myVotes={myVotes} onToggle={handleToggle} />
                </div>
                <div className={cn("block", viewMode === "grid" && "sm:hidden")}>
                  <MobileDateCards slots={event.slots} participantName={participantName} myVotes={myVotes} onToggle={handleToggle} />
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 pt-2 pb-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-orange-100 border border-orange-300" />
                  <span className="text-xs text-gray-500">Your availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-orange-400 border border-orange-500" />
                  <span className="text-xs text-gray-500">Most popular</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-gray-100 border border-gray-200 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-green-200" />
                  </div>
                  <span className="text-xs text-gray-500">Fill = % available</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
