import { supabase } from "../utils/db";

export const getUserSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    console.error("Error getting session:", error?.message || "No session");
    throw new Error("User not authenticated");
  }

  return session.user.id;
};

export const dashBoardId = async () => {
  const { id } = await supabase.from("categories").select("id");
  return id;
};
