import { Routes, Route } from "react-router-dom";
import MainPage from "@/pages/mainpage";
import SettingsPage from "@/pages/settings/index.tsx";
import WelcomePage from "@/pages/welcome";
import NotificationsModal from "@/components/notifications/notificationsModal";
import ImportBookmarksDialog from "@/components/chromeImportPanel";
import QrModalUi from "@/components/contextMenu/featuresUI/qrGenModal";

function App() {
  return (
    <div className="ds-section ds-section-marker h-full">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
      </Routes>
      <NotificationsModal />
      <ImportBookmarksDialog />
      <QrModalUi />
    </div>
  );
}

export default App;
