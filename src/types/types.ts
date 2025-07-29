import type { JSX } from "preact/jsx-runtime";

export type Bookmark = {
  id: string;
  url?: string;
  title?: string;
  incognito?: boolean;
  isFolder?: boolean;
  children?: Bookmark[];
};
export interface BookmarkStore {
  bookmarks: Bookmark[];
  setBookmarks: (bookmarks: Bookmark[]) => void;
}

export interface SwitchStore {
  Switch: boolean;
  setSwitch: (filtered: boolean) => void;
}

export type DraggableItemProps = {
  id: string;
  children: (props: {
    listeners: Record<string, any>;
    attributes: Record<string, any>;
    setDroppableRef?: (node: HTMLElement | null) => void;
  }) => JSX.Element;
};

export interface LockOverlayStore {
  isLocked: boolean;
  mode: "unlock" | "setup";
  setIsLocked: (locked: boolean) => void;
  setMode: (mode: "unlock" | "setup") => void;
}
