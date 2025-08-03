import { useUserProfileStore } from '@/storage/statelibrary'
import { usePremiumModalStore } from '@/storage/statelibrary'

export function usePremiumAction(action: () => void) {
  const isPremium = useUserProfileStore((s) => s.isPremium)
  const { openPremium } = usePremiumModalStore()

  return () => {
    if (isPremium) {
      action()
    } else {
      openPremium() // open modal
    }
  }
}
