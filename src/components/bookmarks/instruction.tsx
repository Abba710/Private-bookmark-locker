import { Bookmark, CircleQuestionMark } from "lucide-react";

interface InstructionsProps {
  isIncognito: boolean;
}

function Instructions({ isIncognito }: InstructionsProps) {
  return (
    <div className="ds-card !rounded-none" style={{ width: "100%" }}>
      <div className="ds-empty">
        <div className="ds-empty-icon">
          <Bookmark size={24} />
        </div>
        <h3 className="ds-empty-title">No bookmarks yet</h3>
        <p className="ds-empty-desc">
          {isIncognito
            ? "You haven't saved any bookmarks in incognito mode yet. Save your first one or read the FAQ to get started."
            : "You haven't saved any bookmarks yet. Save your first one or read the FAQ to get started."}
        </p>
        <button
          className="btn btn--primary"
          style={{ marginTop: "var(--ds-sp-2)" }}
        >
          <CircleQuestionMark size={14} />{" "}
          {chrome.i18n.getMessage("app_options_faq")}
        </button>
      </div>
    </div>
  );
}

export default Instructions;
