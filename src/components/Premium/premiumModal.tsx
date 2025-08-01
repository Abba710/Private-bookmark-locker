import { usePremiumModalStore } from "@/storage/statelibrary";

export default function PremiumModal() {
  const { premiumOpen, closePremium } = usePremiumModalStore();

  if (!premiumOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      {/* Modal container */}
      <div className="relative w-80 bg-white/10 rounded-2xl p-5 text-white shadow-xl animate-scaleIn">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-white/50 hover:text-white transition"
          onClick={closePremium}
        >
          ✕
        </button>

        {/* Icon */}
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3">
          <span className="text-yellow-500 text-2xl">👑</span>
        </div>

        {/* Title & description */}
        <h3 className="text-center text-base font-semibold mb-1">
          Get Premium Features
        </h3>
        <p className="text-center text-white/60 text-sm mb-4">
          Unlock exclusive features and enjoy an enhanced experience.
        </p>

        {/* Upgrade button */}
        <button className="w-full bg-white text-black rounded-xl py-2 font-medium text-sm mb-2 hover:bg-white/90 transition">
          Upgrade Plan
        </button>

        {/* Secondary link */}
        <button
          className="w-full text-xs text-white/50 hover:text-white transition"
          onClick={() => {
            closePremium(); // ✅ Only closes modal
          }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
