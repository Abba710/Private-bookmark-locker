import { useLockOverlayStore } from "@/storage/statelibrary";

const SESSION_UNLOCKED_KEY = "SESSION_UNLOCKED_KEY";

// Direct access to store setters outside of components
const setLockOverlay = (value: boolean) =>
  useLockOverlayStore.getState().setIsLocked(value);

const setMode = (mode: "unlock" | "setup") =>
  useLockOverlayStore.getState().setMode(mode);

// Generate a random salt
function generateSalt(length = 16) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Hash password + salt with SHA-256
async function hashPassword(password: string, salt: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  const byteArray = Array.from(new Uint8Array(buffer));
  return btoa(String.fromCharCode(...byteArray));
}

// Save a new password to chrome.storage.local
export async function savePassword(password: string) {
  return new Promise<void>(async (resolve) => {
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    chrome.storage.local.set({ salt, hash }, async () => {
      await setSessionStatus(true); // mark session as unlocked
      setLockOverlay(false); // hide overlay
      resolve();
    });
  });
}

// Validate or set password depending on the current mode
export async function handleSubmitPassword(password: string) {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.get(["salt", "hash"], async (result) => {
      const { salt, hash } = result;

      // If password is not set, create a new one
      if (!salt || !hash) {
        try {
          await savePassword(password);
          resolve();
        } catch {
          reject("Failed to save password");
        }
        return;
      }

      // Compare entered password with stored hash
      try {
        const inputHash = await hashPassword(password, salt);
        if (inputHash === hash) {
          await setSessionStatus(true); // mark session as unlocked
          setLockOverlay(false); // hide overlay
          resolve();
        } else {
          reject("Incorrect password");
        }
      } catch {
        reject("Hashing failed");
      }
    });
  });
}

// Check if password exists in storage (used to decide lock mode)
export async function getLockStatus() {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(["salt", "hash"], (result) => {
      const passwordSet = result.salt && result.hash;
      setMode(passwordSet ? "unlock" : "setup");
      resolve();
    });
  });
}

// Read session key from chrome.storage.session
export async function getSessionKey(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.session.get([SESSION_UNLOCKED_KEY], (result) => {
      resolve(result[SESSION_UNLOCKED_KEY] === true);
    });
  });
}

// Write session key to chrome.storage.session
export async function setSessionStatus(status: boolean) {
  await chrome.storage.session.set({ [SESSION_UNLOCKED_KEY]: status });
}

// Determine if the overlay should be shown at app startup
export async function getInitialLockState(): Promise<boolean> {
  const unlocked = await getSessionKey(); // check session
  if (unlocked) return false; // no lock if session is still active

  return new Promise((resolve) => {
    chrome.storage.local.get(["salt", "hash"], (result) => {
      const passwordSet = result.salt && result.hash;
      resolve(!!passwordSet); // lock only if password exists
    });
  });
}
