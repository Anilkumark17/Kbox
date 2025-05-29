import { supabase } from "../utils/db";

export const updateApi = async (id, name) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating category:", error);
  }
};

export const categoryFetch = async (id) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching category:", error);
  }
};

export const deleteApi = async (id) => {
  try {
    await supabase.from("categories").delete().eq("id", id);
  } catch (error) {
    console.error(error);
  }
};
