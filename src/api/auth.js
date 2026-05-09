import { auth } from "./firebase.js";

export async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}
