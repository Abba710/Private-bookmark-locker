import { useState, useEffect } from "react";
import ImportDialog from "@/components/ImportExport/import";
import ExportDialog from "@/components/ImportExport/export";
import { useBookmarkStore, useFloatWidgetStore } from "@/storage/statelibrary";
import exportBookmarks from "@/features/importExport/export";
import {
  getChromeBookmarks,
  saveAllOpenTabs,
} from "@/features/bookmarks/bookmarkService";

import { FeaturesRow, type FeaturesRowProps } from "../components/featuresRow";

import {
  Upload,
  CircleQuestionMark,
  Download,
  Settings,
  Library,
  Save,
  Eye,
} from "lucide-react";

import { handleCheckPremium } from "@/util/premiumCheck";

export default function DataTools() {
  const WELCOME_URL = import.meta.env.DEV
    ? "chrome-extension://mnfekpehiijgccmpgcmecpefpofeaogj/index.html/#/welcome"
    : "chrome-extension://fagjclghcmnfinjdkdnkejodfjgkpljd/index.html#/welcome";
  // Global States
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const hidden = useFloatWidgetStore((s) => s.hidden);
  const setHidden = useFloatWidgetStore((s) => s.setHidden);

  const dataTools: FeaturesRowProps[] = [
    {
      Icon: Upload,
      label: chrome.i18n.getMessage("app_import_modal"),
      desc: chrome.i18n.getMessage("app_import_modal_desc"),
      btnTitle: chrome.i18n.getMessage("app_import_modal_btn"),
      onClick: () => {
        if (!handleCheckPremium()) return;
        setShowImport(true);
      },
    },
    {
      Icon: Download,
      label: chrome.i18n.getMessage("app_modal_export"),
      desc: chrome.i18n.getMessage("app_modal_export_desc"),
      btnTitle: chrome.i18n.getMessage("app_modal_export_btn"),
      onClick: () => {
        if (!handleCheckPremium()) return;
        setShowExport(true);
      },
    },
    {
      Icon: Settings,
      label: chrome.i18n.getMessage("app_options_hotkeys"),
      desc: chrome.i18n.getMessage("app_options_hotkeys_desc"),
      btnTitle: chrome.i18n.getMessage("app_options_hotkeys_btn"),
      onClick: () => {
        chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
      },
    },
    {
      Icon: Library,
      label: chrome.i18n.getMessage("app_options_collect"),
      onClick: getChromeBookmarks,
      desc: chrome.i18n.getMessage("app_options_collect_desc"),
      btnTitle: chrome.i18n.getMessage("app_options_collect_btn"),
    },
    {
      Icon: Save,
      label: chrome.i18n.getMessage("app_options_save_open"),
      onClick: () => {
        if (!handleCheckPremium()) return;
        saveAllOpenTabs();
      },
      desc: chrome.i18n.getMessage("app_options_save_open_desc"),
      btnTitle: chrome.i18n.getMessage("app_options_save_open_btn"),
    },
    {
      Icon: CircleQuestionMark,
      label: chrome.i18n.getMessage("app_options_faq"),
      onClick: () => window.open(WELCOME_URL),
      desc: chrome.i18n.getMessage("app_options_faq_desc"),
      btnTitle: chrome.i18n.getMessage("app_options_faq_btn"),
    },
    {
      Icon: Eye,
      label: hidden
        ? chrome.i18n.getMessage("app_options_widget_show")
        : chrome.i18n.getMessage("app_options_widget_hide"),
      onClick: () => {
        const next = !hidden;
        setHidden(next);
        chrome.storage.local.set({ widgetStatus: !next });
      },
      desc: chrome.i18n.getMessage("app_options_widget_hide_desc"),
      btnTitle: chrome.i18n.getMessage("app_options_widget_hide_btn"),
    },
  ];
  // Local UI States
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    chrome.storage.local.get("widgetStatus").then(({ widgetStatus }) => {
      if (widgetStatus === undefined) {
        chrome.storage.local.set({ widgetStatus: true });
        setHidden(false);
      } else {
        setHidden(!widgetStatus);
      }
    });

    const listener = (changes: any) => {
      if ("widgetStatus" in changes) {
        setHidden(!changes.widgetStatus.newValue);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return (
    <div className="ds-settings-section">
      <div className="ds-settings-section-title ">
        {chrome.i18n.getMessage("app_options_data_tools")}
      </div>

      <div className="bm-settings-section">
        {dataTools.map((tool) => (
          <FeaturesRow
            Icon={tool.Icon}
            label={tool.label}
            desc={tool.desc}
            btnTitle={tool.btnTitle}
            onClick={tool.onClick}
          />
        ))}
      </div>
      {/* MODALS & DIALOGS */}
      {showImport && <ImportDialog onClose={() => setShowImport(false)} />}
      {showExport && (
        <ExportDialog
          onClose={() => setShowExport(false)}
          onExport={() => {
            exportBookmarks(bookmarks);
            setShowExport(false);
          }}
        />
      )}
    </div>
  );
}
