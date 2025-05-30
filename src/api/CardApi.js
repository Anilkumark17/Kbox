import { supabase } from "../utils/db";

export const favUpdate = async (id) => {
  await supabase.from("cards").update({ is_favorite: true }).eq("id", id);
};

export const not_favUpdate = async (id) => {
  await supabase.from("cards").update({ is_favorite: false }).eq("id", id);
};

export const deleteCard = async (id) => {
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw error;
};

export const updateCard = async (id, newData) => {
  const { error } = await supabase.from("cards").update(newData).eq("id", id);
  if (error) throw error;
};
