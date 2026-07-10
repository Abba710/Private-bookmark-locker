import { Routes, Route } from "react-router-dom";
import MainPage from '@/pages/mainpage'
import SettingsPage from '@/pages/settings'

function App() {
  return (
    <div className="relative w-full h-full bg-[#09090b] text-zinc-100">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>

    </div>
  );
}

export default App
