import { useUserProfileStore } from "@/storage/statelibrary";

const login = useUserProfileStore((state) => state.login);

export async function getUser() {
  const result = await chrome.storage.local.get("user");
  if (result.user) {
    console.log("Retrieved user:", result.user);
    login(
      result.user.username,
      result.user.avatar,
      result.user.token,
      result.user.isPremium
    );
    return result.user;
  } else {
    console.log("No user found in storage.");
    return null;
  }
}
