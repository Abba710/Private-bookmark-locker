import { useUserStore } from "@/storage/statelibrary";
import { usePremiumModalStore } from "@/storage/statelibrary";

export function usePremiumAction(action: () => void) {
  const isPremium = useUserStore((s) => s.isPremium);
  const { openPremium } = usePremiumModalStore();

  return () => {
    if (isPremium) {
      action();
    } else {
      openPremium(); // open modal
    }
  };
}
