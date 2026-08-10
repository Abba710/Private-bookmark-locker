import { Sparkles } from "lucide-react";

interface GetProButtonProps {
  onClick: () => void;
}

export default function GetProButton({ onClick }: GetProButtonProps) {
  return (
    <div className="ds-setting-row" style={{ marginTop: "var(--ds-sp-4)" }}>
      <div className="ds-setting-info">
        <div className="ds-setting-label">
          {chrome.i18n.getMessage("app_btn_get_pro_title")}
        </div>
        <div className="ds-setting-desc">
          {chrome.i18n.getMessage("app_btn_get_pro_subtitle")}
        </div>
      </div>
      <button className="btn btn--primary btn--sm" onClick={onClick}>
        <Sparkles size={13} />
        {chrome.i18n.getMessage("app_sub_explore_btn")}
      </button>
    </div>
  );
}
