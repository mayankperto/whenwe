"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Copy, Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/event/${slug}`);
  }, [slug]);

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass rounded-3xl p-8 sm:p-12 max-w-md w-full text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30"
        >
          <Sparkles size={36} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
        >
          Event created!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-muted-foreground text-sm mb-8"
        >
          Share this link with your team so they can mark their availability.
        </motion.p>

        {/* URL box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 mb-4 group cursor-pointer"
          onClick={handleCopy}
        >
          <p className="flex-1 text-sm text-muted-foreground truncate font-mono text-left">
            {url || "Loading..."}
          </p>
          <div className="flex-shrink-0">
            {copied ? (
              <Check size={16} className="text-emerald-400" />
            ) : (
              <Copy size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col gap-3"
        >
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied to clipboard!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy Link
              </>
            )}
          </Button>

          <Link href={`/event/${slug}`} className="w-full">
            <Button variant="glass" size="lg" className="w-full group">
              Open Event
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
