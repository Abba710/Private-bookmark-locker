import { type LucideIcon } from "lucide-react";

export interface FeaturesRowProps {
  Icon: LucideIcon;
  label: string;
  desc: string;
  btnTitle: string;
  onClick: () => void;
}

export function FeaturesRow({
  Icon,
  label,
  desc,
  btnTitle,
  onClick,
}: FeaturesRowProps) {
  return (
    <div className="ds-setting-row" style={{ marginTop: "var(--ds-sp-4)" }}>
      <div className="ds-setting-info">
        <div className="ds-setting-label">{label}</div>
        <div className="ds-setting-desc">{desc}</div>
      </div>
      <button className="btn btn--outline btn--sm" onClick={onClick}>
        <Icon size={13} />
        {btnTitle}
      </button>
    </div>
  );
}
