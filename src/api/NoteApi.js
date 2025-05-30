import { supabase } from "../utils/db";

// Mark note as favorite
export const favUpdate = async (noteId) => {
  const { error } = await supabase
    .from("notes")
    .update({ is_favorite: true })
    .eq("id", noteId);

  if (error) {
    console.error("Error marking note as favorite:", error);
    throw error;
  }
};

// Remove favorite mark from note
export const not_favUpdate = async (noteId) => {
  const { error } = await supabase
    .from("notes")
    .update({ is_favorite: false })
    .eq("id", noteId);

  if (error) {
    console.error("Error removing favorite from note:", error);
    throw error;
  }
};

// Delete note
export const deleteNote = async (noteId) => {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

// Update note
export const updateNote = async (noteId, updatedFields) => {
  const { error } = await supabase
    .from("notes")
    .update(updatedFields)
    .eq("id", noteId);

  if (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};
