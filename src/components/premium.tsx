function PremiumBlock() {
  return (
    <div className="w-full px-4 py-3 mt-4 bg-white/10 rounded-2xl flex gap-3 items-start">
      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
        <span className="text-yellow-500 text-lg">👑</span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-white text-sm font-semibold leading-none">
          Get Premium Features
        </h3>
        <p className="text-white/60 text-xs leading-snug">
          Try new experiences with premium features.
        </p>
        <button className="px-3 py-1.5 bg-white text-black rounded-xl text-sm font-medium mt-1">
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}

export default PremiumBlock;
