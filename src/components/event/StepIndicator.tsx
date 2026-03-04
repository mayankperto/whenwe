"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = i < current;
        const isActive = i === current;

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
                  isCompleted && "bg-orange-500 border-orange-500 text-white",
                  isActive && "bg-orange-50 border-orange-400 text-orange-600 shadow-md shadow-orange-100",
                  !isCompleted && !isActive && "bg-gray-100 border-gray-200 text-gray-400"
                )}
              >
                {isCompleted ? <Check size={16} strokeWidth={2.5} /> : <span>{i + 1}</span>}
              </motion.div>
              <div className="mt-2 text-center hidden sm:block">
                <p className={cn("text-xs font-semibold", isActive ? "text-gray-900" : "text-gray-400")}>
                  {step.label}
                </p>
              </div>
            </div>

            {i < steps.length - 1 && (
              <div className="w-16 sm:w-24 mx-2 mb-5 sm:mb-0">
                <div className="h-0.5 w-full bg-gray-200 relative overflow-hidden rounded">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 origin-left bg-orange-500"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
