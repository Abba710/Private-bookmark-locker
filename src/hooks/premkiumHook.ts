import { usePremiumModalStore } from "@/storage/statelibrary";

export function usePremiumAction(action: () => void) {
  const isPremium = false;
  const { openPremium } = usePremiumModalStore();

  return () => {
    if (isPremium) {
      action();
    } else {
      openPremium(); // open modal
    }
  };
}
