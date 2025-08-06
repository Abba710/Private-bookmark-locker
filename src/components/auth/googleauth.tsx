import { useAuthStore, useUserProfileStore } from "@/storage/statelibrary";
import { useState } from "preact/compat";

export default function GoogleAuthModal() {
  const [loading, setLoading] = useState(false);

  const modalOpen = useAuthStore((state) => state.modalOpen);
  const setModalOpen = useAuthStore((state) => state.setModalOpen);
  const handleGoogleAuth = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ type: "firebase-googleauth" }, (response) => {
      setLoading(false);
      if (response && response.user && !response.error) {
        const { displayName, photoURL } = response.user;
        const token = response.user.stsTokenManager?.accessToken || null;

        // ✅ Update Zustand store correctly
        useUserProfileStore
          .getState()
          .login(displayName || "Guest User", photoURL, token);

        setModalOpen(false);
      } else {
        console.error("Google Auth failed", response?.error || response);
      }
    });
  };

  const handleLater = () => {
    setModalOpen(false);
  };

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[320px] bg-white/10 p-5 rounded-2xl flex flex-col gap-3 backdrop-blur">
        {/* Google Button */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2
              bg-white text-black rounded-xl text-sm font-medium
              hover:bg-white/90 active:scale-95 transition-transform duration-150
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-4 h-4"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Maybe Later */}
        <button
          onClick={handleLater}
          className="text-white/60 text-xs self-center hover:text-white transition"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
