import { LogIn, LogOut, Crown, Settings, Maximize2 } from "lucide-react";
import type { User } from "@/types/types";
import { useNavigate } from "react-router-dom";

interface UserHeaderProps {
  userData: User | null;
  logIn: () => void;
  logOut: () => void;
  isPro: boolean;
}

export default function UserHeader({
  userData,
  isPro,
  logIn,
  logOut,
}: UserHeaderProps) {
  const username =
    userData?.mail || chrome.i18n.getMessage("app_header_guest_name");
  const navigate = useNavigate();
  return (
    <div className="ds-topbar gap-1">
      {userData ? (
        <>
          <div className="ds-topbar-left">
            <div className="ds-topbar-left !gap-0 ">
              <div className={"icon icon--primary mb-1 icon--left"}>
                <Crown className={isPro ? "h-4 w-4" : "hidden"} />
              </div>
              <p className="ds-text-primary text-nowrap overflow-hidden max-w-[200px]">
                {username}
              </p>
            </div>
          </div>
          <div className="ds-topbar-nav">
            <button
              title={chrome.i18n.getMessage("app_open_fullscreen")}
              onClick={() => {
                chrome.tabs.create({
                  url: chrome.runtime.getURL("index.html"),
                });
              }}
              className="btn-icon btn-icon--outline"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="btn-icon btn-icon--primary"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              onClick={logOut}
              className="btn-icon btn-icon--ghost btn-icon--danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="min-w-0">
            <p className="ds-text-primary">{username}</p>
          </div>

          <div className="ds-topbar-right">
            <button
              title={chrome.i18n.getMessage("app_open_fullscreen")}
              onClick={() => {
                chrome.tabs.create({
                  url: chrome.runtime.getURL("index.html"),
                });
              }}
              className="btn-icon btn-icon--outline"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="btn-icon btn-icon--outline"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button onClick={logIn} className="btn btn-icon--primary">
              <LogIn className="h-4 w-4" />
              <span>{chrome.i18n.getMessage("app_header_log_in")}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
