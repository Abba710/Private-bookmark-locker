const options = [
  { label: "Import", icon: "📥", premium: true },
  { label: "Export", icon: "📤", premium: true },
  { label: "Settings", icon: "⚙️", premium: true },
  { label: "FAQ", icon: "❓", premium: false },
];

function OptionsPanel() {
  return (
    <div className="w-full px-4 py-3 bg-white/10 rounded-2xl flex flex-col gap-2 ">
      {options.map((opt, index) => (
        <div
          key={index}
          className="flex items-center justify-between text-white/90 text-sm"
        >
          <div className="flex items-center gap-2">
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </div>
          {opt.premium && <span className="text-white/40">👑</span>}
        </div>
      ))}
    </div>
  );
}

export default OptionsPanel;
