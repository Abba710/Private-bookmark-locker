import { useState } from "preact/hooks";

function UserHeader() {
  const [open, setOpen] = useState(false);

  const isPremium = false;

  return (
    <div className="relative flex items-center justify-between w-full h-[40px] px-4 bg-white/10 rounded-[16px]">
      {/* Plan status indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isPremium ? "bg-green-400" : "bg-blue-400"
          }`}
        />
        <span className="text-white text-xs font-medium">
          {isPremium ? "Premium Plan" : "Free Plan"}
        </span>
      </div>

      {/* Settings/Options button */}
      <button
        className="w-6 h-6 rounded-lg bg-white/20 text-white flex items-center justify-center text-xs hover:bg-white/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        ⚙️
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute top-full right-4 mt-1 w-[140px] bg-white/10 backdrop-blur-sm rounded-xl shadow-lg text-xs text-white overflow-hidden z-10">
          {!isPremium && (
            <button className="w-full px-3 py-2 text-left hover:bg-white/20 transition-colors">
              Upgrade to Premium
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default UserHeader;
