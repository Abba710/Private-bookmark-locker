import {
  ArrowLeft,
  Settings,
  Palette,
  Database,
  Users,
  CreditCard,
} from "lucide-react";
import type { SettingWindow } from "@/pages/settings/types/index.ts";

interface HeaderProps {
  onBack: () => void;
  activeWindow: SettingWindow;
  setActiveWindow: React.Dispatch<React.SetStateAction<SettingWindow>>;
}

export default function Header({
  onBack,
  activeWindow,
  setActiveWindow,
}: HeaderProps) {
  return (
    <div className="ds-topbar">
      <button onClick={onBack} className="btn-icon btn-icon--outline">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className={"ds-topbar-nav"}>
        <button
          onClick={() => setActiveWindow("customize")}
          className={`btn-icon ${activeWindow == "customize" ? "btn-icon--primary" : "btn-icon--ghost"}`}
        >
          <Palette className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveWindow("data")}
          className={`btn-icon ${activeWindow == "data" ? "btn-icon--primary" : "btn-icon--ghost"}`}
        >
          <Database className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveWindow("community")}
          className={`btn-icon ${activeWindow == "community" ? "btn-icon--primary" : "btn-icon--ghost"}`}
        >
          <Users className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveWindow("billing")}
          className={`btn-icon ${activeWindow == "billing" ? "btn-icon--primary" : "btn-icon--ghost"}`}
        >
          <CreditCard className="w-5 h-5" />
        </button>
      </div>
      <div className="ds-topbar-right">
        <Settings className="icon icon--primary w-5 h-5" />
        <h1 className="ds-text-primary">
          {chrome.i18n.getMessage("app_settings_title")}
        </h1>
      </div>
    </div>
  );
}
