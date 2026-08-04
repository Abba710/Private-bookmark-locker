import type { ContextMenuProps } from "@/components/contextMenu/contextTypes";
import { useEffect, useRef, useState } from "preact/hooks";
import { useContextModalStore } from "@/components/contextMenu/contextMenuStore";
import { openBookmarkGroup } from "@/components/contextMenu/features/openInGroup";
import exportToPDF from "@/components/contextMenu/features/downloadPdf";
import {
  Copy,
  QrCode,
  FileDown,
  Sparkles,
  Layers,
  XCircle,
  Save,
} from "lucide-react";
import { handleCheckPremium } from "@/util/premiumCheck";
import { saveInCurrentFolder } from "@/components/contextMenu/features/saveInCurrentFolder";

/**
 * ContextMenu component refined for Modern Dark SaaS look.
 * Features:
 * 1. Glassmorphism background (#0f0f11/90 with blur).
 * 2. Icons for every action for better scannability.
 * 3. Smooth entrance animation.
 * 4. Automatic positioning to prevent screen overflow.
 */

export function ContextMenu({ bookmark, position, onClose }: ContextMenuProps) {
  const { setQrModalOpen, setSelectedBookmark } = useContextModalStore();
  const menuRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState(position);

  // Define menu items with icons to match the Premium Modal look
  const linkMenuItems = [
    {
      label: chrome.i18n.getMessage("app_context_copy_link"),
      icon: <Copy className="w-3.5 h-3.5" />,
      action: () => {
        if (bookmark.url) navigator.clipboard.writeText(bookmark.url);
      },
    },
    {
      label: chrome.i18n.getMessage("app_context_qr_code"),
      icon: <QrCode className="w-3.5 h-3.5" />,
      action: () => {
        if (!handleCheckPremium()) return;

        setQrModalOpen(true);
        setSelectedBookmark(bookmark);
      },
    },
    {
      label: chrome.i18n.getMessage("app_context_download_pdf"),
      icon: <FileDown className="w-3.5 h-3.5" />,
      action: async () => {
        if (!handleCheckPremium()) return;

        if (bookmark.url) exportToPDF(bookmark.url);
      },
    },
    {
      label: chrome.i18n.getMessage("app_context_ai_summary"),
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
      action: () => {
        if (!handleCheckPremium()) return;

        window.open(
          `https://chat.openai.com/?q=Summary%20` + bookmark.url,
          "_blank",
        );
      },
    },
  ];

  const folderMenuItems = [
    {
      label: chrome.i18n.getMessage("app_context_save_in_current_folder"),
      icon: <Save className="w-3.5 h-3.5 text-indigo-400" />,
      action: async () => await saveInCurrentFolder(bookmark),
    },
    {
      label: chrome.i18n.getMessage("app_context_open_group"),
      icon: <Layers className="w-3.5 h-3.5 text-indigo-400" />,
      action: async () => await openBookmarkGroup(bookmark),
    },
  ];

  // Add a Close action to all menus with a separator look
  const commonTailItems = [
    {
      label: chrome.i18n.getMessage("app_context_close_menu"),
      icon: <XCircle className="w-3.5 h-3.5 text-gray-500" />,
      action: () => onClose(),
    },
  ];

  const menuItems = [
    ...(bookmark.isFolder ? folderMenuItems : linkMenuItems),
    ...commonTailItems,
  ];

  // Adjust menu position to prevent overflow
  useEffect(() => {
    const menuWidth = 200;
    const menuHeight = menuItems.length * 38; // Approximate height per item

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const x =
      position.x + menuWidth > screenW ? screenW - menuWidth - 12 : position.x;

    const y =
      position.y + menuHeight > screenH
        ? screenH - menuHeight - 12
        : position.y;

    setPos({ x, y });
  }, [position, menuItems.length]);

  // Close menu on any click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [onClose]);

  return (
    <ul
      ref={menuRef}
      className={"ds-context-menu"}
      style={{ top: pos.y, left: pos.x }}
    >
      {menuItems.map((item) => (
        <button
          className="ds-context-item"
          onClick={() => {
            item.action?.();
            onClose();
          }}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </ul>
  );
}

export default ContextMenu;
