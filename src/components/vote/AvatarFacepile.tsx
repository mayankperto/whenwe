"use client";

import { motion } from "framer-motion";
import { getInitials, getAvatarColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AvatarFacepileProps {
  names: string[];
  maxVisible?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const sizeConfig = {
  xs: { outer: "w-5 h-5", text: "text-[8px]", overlap: "-ml-1.5", ring: "ring-1" },
  sm: { outer: "w-6 h-6", text: "text-[9px]", overlap: "-ml-2", ring: "ring-1" },
  md: { outer: "w-8 h-8", text: "text-xs", overlap: "-ml-2.5", ring: "ring-2" },
};

export function AvatarFacepile({ names, maxVisible = 4, size = "sm", className }: AvatarFacepileProps) {
  const visible = names.slice(0, maxVisible);
  const overflow = names.length - maxVisible;
  const cfg = sizeConfig[size];

  if (names.length === 0) return null;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((name, i) => (
        <motion.div
          key={name}
          initial={{ scale: 0, x: -10 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            cfg.outer, "rounded-full flex-shrink-0",
            `bg-gradient-to-br ${getAvatarColor(name)}`,
            "flex items-center justify-center text-white font-semibold",
            cfg.text, cfg.ring, "ring-white",
            i > 0 && cfg.overlap, "shadow-sm"
          )}
          title={name}
          style={{ zIndex: visible.length - i }}
        >
          {getInitials(name)}
        </motion.div>
      ))}

      {overflow > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: visible.length * 0.05 }}
          className={cn(
            cfg.outer, "rounded-full flex-shrink-0 bg-gray-100 border border-gray-200",
            "flex items-center justify-center text-gray-600 font-semibold",
            cfg.text, cfg.ring, "ring-white", cfg.overlap
          )}
          style={{ zIndex: 0 }}
        >
          +{overflow}
        </motion.div>
      )}
    </div>
  );
}
