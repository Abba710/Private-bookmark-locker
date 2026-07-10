import { useState, useEffect, useMemo } from "react";
import { Folder, Check, Save, SlidersHorizontal, Link as LinkIcon, type LucideIcon } from "lucide-react";

/* ---------------------------------------------------------------
   Base proportions derived from the existing FolderExample / BookmarkExample:
   Folder:   padding-y 4px*2 + icon 24px  → row ≈ 32px, font 12px
   Bookmark: padding-y 4px*2 + text stack (15+2+10) ≈ 27px → row ≈ 34px
             title 12px, url 10px
   All derived sizes scale proportionally from these base numbers.
------------------------------------------------------------------ */

export interface FolderRowSettings {
  height: number;
  iconEnabled: boolean;
}

export interface BookmarkRowSettings {
  height: number;
  iconEnabled: boolean;
  showUrl: boolean;
}

export interface ControlsSettings {
  folder: FolderRowSettings;
  bookmark: BookmarkRowSettings;
}

export interface FolderMetrics {
  icon: number;
  font: number;
  actionIcon: number;
  dragIcon: number;
}

export interface BookmarkMetrics {
  icon: number;
  titleFont: number;
  urlFont: number;
  actionIcon: number;
  dragIcon: number;
}

interface SizeBase {
  height: number;
  icon: number;
  actionIcon: number;
  dragIcon: number;
}

const FOLDER_BASE: SizeBase & { font: number } = {
  height: 34,
  icon: 24,
  font: 12,
  actionIcon: 14,
  dragIcon: 12,
};
const BOOKMARK_BASE: SizeBase & { titleFont: number; urlFont: number } = {
  height: 34,
  icon: 24,
  titleFont: 12,
  urlFont: 10,
  actionIcon: 14,
  dragIcon: 12,
};

const HEIGHT_MIN = 24;
const HEIGHT_MAX = 56;

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
const round1 = (v: number): number => Math.round(v * 10) / 10;

export function computeFolderMetrics(height: number): FolderMetrics {
  const scale = height / FOLDER_BASE.height;
  return {
    icon: clamp(Math.round(FOLDER_BASE.icon * scale), 14, 34),
    font: clamp(round1(FOLDER_BASE.font * scale), 9, 18),
    actionIcon: clamp(Math.round(FOLDER_BASE.actionIcon * scale), 10, 20),
    dragIcon: clamp(Math.round(FOLDER_BASE.dragIcon * scale), 8, 16),
  };
}

export function computeBookmarkMetrics(height: number): BookmarkMetrics {
  const scale = height / BOOKMARK_BASE.height;
  return {
    icon: clamp(Math.round(BOOKMARK_BASE.icon * scale), 14, 34),
    titleFont: clamp(round1(BOOKMARK_BASE.titleFont * scale), 9, 18),
    urlFont: clamp(round1(BOOKMARK_BASE.urlFont * scale), 8, 14),
    actionIcon: clamp(Math.round(BOOKMARK_BASE.actionIcon * scale), 10, 20),
    dragIcon: clamp(Math.round(BOOKMARK_BASE.dragIcon * scale), 8, 16),
  };
}

export const DEFAULT_SETTINGS: ControlsSettings = {
  folder: { height: FOLDER_BASE.height, iconEnabled: true },
  bookmark: { height: BOOKMARK_BASE.height, iconEnabled: true, showUrl: true },
};

/* ---------------------------- UI primitives ---------------------------- */

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}

function Toggle({ checked, onChange, label, hint, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="flex items-center justify-between w-full py-1 group"
      style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? "default" : "pointer" }}
    >
      <span className="flex flex-col items-start">
        <span style={{ fontSize: 11 }} className="text-gray-300 font-semibold select-none">
          {label}
        </span>
        {hint && (
          <span style={{ fontSize: 10 }} className="text-gray-500 select-none">
            {hint}
          </span>
        )}
      </span>
      <span
        style={{
          width: 30,
          height: 16,
          borderRadius: 999,
          flexShrink: 0,
          background: checked ? "rgba(129,140,248,0.85)" : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.08)",
          position: "relative",
          transition: "background 0.2s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 1,
            left: checked ? 15 : 1,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: "#fff",
            transition: "left 0.2s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
          }}
        />
      </span>
    </button>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function SliderRow({ label, value, min, max, onChange, disabled }: SliderRowProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full" style={{ opacity: disabled ? 0.4 : 1 }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 11 }} className="text-gray-300 font-semibold select-none">
          {label}
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "ui-monospace, monospace",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
          className="text-gray-300 px-1.5 py-0.5 rounded"
        >
          {value}px
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number((e.currentTarget as HTMLInputElement).value))}
        style={{ width: "100%", height: 4, accentColor: "#818cf8" }}
      />
    </div>
  );
}

interface MetricBadgeProps {
  label: string;
  value: string;
}

function MetricBadge({ label, value }: MetricBadgeProps) {
  return (
    <div
      className="flex items-center justify-between px-2 py-1 rounded"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span style={{ fontSize: 10 }} className="text-gray-500 select-none">
        {label}
      </span>
      <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }} className="text-indigo-300">
        {value}
      </span>
    </div>
  );
}

/* --------------------------------- Card --------------------------------- */

interface ControlCardProps {
  icon: LucideIcon;
  title: string;
  height: number;
  onHeightChange: (value: number) => void;
  iconEnabled: boolean;
  onIconToggle: (value: boolean) => void;
  showUrl?: boolean;
  onShowUrlToggle?: (value: boolean) => void;
  metrics: FolderMetrics | BookmarkMetrics;
}

function isFolderMetrics(m: FolderMetrics | BookmarkMetrics): m is FolderMetrics {
  return "font" in m;
}

function ControlCard({
  icon: Icon,
  title,
  height,
  onHeightChange,
  iconEnabled,
  onIconToggle,
  showUrl,
  onShowUrlToggle,
  metrics,
}: ControlCardProps) {
  return (
    <div
      className="flex flex-col gap-3 p-3 rounded-lg"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Icon className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <span style={{ fontSize: 12 }} className="text-white font-semibold">
          {title}
        </span>
      </div>

      <SliderRow label={chrome.i18n.getMessage('app_setting_row_height')} value={height} min={HEIGHT_MIN} max={HEIGHT_MAX} onChange={onHeightChange} />

      <div className="grid grid-cols-2 gap-1.5">
        {isFolderMetrics(metrics) ? (
          <>
            <MetricBadge label={chrome.i18n.getMessage('app_setting_font')} value={`${metrics.font}px`} />
            <MetricBadge label={chrome.i18n.getMessage('app_setting_icon')} value={`${metrics.icon}px`} />
          </>
        ) : (
          <>
            <MetricBadge label={chrome.i18n.getMessage('app_setting_title')} value={`${metrics.titleFont}px`} />
            <MetricBadge label={chrome.i18n.getMessage('app_setting_url')} value={`${metrics.urlFont}px`} />
          </>
        )}
      </div>

      <div className="flex flex-col gap-0.5 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <Toggle checked={iconEnabled} onChange={onIconToggle} label={chrome.i18n.getMessage('app_setting_show_icons')} />
        {onShowUrlToggle && (
          <Toggle
            checked={!!showUrl}
            onChange={onShowUrlToggle}
            label={chrome.i18n.getMessage('app_setting_show_url')}
            hint={chrome.i18n.getMessage('app_setting_show_URL_sub')}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Main export ------------------------------ */

export interface BookmarkFolderControlsProps {
  /** Settings to start from. Defaults to DEFAULT_SETTINGS if omitted. */
  initialSettings?: ControlsSettings;
  /** Fires on every change (slider drag, toggle click) — use this to drive a live preview. */
  onChange?: (settings: ControlsSettings) => void;
  /** Called with the full settings object only when the user clicks Save — use this to persist. */
  onSave?: (settings: ControlsSettings) => void;
}

export default function BookmarkFolderControls({
  initialSettings,
  onChange,
  onSave,
}: BookmarkFolderControlsProps) {
  const [settings, setSettings] = useState<ControlsSettings>(initialSettings ?? DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<ControlsSettings>(settings);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  useEffect(() => {
    onChange?.(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 1800);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const folderMetrics = computeFolderMetrics(settings.folder.height);
  const bookmarkMetrics = computeBookmarkMetrics(settings.bookmark.height);

  const updateFolder = (patch: Partial<FolderRowSettings>) =>
    setSettings((s) => ({ ...s, folder: { ...s.folder, ...patch } }));

  const updateBookmark = (patch: Partial<BookmarkRowSettings>) =>
    setSettings((s) => ({ ...s, bookmark: { ...s.bookmark, ...patch } }));

  const handleSave = () => {
    setSavedSettings(settings);
    setJustSaved(true);
    onSave?.(settings);
  };

  return (
    <div
      className="w-full max-w-md flex flex-col gap-3 p-3 rounded-xl"
      style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-2 px-1">
        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
        <span style={{ fontSize: 12 }} className="text-white font-semibold">
          {chrome.i18n.getMessage('app_setting_list_title')}
        </span>
      </div>

      <ControlCard
        icon={Folder}
        title={chrome.i18n.getMessage('app_setting_folders_title')}
        height={settings.folder.height}
        onHeightChange={(v) => updateFolder({ height: v })}
        iconEnabled={settings.folder.iconEnabled}
        onIconToggle={(v) => updateFolder({ iconEnabled: v })}
        metrics={folderMetrics}
      />

      <ControlCard
        icon={LinkIcon}
        title={chrome.i18n.getMessage('app_setting_bookmarks_title')}
        height={settings.bookmark.height}
        onHeightChange={(v) => updateBookmark({ height: v })}
        iconEnabled={settings.bookmark.iconEnabled}
        onIconToggle={(v) => updateBookmark({ iconEnabled: v })}
        showUrl={settings.bookmark.showUrl}
        onShowUrlToggle={(v) => updateBookmark({ showUrl: v })}
        metrics={bookmarkMetrics}
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty && !justSaved}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-md transition-colors"
        style={{
          fontSize: 11,
          fontWeight: 600,
          background: justSaved
            ? "rgba(74,222,128,0.15)"
            : isDirty
            ? "rgba(129,140,248,0.15)"
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${
            justSaved ? "rgba(74,222,128,0.3)" : isDirty ? "rgba(129,140,248,0.3)" : "rgba(255,255,255,0.06)"
          }`,
          color: justSaved ? "#4ade80" : isDirty ? "#a5b4fc" : "#6b7280",
          cursor: isDirty ? "pointer" : "default",
        }}
      >
        {justSaved ? (
          <>
            <Check className="w-3.5 h-3.5" />
            {chrome.i18n.getMessage('app_setting_saved')}
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5" />
            {chrome.i18n.getMessage('app_settings_save_settings')}
          </>
        )}
      </button>
    </div>
  );
}
