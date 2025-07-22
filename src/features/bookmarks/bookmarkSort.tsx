import { useSortable } from "@dnd-kit/sortable";
import type { JSX } from "preact/jsx-runtime";
import type { DraggableItemProps } from "@/types/types";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Bookmark } from "@/types/types";
import { useBookmarkStore } from "@/storage/statelibrary";

export function Sortable({ id, children }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id });

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

export function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const tree = useBookmarkStore.getState().bookmarks;
  const updated = moveInTree(tree, String(active.id), String(over.id));
  useBookmarkStore.getState().setBookmarks(updated);
  chrome.storage.local.set({ bookmarks: updated });
}

function moveInTree(
  tree: Bookmark[],
  activeId: string,
  overId: string
): Bookmark[] {
  const cloned = structuredClone(tree);
  let activeItem: Bookmark | null = null;

  function remove(nodes: Bookmark[]): Bookmark[] {
    return nodes.filter((node) => {
      if (node.id === activeId) {
        activeItem = node;
        return false;
      }
      if (node.children) node.children = remove(node.children);
      return true;
    });
  }

  function insert(nodes: Bookmark[]): boolean {
    for (const node of nodes) {
      if (node.id === overId && node.isFolder) {
        node.children = node.children || [];
        node.children.push(activeItem!);
        return true;
      }
      if (node.children && insert(node.children)) return true;
    }
    return false;
  }

  const cleaned = remove(cloned);
  if (!insert(cleaned)) {
    const idx = cleaned.findIndex((n) => n.id === overId);
    if (idx !== -1) cleaned.splice(idx, 0, activeItem!);
    else cleaned.push(activeItem!);
  }

  return cleaned;
}
