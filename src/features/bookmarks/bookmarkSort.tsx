import { useSortable } from "@dnd-kit/sortable";
import type { JSX } from "preact/jsx-runtime";
import type { DragEndEvent } from "@dnd-kit/core";
import { useBookmarkStore } from "@/storage/statelibrary";
import { useRef, useState } from "preact/hooks";
import { CSS } from "@dnd-kit/utilities";

export type Bookmark = {
  id: string;
  url?: string;
  title?: string;
  incognito?: boolean;
  isFolder?: boolean;
  children?: Bookmark[];
};

type DraggableItemProps = {
  id: string;
  children: (props: {
    listeners: any;
    attributes: any;
    setDroppableRef: (node: HTMLElement | null) => void;
  }) => JSX.Element;
};

export function Sortable({ id, children }: DraggableItemProps) {
  const [hoverLine, setHoverLine] = useState<
    "top" | "bottom" | "inside" | null
  >(null);
  const ref = useRef<HTMLElement | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    setDroppableNodeRef,
    isOver,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      hoverLine,
    },
  });

  const style: JSX.CSSProperties = {
    ...(isDragging && transform
      ? {
          transform: CSS.Transform.toString(transform),
          zIndex: 999,
          position: "relative",
          pointerEvents: "none",
          opacity: 0.8,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }
      : {}),
    ...(isOver && hoverLine === "top"
      ? { borderTop: "3px solid #45E3B8", borderRadius: "12px 12px 0 0" }
      : {}),
    ...(isOver && hoverLine === "bottom"
      ? { borderBottom: "3px solid #45E3B8", borderRadius: "0 0 12px 12px" }
      : {}),
    ...(isOver && hoverLine === "inside"
      ? {
          border: "2px solid #45E3B8",
          backgroundColor: "rgba(69, 227, 184, 0.1)",
          borderRadius: "12px",
        }
      : {}),
    transition: isDragging ? transition : "all 0.15s ease",
  };

  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const currentBookmark = findBookmarkById(bookmarks, id);
  const isFolder = currentBookmark?.isFolder;

  return (
    <div
      ref={(el) => {
        ref.current = el;
        setNodeRef(el);
        setDroppableNodeRef(el);
      }}
      style={style}
      onPointerMove={(e) => {
        if (!ref.current || !isOver || isDragging) return;

        const rect = ref.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        // Определяем зоны для hover
        const topZone = height * 0.25; // верхние 25%
        const bottomZone = height * 0.75; // нижние 25%

        if (isFolder && y > topZone && y < bottomZone) {
          setHoverLine("inside"); // в папку
        } else if (y <= topZone) {
          setHoverLine("top"); // над элементом
        } else {
          setHoverLine("bottom"); // под элементом
        }
      }}
      onPointerLeave={() => setHoverLine(null)}
    >
      {children({
        listeners: listeners ?? {},
        attributes: attributes ?? {},
        setDroppableRef: setDroppableNodeRef,
      })}
    </div>
  );
}

// Утилитарные функции для работы с вложенными структурами
function findBookmarkById(bookmarks: Bookmark[], id: string): Bookmark | null {
  for (const bookmark of bookmarks) {
    if (bookmark.id === id) return bookmark;
    if (bookmark.children) {
      const found = findBookmarkById(bookmark.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findBookmarkPath(
  bookmarks: Bookmark[],
  id: string,
  path: number[] = []
): number[] | null {
  for (let i = 0; i < bookmarks.length; i++) {
    if (bookmarks[i].id === id) {
      return [...path, i];
    }
    if (bookmarks[i].children) {
      const found = findBookmarkPath(bookmarks[i].children!, id, [...path, i]);
      if (found) return found;
    }
  }
  return null;
}

function removeBookmarkAtPath(
  bookmarks: Bookmark[],
  path: number[]
): [Bookmark[], Bookmark] {
  const newBookmarks = JSON.parse(JSON.stringify(bookmarks));
  let current = newBookmarks;

  // Идем до предпоследнего элемента пути
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]].children!;
  }

  const removed = current.splice(path[path.length - 1], 1)[0];
  return [newBookmarks, removed];
}

function insertBookmarkAtPath(
  bookmarks: Bookmark[],
  path: number[],
  bookmark: Bookmark,
  position: "before" | "after" | "inside"
): Bookmark[] {
  const newBookmarks = JSON.parse(JSON.stringify(bookmarks));
  let current = newBookmarks;

  // Идем до нужного уровня
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]].children!;
  }

  const targetIndex = path[path.length - 1];

  if (position === "inside") {
    // Вставляем внутрь папки
    const targetFolder = current[targetIndex];
    if (targetFolder.isFolder) {
      if (!targetFolder.children) targetFolder.children = [];
      targetFolder.children.push(bookmark);
    }
  } else if (position === "before") {
    current.splice(targetIndex, 0, bookmark);
  } else if (position === "after") {
    current.splice(targetIndex + 1, 0, bookmark);
  }

  return newBookmarks;
}

function getInsertPosition(
  activeId: string,
  overId: string,
  hoverLine: "top" | "bottom" | "inside" | null,
  bookmarks: Bookmark[]
): { shouldMove: boolean; reason?: string } {
  if (!hoverLine) return { shouldMove: false, reason: "No hover line" };

  const activePath = findBookmarkPath(bookmarks, activeId);
  const overPath = findBookmarkPath(bookmarks, overId);

  if (!activePath || !overPath) {
    return { shouldMove: false, reason: "Path not found" };
  }

  // Проверяем, находятся ли элементы на одном уровне
  const sameParent =
    activePath.length === overPath.length &&
    activePath.slice(0, -1).every((val, i) => val === overPath[i]);

  if (sameParent) {
    const activeIndex = activePath[activePath.length - 1];
    const overIndex = overPath[overPath.length - 1];

    // Проверяем логику перемещения на одном уровне
    if (hoverLine === "top") {
      // Хотим вставить ПЕРЕД over элементом
      // Если active уже перед over - не двигаем
      if (activeIndex === overIndex - 1) {
        return {
          shouldMove: false,
          reason: "Already in target position (before)",
        };
      }
    } else if (hoverLine === "bottom") {
      // Хотим вставить ПОСЛЕ over элемента
      // Если active уже после over - не двигаем
      if (activeIndex === overIndex + 1) {
        return {
          shouldMove: false,
          reason: "Already in target position (after)",
        };
      }
    }
  }

  // Проверяем вставку в папку
  if (hoverLine === "inside") {
    const overBookmark = findBookmarkById(bookmarks, overId);
    if (!overBookmark?.isFolder) {
      return { shouldMove: false, reason: "Target is not a folder" };
    }

    // Проверяем, не пытаемся ли мы вставить папку саму в себя
    if (activeId === overId) {
      return { shouldMove: false, reason: "Cannot move folder into itself" };
    }
  }

  return { shouldMove: true };
}

export function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const activeId = active.id as string;
  const overId = over.id as string;

  const bookmarks = useBookmarkStore.getState().bookmarks;
  const setBookmarks = useBookmarkStore.getState().setBookmarks;

  const hoverLine = over.data?.current?.hoverLine as
    | "top"
    | "bottom"
    | "inside"
    | null;

  // Проверяем, нужно ли перемещение
  const { shouldMove, reason } = getInsertPosition(
    activeId,
    overId,
    hoverLine,
    bookmarks
  );

  if (!shouldMove) {
    console.log("Drag cancelled:", reason);
    return;
  }

  // Находим пути к элементам
  const activePath = findBookmarkPath(bookmarks, activeId);
  const overPath = findBookmarkPath(bookmarks, overId);

  if (!activePath || !overPath) return;

  try {
    // Удаляем перемещаемый элемент
    const [bookmarksAfterRemove, movedBookmark] = removeBookmarkAtPath(
      bookmarks,
      activePath
    );

    // Корректируем путь для вставки, если нужно
    let adjustedOverPath = [...overPath];

    // Если удаленный элемент был перед целевым на том же уровне
    const sameParent =
      activePath.length === overPath.length &&
      activePath.slice(0, -1).every((val, i) => val === overPath[i]);

    if (
      sameParent &&
      activePath[activePath.length - 1] < overPath[overPath.length - 1]
    ) {
      adjustedOverPath[adjustedOverPath.length - 1]--;
    }

    // Определяем позицию вставки
    let insertPosition: "before" | "after" | "inside";
    if (hoverLine === "inside") {
      insertPosition = "inside";
    } else if (hoverLine === "top") {
      insertPosition = "before";
    } else {
      insertPosition = "after";
    }

    // Вставляем элемент
    const finalBookmarks = insertBookmarkAtPath(
      bookmarksAfterRemove,
      adjustedOverPath,
      movedBookmark,
      insertPosition
    );

    setBookmarks(finalBookmarks);
    chrome.storage.local.set({ bookmarks: finalBookmarks });

    console.log(
      `Moved ${movedBookmark.title} ${insertPosition} ${
        findBookmarkById(finalBookmarks, overId)?.title
      }`
    );
  } catch (error) {
    console.error("Error during drag and drop:", error);
  }
}
