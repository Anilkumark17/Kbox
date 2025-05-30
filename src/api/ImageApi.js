import { supabase } from "../utils/db";


export const favUpdate = async (id) => {
  await supabase.from("images").update({ is_favorite: true }).eq("id", id);
};

export const not_favUpdate = async (id) => {
  await supabase.from("images").update({ is_favorite: false }).eq("id", id);
};

export const deleteImage = async (id) => {
  return await supabase.from("images").delete().eq("id", id);
};

export const updateImage = async (id, updates) => {
  return await supabase.from("images").update(updates).eq("id", id);
};