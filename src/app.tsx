import { Routes, Route } from "react-router-dom";
import MainPage from "@/pages/mainpage";
import SettingsPage from "@/pages/settings/index.tsx";
import WelcomePage from "@/pages/welcome";
import NotificationsModal from "@/components/notifications/notificationsModal";
import LockOverlay from "@/components/lock/lockoverlay";
import { useLockOverlayStore } from "@/storage/statelibrary";

function App() {
  const isLocked = useLockOverlayStore((state) => state.isLocked);

  return (
    <div className="ds-section ds-section-marker h-full">
      {isLocked ? (
        <LockOverlay />
      ) : (
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
        </Routes>
      )}
      <NotificationsModal />
    </div>
  );
}

export default App;
