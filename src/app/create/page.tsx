"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Loader2,
  X,
  Check,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StepIndicator } from "@/components/event/StepIndicator";
import { MiniCalendar } from "@/components/event/MiniCalendar";
import { TimeRangeSelector } from "@/components/event/TimeRangeSelector";

const STEPS = [
  { label: "Event Details", description: "Name and description" },
  { label: "Pick Dates", description: "Select available days" },
];

const pageVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Step 2 state
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const toggleDate = (date: Date) => {
    setSelectedDates((prev) => {
      const exists = prev.some((d) => isSameDay(d, date));
      if (exists) return prev.filter((d) => !isSameDay(d, date));
      return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
    });
  };

  const goNext = () => {
    if (step === 0) {
      if (!title.trim()) {
        setErrors({ title: "Event name is required" });
        return;
      }
      setErrors({});
    }
    setDir(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDir(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      setErrors({ dates: "Please select at least one date" });
      return;
    }
    if (startTime >= endTime) {
      setErrors({ time: "End time must be after start time" });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const slots = selectedDates.map((d) => ({
        date: format(d, "yyyy-MM-dd"),
        startTime,
        endTime,
      }));

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, slots }),
      });

      if (!res.ok) throw new Error("Failed to create event");
      const { slug } = await res.json();
      router.push(`/event/${slug}/share`);
    } catch (err) {
      setErrors({ submit: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <ChevronLeft
            size={18}
            className="text-muted-foreground group-hover:text-foreground transition-colors"
          />
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            W
          </div>
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
            WhenWe
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create an Event
            </h1>
            <p className="text-muted-foreground text-sm">
              Takes about 30 seconds
            </p>
          </motion.div>

          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <StepIndicator steps={STEPS} current={step} />
          </motion.div>

          {/* Step content */}
          <div className="relative overflow-hidden">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={step}
                custom={dir}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {step === 0 && (
                  <Step1
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    errors={errors}
                    onNext={goNext}
                  />
                )}
                {step === 1 && (
                  <Step2
                    selectedDates={selectedDates}
                    onToggleDate={toggleDate}
                    startTime={startTime}
                    endTime={endTime}
                    onStartChange={setStartTime}
                    onEndChange={setEndTime}
                    errors={errors}
                    onBack={goBack}
                    onSubmit={handleSubmit}
                    loading={loading}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Event Details ────────────────────────────────────────────────────

function Step1({
  title,
  setTitle,
  description,
  setDescription,
  errors,
  onNext,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  errors: Record<string, string>;
  onNext: () => void;
}) {
  return (
    <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">
          Event name <span className="text-violet-400">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q3 Planning Session"
          className={errors.title ? "border-destructive/50" : ""}
          onKeyDown={(e) => e.key === "Enter" && onNext()}
          autoFocus
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">
          Description{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this event about?"
          className="h-24"
        />
      </div>

      <Button
        variant="gradient"
        size="lg"
        className="w-full group"
        onClick={onNext}
      >
        Next: Choose Dates
        <ArrowRight
          size={16}
          className="group-hover:translate-x-1 transition-transform"
        />
      </Button>
    </div>
  );
}

// ─── Step 2: Date & Time Selection ────────────────────────────────────────────

function Step2({
  selectedDates,
  onToggleDate,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  errors,
  onBack,
  onSubmit,
  loading,
}: {
  selectedDates: Date[];
  onToggleDate: (d: Date) => void;
  startTime: string;
  endTime: string;
  onStartChange: (t: string) => void;
  onEndChange: (t: string) => void;
  errors: Record<string, string>;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6 sm:p-8">
        <MiniCalendar selectedDates={selectedDates} onToggleDate={onToggleDate} />

        {errors.dates && (
          <p className="text-xs text-destructive mt-3">{errors.dates}</p>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <TimeRangeSelector
          startTime={startTime}
          endTime={endTime}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
        />
        {errors.time && (
          <p className="text-xs text-destructive mt-2">{errors.time}</p>
        )}
      </div>

      {/* Selected dates summary */}
      {selectedDates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass rounded-2xl p-4"
        >
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
            {selectedDates.length} date{selectedDates.length !== 1 ? "s" : ""} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((d) => (
              <motion.div
                key={d.toISOString()}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-medium group"
              >
                <Check size={10} />
                {format(d, "EEE, MMM d")}
                <button
                  onClick={() => onToggleDate(d)}
                  className="ml-0.5 text-violet-400/70 hover:text-violet-200 transition-colors"
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {errors.submit && (
        <p className="text-xs text-destructive text-center">{errors.submit}</p>
      )}

      <div className="flex gap-3">
        <Button variant="glass" onClick={onBack} className="flex-none">
          <ArrowLeft size={16} />
        </Button>
        <Button
          variant="gradient"
          size="lg"
          className="flex-1 group"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating Event...
            </>
          ) : (
            <>
              <Calendar size={16} />
              Create Event
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
