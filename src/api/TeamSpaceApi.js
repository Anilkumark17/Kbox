import { supabase } from "../utils/db";

// Team Space Operations
export const createTeamSpace = async (name) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = userData?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  const { data: spaceData, error: spaceError } = await supabase
    .from("team_spaces")
    .insert([{ name, owner_id: userId }])
    .select()
    .single();

  if (spaceError) throw spaceError;

  // Add creator as admin member
  const { error: memberError } = await supabase
    .from("team_space_members")
    .insert([{
      space_id: spaceData.id,
      user_id: userId,
      role: 'admin'
    }]);

  if (memberError) throw memberError;

  return spaceData;
};

export const getUserTeamSpaces = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = userData?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("team_spaces")
    .select(`
      *,
      team_space_members!inner(role, can_view)
    `)
    .eq("team_space_members.user_id", userId)
    .eq("team_space_members.can_view", true);

  if (error) throw error;
  return data;
};

export const getTeamSpaceById = async (spaceId) => {
  const { data, error } = await supabase
    .from("team_spaces")
    .select("*")
    .eq("id", spaceId)
    .single();

  if (error) throw error;
  return data;
};

export const joinTeamSpaceByToken = async (joinToken) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = userData?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  // Find the team space by join token
  const { data: spaceData, error: spaceError } = await supabase
    .from("team_spaces")
    .select("id")
    .eq("join_token", joinToken)
    .single();

  if (spaceError) throw spaceError;

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from("team_space_members")
    .select("id")
    .eq("space_id", spaceData.id)
    .eq("user_id", userId)
    .single();

  if (existingMember) {
    return { alreadyMember: true, spaceId: spaceData.id };
  }

  // Add user as member
  const { error: memberError } = await supabase
    .from("team_space_members")
    .insert([{
      space_id: spaceData.id,
      user_id: userId,
      role: 'member'
    }]);

  if (memberError) throw memberError;

  return { spaceId: spaceData.id };
};

export const updateTeamSpace = async (spaceId, updates) => {
  const { error } = await supabase
    .from("team_spaces")
    .update(updates)
    .eq("id", spaceId);

  if (error) throw error;
};

export const deleteTeamSpace = async (spaceId) => {
  const { error } = await supabase
    .from("team_spaces")
    .delete()
    .eq("id", spaceId);

  if (error) throw error;
};

export const regenerateJoinToken = async (spaceId) => {
  const { data, error } = await supabase
    .from("team_spaces")
    .update({ join_token: crypto.randomUUID() })
    .eq("id", spaceId)
    .select("join_token")
    .single();

  if (error) throw error;
  return data.join_token;
};

// Team Space Members Operations
export const getTeamSpaceMembers = async (spaceId) => {
  const { data, error } = await supabase
    .from("team_space_members")
    .select(`
      *,
      users:user_id (
        id,
        email,
        full_name
      )
    `)
    .eq("space_id", spaceId);

  if (error) throw error;
  return data;
};

export const updateMemberPermissions = async (memberId, updates) => {
  const { error } = await supabase
    .from("team_space_members")
    .update(updates)
    .eq("id", memberId);

  if (error) throw error;
};

export const removeMember = async (memberId) => {
  const { error } = await supabase
    .from("team_space_members")
    .delete()
    .eq("id", memberId);

  if (error) throw error;
};

// Team Space Categories Operations
export const getTeamSpaceCategories = async (spaceId) => {
  const { data, error } = await supabase
    .from("team_space_categories")
    .select("*")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

export const createTeamSpaceCategory = async (spaceId, name) => {
  const { data, error } = await supabase
    .from("team_space_categories")
    .insert([{ space_id: spaceId, name }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTeamSpaceCategory = async (categoryId, name) => {
  const { error } = await supabase
    .from("team_space_categories")
    .update({ name })
    .eq("id", categoryId);

  if (error) throw error;
};

export const deleteTeamSpaceCategory = async (categoryId) => {
  const { error } = await supabase
    .from("team_space_categories")
    .delete()
    .eq("id", categoryId);

  if (error) throw error;
};

// Team Space Links Operations
export const getTeamSpaceLinks = async (categoryId) => {
  const { data, error } = await supabase
    .from("team_space_links")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const createTeamSpaceLink = async (linkData) => {
  const { data, error } = await supabase
    .from("team_space_links")
    .insert([linkData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTeamSpaceLink = async (linkId, updates) => {
  const { error } = await supabase
    .from("team_space_links")
    .update(updates)
    .eq("id", linkId);

  if (error) throw error;
};

export const deleteTeamSpaceLink = async (linkId) => {
  const { error } = await supabase
    .from("team_space_links")
    .delete()
    .eq("id", linkId);

  if (error) throw error;
};

// Team Space Notes Operations
export const getTeamSpaceNotes = async (categoryId) => {
  const { data, error } = await supabase
    .from("team_space_notes")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const createTeamSpaceNote = async (noteData) => {
  const { data, error } = await supabase
    .from("team_space_notes")
    .insert([noteData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTeamSpaceNote = async (noteId, updates) => {
  const { error } = await supabase
    .from("team_space_notes")
    .update(updates)
    .eq("id", noteId);

  if (error) throw error;
};

export const deleteTeamSpaceNote = async (noteId) => {
  const { error } = await supabase
    .from("team_space_notes")
    .delete()
    .eq("id", noteId);

  if (error) throw error;
};