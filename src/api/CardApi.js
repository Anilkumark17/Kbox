import { supabase } from "../utils/db";

export const favUpdate = async (id) => {
  try {
    const { error } = await supabase
      .from("cards")
      .update({ is_favorite: true })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Favorite update error:", error.message);
    return false;
  }
};

export const not_favUpdate = async (id) => {
  try {
    const { error } = await supabase
      .from("cards")
      .update({ is_favorite: false })
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Unfavorite update error:", error.message);
    return false;
  }
};
