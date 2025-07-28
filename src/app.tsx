import UserHeader from "./components/header";
import ControlPanel from "./components/controlpanel";
import BookmarkList from "./components/bookmarks/bookmarkList";
import OptionsPanel from "./components/optionsPanel";
import PremiumBlock from "./components/premium";
import { useEffect } from "preact/hooks";

import { useBookmarkStore } from "@/storage/statelibrary";
import { loadBookmarks } from "@/features/bookmarks/bookmarkService";

function app() {
  const setBookmarks = useBookmarkStore((state) => state.setBookmarks);

  useEffect(() => {
    loadBookmarks().then(setBookmarks);
  }, []);

  return (
    <div className="min-w-full min-h-screen p-4 bg-black text-white flex flex-col gap-[10px]">
      <UserHeader />
      <ControlPanel />
      <BookmarkList />
      <OptionsPanel />
      <PremiumBlock />
    </div>
  );
}

export default app;
