import { Routes, Route } from "react-router-dom";
import MainPage from '@/pages/mainpage'
import SettingsPage from '@/pages/settings'
import WelcomePage from '@/pages/welcome'

function App() {
  return (
    <div className="relative w-full h-full bg-[#09090b] text-zinc-100">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
      </Routes>

    </div>
  );
}

export default App
