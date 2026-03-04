"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials, getAvatarColor } from "@/lib/utils";

interface ParticipantEntryProps {
  onEnter: (name: string) => void;
}

export function ParticipantEntry({ onEnter }: ParticipantEntryProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    onEnter(name.trim());
  };

  const initials = name.trim() ? getInitials(name.trim()) : null;
  const avatarColor = name.trim() ? getAvatarColor(name.trim()) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-8 max-w-sm w-full mx-auto"
    >
      <div className="text-center mb-6">
        {/* Animated avatar preview */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${
              avatarColor || "from-muted to-muted"
            } flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-300`}
          >
            {initials || <User size={28} className="text-muted-foreground" />}
          </div>
          {initials && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
            >
              <Sparkles size={10} className="text-white" />
            </motion.div>
          )}
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Who are you?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your name to mark your availability
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Your name"
            className={`text-center text-base ${error ? "border-destructive/50" : ""}`}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
          {error && (
            <p className="text-xs text-destructive text-center mt-1.5">
              {error}
            </p>
          )}
        </div>

        <Button
          variant="gradient"
          size="lg"
          className="w-full group"
          onClick={handleSubmit}
        >
          Continue
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Button>
      </div>
    </motion.div>
  );
}
