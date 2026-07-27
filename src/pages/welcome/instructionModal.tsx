// InstructionModal.tsx
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "preact/hooks";
import { X } from "lucide-react";

interface InstructionModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  description: string;
  video: string;
  icon?: any;
  color?: string; // e.g. "hover:text-emerald-400"
}

export const InstructionModal = ({
  isOpen,
  setIsOpen,
  title,
  description,
  video,
  icon: Icon,
  color = "",
}: InstructionModalProps) => {
  // strip "hover:" — modal accent should be static, not hover-triggered
  const accent = color.replace("hover:", "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* wider modal so the video actually reads as a demo, not a thumbnail */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-4xl bg-[#0f0f11] border border-white/[0.08] rounded-[28px] shadow-2xl overflow-hidden"
          >
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-current opacity-[0.08] blur-[60px] rounded-full pointer-events-none ${accent}`}
            />

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-7 flex flex-col items-center text-center">
              {Icon && (
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 mb-4 text-current ${accent}`}
                >
                  <Icon size={22} strokeWidth={1.75} />
                </div>
              )}

              <h3 className="text-xl font-semibold text-white tracking-tight">
                {title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed mt-2 mb-6 max-w-md">
                {description}
              </p>

              {/* taller 16:10 ratio inside a wider modal = noticeably bigger video without going full-bleed */}
              {video ? (
                <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.06] bg-black/40">
                  <video
                    className="w-full h-full object-cover"
                    src={video}
                    loop
                    autoplay
                    muted
                    playsInline
                  />
                </div>
              ) : (
                <div className="w-full aspect-[16/10] rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-zinc-600 text-sm">
                  Demo coming soon
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
