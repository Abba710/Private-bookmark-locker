// WelcomePage.tsx
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import "./index.css";
import {
  Pin,
  HatGlasses,
  Keyboard,
  ArrowUpRight,
  Save,
  EyeOff,
  Search,
  Monitor,
  Palette,
  ArrowLeftRight,
  Download,
  Layers,
  QrCode,
  FileText,
  Sparkles,
  FolderPlus,
} from "lucide-react";
import { InstructionModal } from "./instructionModal";

interface Slide {
  title: string;
  subtitle?: string;
  icon?: string | typeof Pin;
  content: string;
  video?: string;
  color?: string;
  isLast?: boolean;
}

interface Features {
  title: string;
  color: string;
  description: string;
  icon: typeof Pin;
  video: string;
}

const LOCKER_ICON = "/images/icon128.png";

const SLIDES: Slide[] = [
  {
    title: chrome.i18n.getMessage("app_slides_intro_title"),
    subtitle: chrome.i18n.getMessage("app_slides_intro_subtitle"),
    icon: LOCKER_ICON,
    content: chrome.i18n.getMessage("app_slides_intro_content"),
    color: "text-indigo-400",
    video: "",
  },
  {
    title: chrome.i18n.getMessage("app_slides_step1_title"),
    icon: Pin,
    content: chrome.i18n.getMessage("app_slides_step1_content"),
    video: "https://media.abbablog.me/locker/pin.mp4",
    color: "text-emerald-400",
  },
  {
    title: chrome.i18n.getMessage("app_slides_step2_title"),
    icon: HatGlasses,
    content: chrome.i18n.getMessage("app_slides_step2_content"),
    video: "https://media.abbablog.me/locker/allowIncognito.mp4",
    color: "text-violet-400",
  },
  {
    title: chrome.i18n.getMessage("app_slides_step3_title"),
    icon: Keyboard,
    content: chrome.i18n.getMessage("app_slides_step3_content"),
    video: "https://media.abbablog.me/locker/shortcut.mp4",
    color: "text-sky-400",
  },
  {
    title: chrome.i18n.getMessage("app_slides_explore_title"),
    icon: LOCKER_ICON,
    content: chrome.i18n.getMessage("app_slides_explore_content"),
    video: "",
    isLast: true,
  },
];

const FEATURES: Features[] = [
  {
    title: chrome.i18n.getMessage("app_features_save_bookmarks_title"),
    color: "hover:text-emerald-400",
    description: chrome.i18n.getMessage(
      "app_features_save_bookmarks_description",
    ),
    icon: Save,
    video: "https://media.abbablog.me/locker/savebookmark.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_create_folders_title"),
    color: "hover:text-indigo-400",
    description: chrome.i18n.getMessage(
      "app_features_create_folders_description",
    ),
    icon: FolderPlus,
    video: "https://media.abbablog.me/locker/folders.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_incognito_mode_title"),
    color: "hover:text-violet-400",
    description: chrome.i18n.getMessage(
      "app_features_incognito_mode_description",
    ),
    icon: EyeOff,
    video: "https://media.abbablog.me/locker/incognitoShowcase.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_search_title"),
    color: "hover:text-sky-400",
    description: chrome.i18n.getMessage("app_features_search_description"),
    icon: Search,
    video: "https://media.abbablog.me/locker/search.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_fullscreen_mode_title"),
    color: "hover:text-orange-400",
    description: chrome.i18n.getMessage(
      "app_features_fullscreen_mode_description",
    ),
    icon: Monitor,
    video: "https://media.abbablog.me/locker/fullscrn.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_customize_title"),
    color: "hover:text-pink-400",
    description: chrome.i18n.getMessage("app_features_customize_description"),
    icon: Palette,
    video: "https://media.abbablog.me/locker/customize.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_import_export_title"),
    color: "hover:text-amber-400",
    description: chrome.i18n.getMessage(
      "app_features_import_export_description",
    ),
    icon: ArrowLeftRight,
    video: "https://media.abbablog.me/locker/importexport.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_import_from_browser_title"),
    color: "hover:text-blue-400",
    description: chrome.i18n.getMessage(
      "app_features_import_from_browser_description",
    ),
    icon: Download,
    video: "https://media.abbablog.me/locker/importfrombrowser.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_session_manager_title"),
    color: "hover:text-cyan-400",
    description: chrome.i18n.getMessage(
      "app_features_session_manager_description",
    ),
    icon: Layers,
    video: "https://media.abbablog.me/locker/sessionmanager.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_qr_generator_title"),
    color: "hover:text-lime-400",
    description: chrome.i18n.getMessage(
      "app_features_qr_generator_description",
    ),
    icon: QrCode,
    video: "https://media.abbablog.me/locker/qr.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_save_as_pdf_title"),
    color: "hover:text-red-400",
    description: chrome.i18n.getMessage("app_features_save_as_pdf_description"),
    icon: FileText,
    video: "https://media.abbablog.me/locker/pdf.mp4",
  },
  {
    title: chrome.i18n.getMessage("app_features_ai_summary_title"),
    color: "hover:text-fuchsia-400",
    description: chrome.i18n.getMessage("app_features_ai_summary_description"),
    icon: Sparkles,
    video: "https://media.abbablog.me/locker/aisummary.mp4",
  },
];

function SlideVideo({ src, isActive }: { src: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      // load lazily right  it becomes active, then play
      if (!el.src) el.src = src;
      el.play().catch(() => {});
    } else {
      el.pause();
      // dropping the src fully stops decode on inactive slides,
      // instead of just leaving a paused-but-still-buffered video
      el.removeAttribute("src");
      el.load();
    }
  }, [isActive, src]);

  return (
    <div className="w-[50%] aspect-video mt-6 rounded-2xl overflow-hidden border border-white/[0.06] bg-black/40">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={`${src}#t=0.001`} type="video/mp4" />
      </video>
    </div>
  );
}

export default function WelcomePage() {
  const [index, setIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Features | null>(null);
  const isAnimating = useRef(false);

  const goTo = useCallback((next: number) => {
    setIndex((current) => {
      if (isAnimating.current) return current;
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
      if (clamped === current) return current;
      isAnimating.current = true;
      setTimeout(() => {
        isAnimating.current = false;
      }, 150);
      return clamped;
    });
  }, []);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 10) return;
      goTo(index + (event.deltaY > 0 ? 1 : -1));
    },
    [index, goTo],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        goTo(index + 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        goTo(index - 1);
      }
    },
    [index, goTo],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="wrapper">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/[0.08] blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-500/[0.08] blur-[120px] rounded-full" />
      </div>

      <div onWheel={handleWheel} className="sticky">
        <motion.div
          className="track"
          style={{ willChange: "transform" }}
          animate={{ x: `-${index * 100}%` }}
          // snappier, less "floaty" spring — high stiffness + high damping
          // settles fast with almost no overshoot, reads as premium/fast
          // rather than the slow bouncy feel of low stiffness/damping
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 42,
            mass: 0.9,
          }}
        >
          {SLIDES.map((label, slideIndex) => (
            <section
              key={label.title}
              className="slide flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 32,
                  mass: 0.7,
                }}
                style={{ willChange: "transform, opacity" }}
                className={`relative flex items-center justify-center w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] ${label.color ?? "text-indigo-400"}`}
              >
                <div className="absolute inset-0 rounded-3xl bg-current opacity-[0.12] blur-2xl pointer-events-none" />
                {typeof label.icon === "string" ? (
                  <img
                    src={label.icon}
                    alt={label.title}
                    className="relative h-10 w-10 object-contain"
                  />
                ) : (
                  label.icon && (
                    <label.icon
                      size={36}
                      strokeWidth={1.5}
                      className="relative text-current"
                    />
                  )
                )}
              </motion.div>

              <h4 className="bg-gradient-to-r text-[28px] font-semibold from-[#00F0FF] to-[#B16CEA] bg-clip-text text-transparent text-center">
                {label.title}
              </h4>

              <div className="text-center">
                {label.subtitle && (
                  <p className="text-zinc-400 text-sm mb-1">{label.subtitle}</p>
                )}
                <p className="text-white/90 text-base">{label.content}</p>
              </div>

              {/* video only decodes/plays when this slide is the active one */}
              {label.video ? (
                <SlideVideo src={label.video} isActive={slideIndex === index} />
              ) : null}

              {label.isLast ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-8 w-full max-w-4xl">
                  {FEATURES.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.title}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: i * 0.02,
                          duration: 0.22,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        onClick={() => {
                          setSelectedFeature(item);
                          setModalOpen(true);
                        }}
                        style={{ willChange: "transform" }}
                        className={`group cursor-pointer relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center overflow-hidden transition-colors duration-150 hover:border-white/[0.12] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${item.color}`}
                      >
                        {/* opacity-only transition — cheapest possible property to animate */}
                        <div className="pointer-events-none absolute -top-8 -right-8 w-28 h-28 rounded-full bg-current opacity-0 blur-2xl transition-opacity duration-200 group-hover:opacity-[0.15]" />

                        {/* split transform and color into separate transitions instead of transition-all,
                            so the browser isn't watching every property for changes every frame */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-zinc-400 transition-colors duration-150 group-hover:bg-current/10 group-hover:text-current [transition:transform_150ms_cubic-bezier(0.16,1,0.3,1),color_150ms,background-color_150ms] group-hover:scale-110">
                          <Icon size={20} strokeWidth={1.75} />
                        </div>

                        <div className="relative">
                          <h4 className="text-[15px] font-medium text-white leading-tight">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-xs text-zinc-500 leading-snug line-clamp-2 transition-colors duration-150 group-hover:text-zinc-400">
                            {item.description}
                          </p>
                        </div>

                        <ArrowUpRight
                          size={14}
                          className="absolute top-4 right-4 text-zinc-600 opacity-0 -translate-y-1 translate-x-1 [transition:opacity_150ms,transform_150ms_cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0"
                        />
                      </motion.button>
                    );
                  })}
                </div>
              ) : null}
            </section>
          ))}
        </motion.div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-[width,background-color] duration-200 ${
              i === index ? "bg-white w-6" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {selectedFeature && (
        <InstructionModal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          title={selectedFeature.title}
          description={selectedFeature.description}
          video={selectedFeature.video}
          icon={selectedFeature.icon}
          color={selectedFeature.color}
        />
      )}
    </div>
  );
}
