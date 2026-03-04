"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Zap, ArrowRight, Sparkles } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Drag-to-select dates",
    description: "Intuitively mark your availability on a beautiful visual grid.",
  },
  {
    icon: Users,
    title: "Avatar facepiles",
    description: "See who's available at a glance with overlapping avatar stacks.",
  },
  {
    icon: Zap,
    title: "Instant consensus",
    description: "The winning time slot surfaces automatically with a gold highlight.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/30">
            W
          </div>
          <span className="font-semibold text-foreground text-lg">WhenWe</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/create">
            <Button variant="glass" size="sm">
              Create Event
            </Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/20 text-violet-300 text-sm mb-8"
        >
          <Sparkles size={14} />
          <span>Scheduling without the chaos</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
        >
          Find the perfect time{" "}
          <span className="text-gradient">together</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10"
        >
          WhenWe is the anti-Doodle. No ads, no clutter, no checkmarks.
          Just a stunning visual grid that makes scheduling feel effortless.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/create">
            <Button variant="gradient" size="xl" className="group">
              Create an Event
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </Link>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="glass rounded-2xl p-5 text-left group hover:border-violet-500/20 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 mb-4 group-hover:bg-violet-500/25 transition-colors">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Subtle footer */}
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground/50">
        Built with Next.js · Open Source
      </footer>
    </div>
  );
}
