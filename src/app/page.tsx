"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Zap, ArrowRight, Sparkles, Clock } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Create a poll in seconds",
    description: "Pick your event dates and times, then share a link with your team.",
  },
  {
    icon: Users,
    title: "Everyone votes",
    description: "Team members mark their availability — no account needed.",
  },
  {
    icon: Zap,
    title: "Winner chosen automatically",
    description: "The best date surfaces instantly with a clear winner badge.",
  },
];

const steps = [
  { num: "1", text: "Name your event & pick candidate dates" },
  { num: "2", text: "Share the link with your team" },
  { num: "3", text: "Everyone votes, winner is shown instantly" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white text-base font-bold shadow-sm shadow-orange-200">
            W
          </div>
          <span className="font-bold text-gray-900 text-xl">WhenWe</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/create">
            <Button variant="gradient" size="sm">
              Create Poll
            </Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium mb-8"
        >
          <Sparkles size={14} />
          <span>Better than Doodle. No ads, no clutter.</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.08]"
        >
          Schedule anything{" "}
          <span className="text-gradient">together</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg sm:text-xl text-gray-500 max-w-xl mb-10 leading-relaxed"
        >
          Create a scheduling poll, share it with your team, and let everyone
          vote. The winning date is announced automatically.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link href="/create">
            <Button variant="gradient" size="xl" className="group">
              Create a free poll
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row items-center gap-4 sm:gap-8"
        >
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                {s.num}
              </div>
              <span className="text-sm text-gray-600">{s.text}</span>
              {i < steps.length - 1 && (
                <ArrowRight size={14} className="text-gray-300 hidden sm:block flex-shrink-0" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="grid sm:grid-cols-3 gap-4 mt-16 max-w-3xl w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="card p-6 text-left hover:border-orange-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="px-6 py-5 text-center text-xs text-gray-400 border-t border-gray-100">
        WhenWe · Free team scheduling · No account required
      </footer>
    </div>
  );
}
