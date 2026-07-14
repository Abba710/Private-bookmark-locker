import { useState, useEffect } from 'preact/hooks'
import { X, HandCoins } from 'lucide-react'

export default function Affiliate() {
  const AFFILIATE_KEY = 'AFFILIATE'

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      chrome.storage.local.get(AFFILIATE_KEY, (result) => {
        const value = result[AFFILIATE_KEY]

        if (value === undefined) {
          chrome.storage.local.set({
            [AFFILIATE_KEY]: true,
          })

          setVisible(true)
          return
        }

        setVisible(value)
      })
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const closeBanner = (e: MouseEvent) => {
    e.stopPropagation()

    chrome.storage.local.set({
      [AFFILIATE_KEY]: false,
    })

    setVisible(false)
  }

  const openAffiliate = () => {
    chrome.tabs.create({
      url: 'https://abba4game.lemonsqueezy.com/affiliates?utm_source=aff_flow',
    })
  }

  if (!visible) return null

  return (
    <div
      onClick={openAffiliate}
      className="
        fixed
        bottom-1
        left-4
        right-4
        cursor-pointer
        rounded-xl
        border border-white/10
        bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
        px-4
        py-3
        text-white
        shadow-xl
        shadow-indigo-500/25
        transition-all
        duration-300
        hover:-translate-y-1
        hover:bottom-14
        hover:scale-[1.02]
        hover:shadow-2xl
        group
      "
    >
      <button
        onClick={closeBanner}
        className="
          absolute
          top-2
          right-2
          cursor-pointer
          rounded-full
          p-1
          transition-colors
          hover:bg-white/10
        "
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-white/15 p-2">
          <HandCoins className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <div className="text-base font-semibold">
            {chrome.i18n.getMessage('app_affiliate_title')}
          </div>

          <div className="text-sm text-white/80">
            {chrome.i18n.getMessage('app_affiliate_description')}
          </div>
        </div>
      </div>
    </div>
  )
}
