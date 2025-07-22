import { useDraggable } from "@dnd-kit/core";
import type { JSX } from "preact/jsx-runtime";
import type { DraggableItemProps } from "@/types/types";

export function Draggable({ id, children }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style: JSX.CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style}>
      {children({
        listeners: listeners ?? {},
        attributes: attributes ?? {},
      })}
    </div>
  );
}
