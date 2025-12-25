import {
  usePremiumModalStore,
  useSubscribePlanStore,
} from '@/storage/statelibrary'

export function handleCheckPremium() {
  const { isPro } = useSubscribePlanStore.getState()

  if (!isPro) {
    usePremiumModalStore.getState().setPremiumModalOpen(true)
    return false
  }

  return true
}
