import { useState, useEffect, useMemo } from "react";
import {
  Folder,
  Check,
  Save,
  SlidersHorizontal,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";

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

const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));
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
      className="ds-toggle-btn"
    >
      <span className="ds-toggle-text">
        <span className="ds-toggle-label ds-text-secondary">{label}</span>
        {hint && (
          <span className="ds-toggle-hint ds-text-tertiary">{hint}</span>
        )}
      </span>
      <span
        className={`ds-toggle-track${checked ? " ds-toggle-track--on" : ""}`}
      >
        <span className="ds-toggle-thumb" />
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

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  disabled,
}: SliderRowProps) {
  return (
    <div
      className={`ds-slider-row${disabled ? " ds-slider-row--disabled" : ""}`}
    >
      <div className="ds-slider-head">
        <span className="ds-slider-label">{label}</span>
        <span className="ds-slider-value">{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange(Number((e.currentTarget as HTMLInputElement).value))
        }
        className="ds-range"
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
    <div className="ds-metric">
      <span className="ds-metric-label">{label}</span>
      <span className="ds-metric-value">{value}</span>
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

function isFolderMetrics(
  m: FolderMetrics | BookmarkMetrics,
): m is FolderMetrics {
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
    <div className="ds-control-card">
      <div className="ds-control-card-header">
        <div className="ds-control-card-icon">
          <Icon className="icon--primary ds-icon-sm" />
        </div>
        <span className="ds-control-card-title">{title}</span>
      </div>

      <SliderRow
        label={chrome.i18n.getMessage("app_setting_row_height")}
        value={height}
        min={HEIGHT_MIN}
        max={HEIGHT_MAX}
        onChange={onHeightChange}
      />

      <div className="ds-control-card-metrics">
        {isFolderMetrics(metrics) ? (
          <>
            <MetricBadge
              label={chrome.i18n.getMessage("app_setting_font")}
              value={`${metrics.font}px`}
            />
            <MetricBadge
              label={chrome.i18n.getMessage("app_setting_icon")}
              value={`${metrics.icon}px`}
            />
          </>
        ) : (
          <>
            <MetricBadge
              label={chrome.i18n.getMessage("app_setting_title")}
              value={`${metrics.titleFont}px`}
            />
            <MetricBadge
              label={chrome.i18n.getMessage("app_setting_url")}
              value={`${metrics.urlFont}px`}
            />
          </>
        )}
      </div>

      <div className="ds-control-card-toggles">
        <Toggle
          checked={iconEnabled}
          onChange={onIconToggle}
          label={chrome.i18n.getMessage("app_setting_show_icons")}
        />
        {onShowUrlToggle && (
          <Toggle
            checked={!!showUrl}
            onChange={onShowUrlToggle}
            label={chrome.i18n.getMessage("app_setting_show_url")}
            hint={chrome.i18n.getMessage("app_setting_show_URL_sub")}
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
  const [settings, setSettings] = useState<ControlsSettings>(
    initialSettings ?? DEFAULT_SETTINGS,
  );
  const [savedSettings, setSavedSettings] =
    useState<ControlsSettings>(settings);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
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
    <div className="ds-settings-panel">
      <div className="ds-settings-panel-header">
        <SlidersHorizontal className="icon--primary ds-icon-md" />
        <span className="ds-text-primary">
          {chrome.i18n.getMessage("app_setting_list_title")}
        </span>
      </div>

      <ControlCard
        icon={Folder}
        title={chrome.i18n.getMessage("app_setting_folders_title")}
        height={settings.folder.height}
        onHeightChange={(v) => updateFolder({ height: v })}
        iconEnabled={settings.folder.iconEnabled}
        onIconToggle={(v) => updateFolder({ iconEnabled: v })}
        metrics={folderMetrics}
      />

      <ControlCard
        icon={LinkIcon}
        title={chrome.i18n.getMessage("app_setting_bookmarks_title")}
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
        className={`btn btn--primary ${
          justSaved
            ? " ds-save-btn--saved"
            : isDirty
              ? " ds-save-btn--dirty"
              : ""
        }`}
      >
        {justSaved ? (
          <>
            <Check className="ds-icon-sm" />
            {chrome.i18n.getMessage("app_setting_saved")}
          </>
        ) : (
          <>
            <Save className="ds-icon-sm" />
            {chrome.i18n.getMessage("app_settings_save_settings")}
          </>
        )}
      </button>
    </div>
  );
}
