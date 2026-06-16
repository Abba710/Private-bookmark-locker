import { useRef, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BookmarkPlus, EyeOff, PanelRight } from 'lucide-react'
import { useFloatWidgetStore } from '@/storage/statelibrary'

// ── Types ────────────────────────────────────────────────────────────────────
interface ActionButton {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'primary' | 'danger'
}

// ── Widget ───────────────────────────────────────────────────────────────────
function FloatingWidget() {
  const hidden = useFloatWidgetStore((s) => s.hidden)
  const setHidden = useFloatWidgetStore((s) => s.setHidden)

  // ── Action stubs ─────────────────────────────────────────────────────────────
  const handleOpenSidePanel = () => {
    chrome.runtime.sendMessage({ action: 'open_sidepanel' })
  }
  const handleSavePage = () => {
    chrome.runtime.sendMessage({ action: 'save_tab' })
  }

  const handleHide = () => {
    setExpanded(false)
    setHidden(true)
    chrome.storage.local.set({ widgetStatus: false })
  }

  useEffect(() => {
    chrome.storage.local.get('widgetStatus').then(({ widgetStatus }) => {
      if (widgetStatus === undefined) {
        chrome.storage.local.set({ widgetStatus: true })
        setHidden(false)
      } else {
        setHidden(!widgetStatus)
      }
    })

    const listener = (changes: any) => {
      if ('widgetStatus' in changes) {
        setHidden(!changes.widgetStatus.newValue)
      }
    }

    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  const [expanded, setExpanded] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const iconUrl = chrome.runtime.getURL('images/icon48.png')

  if (hidden) return null

  // Only the trigger opens the panel
  const onTriggerEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setExpanded(true)
  }

  // Leaving trigger OR panel starts close countdown
  const onLeave = () => {
    leaveTimer.current = setTimeout(() => setExpanded(false), 150)
  }

  // Entering the panel cancels the countdown
  const onPanelEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }

  const buttons: ActionButton[] = [
    {
      icon: <PanelRight size={14} strokeWidth={1.8} />,
      label: 'Open side panel',
      onClick: handleOpenSidePanel,
    },
    {
      icon: <BookmarkPlus size={14} strokeWidth={1.8} />,
      label: 'Save page',
      onClick: handleSavePage,
      variant: 'primary',
    },
    {
      icon: <EyeOff size={13} strokeWidth={1.8} />,
      label: 'Hide widget',
      onClick: handleHide,
      variant: 'danger',
    },
  ]

  return (
    <>
      <style>{CSS}</style>

      {/* lk-wrap is pointer-events:none — пустое пространство между кнопками не триггерит hover */}
      <div className="lk-wrap">
        {/* Panel — hover сюда отменяет закрытие */}
        <div
          className={`lk-panel${expanded ? ' lk-panel--open' : ''}`}
          onMouseEnter={onPanelEnter}
          onMouseLeave={onLeave}
        >
          {buttons.map((btn, i) => (
            <button
              key={btn.label}
              className={`lk-action lk-action--${btn.variant ?? 'default'}`}
              style={
                expanded
                  ? { transitionDelay: `${i * 45}ms` }
                  : { transitionDelay: '0ms' }
              }
              onClick={btn.onClick}
            >
              <span className="lk-action-icon">{btn.icon}</span>
              <span className="lk-action-label">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Trigger — единственная точка входа */}
        <button
          className={`lk-trigger${expanded ? ' lk-trigger--open' : ''}`}
          onMouseEnter={onTriggerEnter}
          onMouseLeave={onLeave}
          onClick={() => setExpanded((v) => !v)}
          aria-label="Locker"
        >
          <img src={iconUrl} width={18} height={18} alt="" />
        </button>
      </div>
    </>
  )
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lk-wrap {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    /* пустое пространство враппера НЕ реагирует на hover */
    pointer-events: none;
  }
  /* только реальные интерактивные элементы получают pointer-events */
  .lk-trigger,
  .lk-panel--open .lk-action {
    pointer-events: auto;
  }

  /* ── Trigger ── */
  .lk-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 10px 0 0 10px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-right: none;
    background: #16161e;
    cursor: pointer;
    outline: none;
    transition: background 0.15s, border-color 0.15s, transform 0.12s;
    box-shadow: -2px 0 12px rgba(0, 0, 0, 0.5);
  }
  .lk-trigger img {
    border-radius: 4px;
    opacity: 0.8;
    transition: opacity 0.15s;
  }
  .lk-trigger:hover,
  .lk-trigger--open {
    background: #1e1e2a;
    border-color: rgba(99, 102, 241, 0.35);
  }
  .lk-trigger:hover img,
  .lk-trigger--open img { opacity: 1; }
  .lk-trigger:active { transform: scale(0.93); }

  /* ── Panel ── */
  .lk-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
    /* панель сама по себе не получает pointer-events — только кнопки внутри */
    pointer-events: none;
  }
  .lk-panel--open {
    pointer-events: auto;
  }

  /* ── Action buttons ── */
  .lk-action {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 12px 0 10px;
    border-radius: 9px 0 0 9px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-right: none;
    background: #16161e;
    color: rgba(148, 163, 184, 0.85);
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
    cursor: pointer;
    outline: none;
    overflow: hidden;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.4);
    opacity: 0;
    transform: translateX(8px);
    transition:
      opacity 0.15s ease,
      transform 0.15s ease,
      background 0.13s,
      color 0.13s,
      border-color 0.13s;
  }
  .lk-panel--open .lk-action {
    opacity: 1;
    transform: translateX(0);
  }

  .lk-action::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0);
    transition: background 0.13s;
    pointer-events: none;
  }
  .lk-action:hover::before { background: rgba(255, 255, 255, 0.04); }

  .lk-action:hover {
    background: #1e1e2a;
    border-color: rgba(255, 255, 255, 0.12);
    color: rgba(226, 232, 240, 0.95);
  }
  .lk-action:active { transform: scale(0.97) !important; }

  /* primary */
  .lk-action--primary {
    border-color: rgba(99, 102, 241, 0.22);
    color: rgba(165, 180, 252, 0.9);
  }
  .lk-action--primary:hover {
    background: #1a1a2e;
    border-color: rgba(99, 102, 241, 0.45);
    color: #c7d2fe;
  }

  /* danger */
  .lk-action--danger { color: rgba(100, 116, 139, 0.65); }
  .lk-action--danger:hover {
    background: #1e1616;
    border-color: rgba(239, 68, 68, 0.2);
    color: rgba(252, 165, 165, 0.8);
  }

  .lk-action-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    opacity: 0.7;
    transition: opacity 0.13s;
  }
  .lk-action:hover .lk-action-icon { opacity: 1; }
  .lk-action-label { line-height: 1; }
`

// ── Shadow DOM mount ──────────────────────────────────────────────────────────
function mount() {
  if (document.getElementById('lk-host')) return

  const host = document.createElement('div')
  host.id = 'lk-host'
  host.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483647;pointer-events:none;'
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })
  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  createRoot(mountPoint).render(<FloatingWidget />)
}

mount()
