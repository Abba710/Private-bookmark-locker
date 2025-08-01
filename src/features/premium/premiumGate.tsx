import { usePremiumModalStore } from "@/storage/statelibrary";
import { useUserStore } from "@/storage/statelibrary";
import { cloneElement, isValidElement } from "preact/compat";
import type { VNode } from "preact";

export function PremiumGate({
  children,
  action,
}: {
  children: preact.ComponentChildren;
  action: () => void;
}) {
  const isPremium = useUserStore((s) => s.isPremium);
  const { openPremium } = usePremiumModalStore();

  const handleClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPremium) {
      action();
    } else {
      openPremium();
    }
  };

  // Проверяем, что children существует и это валидный VNode
  if (children && isValidElement(children)) {
    const child = children as VNode<any>;
    const originalClassName = child.props?.className || "";
    const isSquareButton = originalClassName.includes("w-10 h-10");

    // Для квадратных кнопок используем абсолютное позиционирование
    if (isSquareButton && !isPremium) {
      return (
        <div className="relative inline-block">
          {cloneElement(child, {
            ...child.props,
            onClick: handleClick,
          })}
          <span className="absolute -top-1 -right-1 text-yellow-400 text-xs">
            👑
          </span>
        </div>
      );
    }

    // Для обычных кнопок клонируем и добавляем корону внутрь
    return cloneElement(child, {
      ...child.props,
      onClick: handleClick,
      children: (
        <>
          {child.props?.children}
          {!isPremium && (
            <span className="text-yellow-400 text-base ml-auto pl-2 flex-shrink-0">
              👑
            </span>
          )}
        </>
      ),
    });
  }

  // Fallback для других случаев (текст, множественные дети и т.д.)
  return (
    <div className="relative w-full cursor-pointer" onClick={handleClick}>
      {children}
      {!isPremium && (
        <span className="absolute top-1/2 right-2 transform -translate-y-1/2 text-yellow-400 text-base">
          👑
        </span>
      )}
    </div>
  );
}
