"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Share2,
  Check,
  ChevronLeft,
  Loader2,
  Grid3X3,
  List,
  Save,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticipantEntry } from "@/components/vote/ParticipantEntry";
import { AvailabilityGrid } from "@/components/vote/AvailabilityGrid";
import { MobileDateCards } from "@/components/vote/MobileDateCards";
import { ConsensusBar } from "@/components/vote/ConsensusBar";
import { cn } from "@/lib/utils";
import type { EventData, EventSlot } from "@/types";

// Poll interval in ms
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
  const [pendingVotes, setPendingVotes] = useState<Set<string>>(new Set()); // optimistic
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch event data
  const fetchEvent = useCallback(
    async (silent = false) => {
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
    },
    [slug]
  );

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Start polling when participant has entered their name
  useEffect(() => {
    if (!participantName) return;
    pollTimer.current = setInterval(() => fetchEvent(true), POLL_INTERVAL);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [participantName, fetchEvent]);

  // When event loads & participant is set, sync their existing votes
  useEffect(() => {
    if (!event || !participantName) return;
    const existingVotes = new Set<string>();
    for (const slot of event.slots) {
      if (slot.votes.some((v) => v.participantName === participantName)) {
        existingVotes.add(slot.id);
      }
    }
    setMyVotes(existingVotes);
  }, [event, participantName]);

  // Optimistic toggle
  const handleToggle = useCallback(
    (slotId: string) => {
      setMyVotes((prev) => {
        const next = new Set(prev);
        if (next.has(slotId)) next.delete(slotId);
        else next.add(slotId);
        return next;
      });

      // Also optimistically update the event slots
      setEvent((prev) => {
        if (!prev) return prev;
        const newSlots = prev.slots.map((slot) => {
          if (slot.id !== slotId) return slot;
          const hasVote = slot.votes.some(
            (v) => v.participantName === participantName
          );
          if (hasVote) {
            return {
              ...slot,
              votes: slot.votes.filter(
                (v) => v.participantName !== participantName
              ),
            };
          } else {
            return {
              ...slot,
              votes: [
                ...slot.votes,
                {
                  id: `optimistic-${slotId}`,
                  participantName: participantName!,
                  available: true,
                },
              ],
            };
          }
        });
        return { ...prev, slots: newSlots };
      });
    },
    [participantName]
  );

  // Save votes to server
  const handleSave = useCallback(async () => {
    if (!event || !participantName) return;
    setSaving(true);

    try {
      const votes = event.slots.map((slot) => ({
        slotId: slot.id,
        available: myVotes.has(slot.id),
      }));

      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName, votes }),
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2
            size={32}
            className="text-violet-400 animate-spin mx-auto"
          />
          <p className="text-muted-foreground text-sm">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-10 text-center max-w-sm w-full">
          <p className="text-4xl mb-4">🌫️</p>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Event not found
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            This event may have been deleted or the link is invalid.
          </p>
          <Link href="/">
            <Button variant="gradient">Create a new event</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <ChevronLeft
            size={16}
            className="text-muted-foreground group-hover:text-foreground transition-colors"
          />
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            W
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block">
            WhenWe
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="glass" size="sm" onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </Button>
        </div>
      </nav>

      <div className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        {/* Event header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {event.title}
          </h1>
          {event.description && (
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              {event.description}
            </p>
          )}
        </motion.div>

        {/* Participant entry or voting UI */}
        <AnimatePresence mode="wait">
          {!participantName ? (
            <motion.div
              key="entry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <ParticipantEntry onEnter={setParticipantName} />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Consensus bar */}
              <ConsensusBar slots={event.slots} />

              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                      `bg-gradient-to-br from-violet-500 to-indigo-600`
                    )}
                  >
                    {participantName[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-foreground font-medium">
                    {participantName}
                  </span>
                  <button
                    onClick={() => {
                      setParticipantName(null);
                      setMyVotes(new Set());
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
                  >
                    (change)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* View toggle — desktop shows both, mobile only list */}
                  <div className="hidden sm:flex items-center gap-1 glass rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                        viewMode === "grid"
                          ? "bg-violet-600/30 text-violet-200"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Grid3X3 size={12} />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                        viewMode === "list"
                          ? "bg-violet-600/30 text-violet-200"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <List size={12} />
                      List
                    </button>
                  </div>

                  <Button
                    variant={saved ? "glass" : "gradient"}
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(saved && "border-emerald-500/30 text-emerald-400")}
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : saved ? (
                      <>
                        <Check size={14} />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span className="hidden sm:inline">Save</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">Click</span>{" "}
                  time slots to toggle your availability, then{" "}
                  <span className="text-foreground font-medium">save</span> your
                  choices.
                </p>
              </div>

              {/* Grid or List view */}
              <div>
                {/* Desktop grid */}
                <div
                  className={cn(
                    viewMode === "list" ? "hidden" : "hidden sm:block"
                  )}
                >
                  <AvailabilityGrid
                    slots={event.slots}
                    participantName={participantName}
                    myVotes={myVotes}
                    onToggle={handleToggle}
                  />
                </div>

                {/* Mobile cards / list view */}
                <div
                  className={cn(
                    "block",
                    viewMode === "grid" && "sm:hidden"
                  )}
                >
                  <MobileDateCards
                    slots={event.slots}
                    participantName={participantName}
                    myVotes={myVotes}
                    onToggle={handleToggle}
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 pt-2 pb-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-violet-600/25 border border-violet-500/50" />
                  <span className="text-xs text-muted-foreground">
                    Your availability
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-yellow-500/15 border border-yellow-500/30" />
                  <span className="text-xs text-muted-foreground">
                    Most popular
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-emerald-500/15 border border-white/8 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-emerald-500/30" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Fill = % available
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
