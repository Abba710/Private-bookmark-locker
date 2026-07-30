import OptionsPanel from "@/components/optionsPanel";
import SupportDialog from "@/components/Support/supportModal";
import PhDialog from "@/components/promotepanel";
import { useNavigate } from "react-router-dom";
import useSubscription from "@/hooks/useSubscribe";
import { useAuth } from "@/hooks/useAuth";
import UpgradeToProModal from "@/components/premium/premiumModal";
import {
  BookmarkExample,
  FolderExample,
  Controls,
} from "@/components/settings/bookmarks";
import {
  DEFAULT_SETTINGS,
  type ControlsSettings,
} from "@/components/settings/bookmarks/controls.tsx";
import { useEffect, useState } from "react";
import { Header } from "@/pages/settings/components/index.ts";
import type { SettingWindow } from "@/pages/settings/types/index.ts";

export const SETTINGS_STORAGE_KEY = "rowSettings";

export default function SettingsPage() {
  const [activeWindow, setActiveWindow] = useState<SettingWindow>("customize");

  const auth = useAuth();
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();

  const [saved, setSaved] = useState<ControlsSettings>(DEFAULT_SETTINGS);
  const [live, setLive] = useState<ControlsSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(SETTINGS_STORAGE_KEY, (res) => {
      const initial = res[SETTINGS_STORAGE_KEY] ?? DEFAULT_SETTINGS;
      setSaved(initial);
      setLive(initial); // preview starts in sync with what's persisted
      setLoaded(true);
    });
  }, []);

  const handleSave = (settings: ControlsSettings) => {
    setSaved(settings);
    chrome.storage.sync.set({ [SETTINGS_STORAGE_KEY]: settings });
  };

  return (
    <div className="settings">
      {/* Header */}
      <Header
        onBack={() => navigate("/")}
        activeWindow={activeWindow}
        setActiveWindow={setActiveWindow}
      />

      {/* Content */}
      <div className="w-full h-full !rounded-none overflow-y-auto">
        <div className=" w-full space-y-4">
          {activeWindow === "customize" && (
            <div className="w-full gap-2 border border-white/5 bg-[var(--ds-s1)] p-4">
              {loaded && (
                <>
                  <div className={"mb-2"}>
                    <FolderExample
                      settings={live.folder}
                      name="Work"
                      count={12}
                    />
                    <BookmarkExample
                      settings={live.bookmark}
                      name="GitHub"
                      url="github.com"
                    />
                  </div>
                  <Controls
                    initialSettings={saved}
                    onChange={setLive}
                    onSave={handleSave}
                  />
                </>
              )}
            </div>
          )}

          {activeWindow === "data" && (
            <div className="border border-white/5 bg-white/[0.02] p-4">
              <OptionsPanel />
            </div>
          )}
          <SupportDialog />
          <PhDialog />

          {/* Modals */}
          <UpgradeToProModal
            upgrade={refreshSubscription} // Trigger re-check after payment
            logIn={auth.signInWithGoogle}
          />
        </div>
      </div>
    </div>
  );
}
