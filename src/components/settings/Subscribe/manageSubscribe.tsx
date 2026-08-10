import { useState } from "preact/hooks";
import { Settings2 } from "lucide-react";
import { supabase } from "@/service/supabase";

export default function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenPortal = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(chrome.i18n.getMessage("app_sub_error_auth"));
      }

      const { data, error } = await supabase.functions.invoke(
        "get-portal-url",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );
      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        throw new Error(chrome.i18n.getMessage("app_sub_error_url"));
      }
    } catch (err) {
      console.error("Portal Error:", err);
      const message =
        err instanceof Error
          ? err.message
          : chrome.i18n.getMessage("app_sub_error_unknown");
      alert(`${chrome.i18n.getMessage("app_sub_error_fail")} ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const btnTitle = isLoading
    ? chrome.i18n.getMessage("app_sub_manage_btn_loading")
    : chrome.i18n.getMessage("app_sub_manage_btn");

  return (
    <div className="ds-setting-row" style={{ marginTop: "var(--ds-sp-4)" }}>
      <div className="ds-setting-info">
        <div className="ds-setting-label">
          {chrome.i18n.getMessage("app_sub_manage_title")}
        </div>
        <div className="ds-setting-desc">
          {chrome.i18n.getMessage("app_sub_manage_subtitle")}
        </div>
      </div>
      <button
        className="btn btn--outline btn--sm"
        onClick={handleOpenPortal}
        disabled={isLoading}
      >
        <Settings2 size={13} />
        {btnTitle}
      </button>
    </div>
  );
}
