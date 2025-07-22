import { useState } from "react";

function UserHeader() {
  const [open, setOpen] = useState(false);

  return (
    // Wrapper container with relative positioning for dropdown
    <div className="relative flex items-center justify-between w-full h-[60px] p-3 bg-white/10 rounded-[16px]">
      {/* Left side: avatar and user info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-white" />
        <div className="flex flex-col justify-center">
          <h1 className="font-medium text-white text-sm leading-none">
            User name
          </h1>
          <h2 className="text-white text-xs opacity-70 leading-none">
            Free plan
          </h2>
        </div>
      </div>

      {/* Dropdown toggle button */}
      <button
        className="min-w-8 min-h-8 rounded-xl bg-white/20 text-white flex text-xs items-center justify-center"
        onClick={() => setOpen(!open)}
      >
        🔻
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute top-[100%] right-0 mt-2 w-[160px] bg-white/10 backdrop-blur-sm rounded-xl shadow-lg text-sm text-white overflow-hidden z-10">
          <button className="w-full px-4 py-2 text-left hover:bg-white/20">
            Upgrade Plan
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-white/20">
            Change Account
          </button>
        </div>
      )}
    </div>
  );
}

export default UserHeader;
