"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import {
  ArrowRight, ArrowLeft, Calendar, Loader2, X, Check, ChevronLeft, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StepIndicator } from "@/components/event/StepIndicator";
import { MiniCalendar } from "@/components/event/MiniCalendar";
import { TimeRangeSelector } from "@/components/event/TimeRangeSelector";

const STEPS = [
  { label: "Event Details", description: "Name and description" },
  { label: "Pick Dates", description: "Select candidate days" },
];

const pageVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      if (!title.trim()) { setErrors({ title: "Event name is required" }); return; }
      setErrors({});
    }
    setDir(1);
    setStep((s) => s + 1);
  };

  const goBack = () => { setDir(-1); setStep((s) => s - 1); };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) { setErrors({ dates: "Please select at least one date" }); return; }
    if (startTime >= endTime) { setErrors({ time: "End time must be after start time" }); return; }

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
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="px-6 py-4 flex items-center border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 group">
          <ChevronLeft size={18} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            W
          </div>
          <span className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors font-medium">
            WhenWe
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create a Scheduling Poll</h1>
            <p className="text-gray-500 text-sm">Takes about 30 seconds</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
            <StepIndicator steps={STEPS} current={step} />
          </motion.div>

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

function Step1({
  title, setTitle, description, setDescription, errors, onNext,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  errors: Record<string, string>;
  onNext: () => void;
}) {
  const [generating, setGenerating] = useState(false);

  const generateDescription = async () => {
    if (!title.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (res.ok) {
        const { description: generated } = await res.json();
        setDescription(generated);
      }
    } catch {}
    setGenerating(false);
  };

  return (
    <div className="card p-6 sm:p-8 space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900 block">
          Event name <span className="text-orange-500">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Team Offsite, Q3 Planning, Lunch meetup"
          className={errors.title ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}
          onKeyDown={(e) => e.key === "Enter" && onNext()}
          autoFocus
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900 block">
            Description
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <button
            type="button"
            onClick={generateDescription}
            disabled={generating || !title.trim()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-200 hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Sparkles size={11} />
            )}
            {generating ? "Generating..." : "✨ AI Write"}
          </button>
        </div>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this event about? (or let AI write it for you)"
          className="h-24"
        />
      </div>

      <Button variant="gradient" size="lg" className="w-full group" onClick={onNext}>
        Next: Choose Dates
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}

function Step2({
  selectedDates, onToggleDate, startTime, endTime, onStartChange, onEndChange,
  errors, onBack, onSubmit, loading,
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
      <div className="card p-6 sm:p-8">
        <MiniCalendar selectedDates={selectedDates} onToggleDate={onToggleDate} />
        {errors.dates && <p className="text-xs text-red-500 mt-3">{errors.dates}</p>}
      </div>

      <div className="card p-5">
        <TimeRangeSelector
          startTime={startTime}
          endTime={endTime}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
        />
        {errors.time && <p className="text-xs text-red-500 mt-2">{errors.time}</p>}
      </div>

      {selectedDates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card p-4"
        >
          <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">
            {selectedDates.length} date{selectedDates.length !== 1 ? "s" : ""} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((d) => (
              <motion.div
                key={d.toISOString()}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium"
              >
                <Check size={10} />
                {format(d, "EEE, MMM d")}
                <button
                  onClick={() => onToggleDate(d)}
                  className="ml-0.5 text-orange-400 hover:text-orange-700 transition-colors"
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {errors.submit && <p className="text-xs text-red-500 text-center">{errors.submit}</p>}

      <div className="flex gap-3">
        <Button variant="glass" onClick={onBack} className="flex-none">
          <ArrowLeft size={16} />
        </Button>
        <Button variant="gradient" size="lg" className="flex-1 group" onClick={onSubmit} disabled={loading}>
          {loading ? (
            <><Loader2 size={16} className="animate-spin" />Creating Poll...</>
          ) : (
            <><Calendar size={16} />Create Poll<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
