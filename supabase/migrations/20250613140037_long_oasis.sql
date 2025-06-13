/*
  # Team Spaces Collaboration Schema

  1. New Tables
    - `team_spaces`
      - `id` (uuid, primary key)
      - `name` (text)
      - `owner_id` (uuid, references auth.users)
      - `join_token` (uuid, unique)
      - `created_at` (timestamp)
    
    - `team_space_members`
      - `id` (uuid, primary key)
      - `space_id` (uuid, references team_spaces)
      - `user_id` (uuid, references auth.users)
      - `role` (text, 'admin' or 'member')
      - `can_view` (boolean, default true)
      - `joined_at` (timestamp)
    
    - `team_space_categories`
      - `id` (uuid, primary key)
      - `space_id` (uuid, references team_spaces)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `team_space_links`
      - `id` (uuid, primary key)
      - `category_id` (uuid, references team_space_categories)
      - `title` (text)
      - `url` (text)
      - `description` (text)
      - `is_favorite` (boolean, default false)
      - `created_at` (timestamp)
    
    - `team_space_notes`
      - `id` (uuid, primary key)
      - `category_id` (uuid, references team_space_categories)
      - `title` (text)
      - `content` (text)
      - `is_favorite` (boolean, default false)
      - `created_at` (timestamp)
    
    - `team_space_pdfs`
      - `id` (uuid, primary key)
      - `category_id` (uuid, references team_space_categories)
      - `title` (text)
      - `file_url` (text)
      - `description` (text)
      - `is_favorite` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for team space access control
    - Ensure users can only access spaces they're members of
*/

-- Create team_spaces table
CREATE TABLE IF NOT EXISTS team_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  join_token uuid UNIQUE DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

-- Create team_space_members table
CREATE TABLE IF NOT EXISTS team_space_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES team_spaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  can_view boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(space_id, user_id)
);

-- Create team_space_categories table
CREATE TABLE IF NOT EXISTS team_space_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES team_spaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create team_space_links table
CREATE TABLE IF NOT EXISTS team_space_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES team_space_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text,
  description text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create team_space_notes table
CREATE TABLE IF NOT EXISTS team_space_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES team_space_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create team_space_pdfs table
CREATE TABLE IF NOT EXISTS team_space_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES team_space_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text,
  description text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE team_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_space_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_space_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_space_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_space_pdfs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_spaces
CREATE POLICY "Users can view spaces they are members of"
  ON team_spaces
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT space_id FROM team_space_members 
      WHERE user_id = auth.uid() AND can_view = true
    )
  );

CREATE POLICY "Users can create team spaces"
  ON team_spaces
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Only owners can update team spaces"
  ON team_spaces
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Only owners can delete team spaces"
  ON team_spaces
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for team_space_members
CREATE POLICY "Users can view members of spaces they belong to"
  ON team_space_members
  FOR SELECT
  TO authenticated
  USING (
    space_id IN (
      SELECT space_id FROM team_space_members 
      WHERE user_id = auth.uid() AND can_view = true
    )
  );

CREATE POLICY "Users can join spaces"
  ON team_space_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update member permissions"
  ON team_space_members
  FOR UPDATE
  TO authenticated
  USING (
    space_id IN (
      SELECT space_id FROM team_space_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can remove members"
  ON team_space_members
  FOR DELETE
  TO authenticated
  USING (
    space_id IN (
      SELECT space_id FROM team_space_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for team_space_categories
CREATE POLICY "Users can view categories in accessible spaces"
  ON team_space_categories
  FOR SELECT
  TO authenticated
  USING (
    space_id IN (
      SELECT space_id FROM team_space_members 
      WHERE user_id = auth.uid() AND can_view = true
    )
  );

CREATE POLICY "Users can create categories in accessible spaces"
  ON team_space_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    space_id IN (
      SELECT space_id FROM team_space_members 
      WHERE user_id = auth.uid() AND can_view = true
    )
  );

CREATE POLICY "Users can update categories in accessible spaces"
  ON team_space_categories
  FOR UPDATE
  TO authenticated
  USING (
    space_id IN (
      SELECT space_id FROM team_space_members 
      WHERE user_id = auth.uid() AND can_view = true
    )
  );

CREATE POLICY "Users can delete categories in accessible spaces"
  ON team_space_categories
  FOR DELETE
  TO authenticated
  USING (
    space_id IN (
      SELECT space_id FROM team_space_members 
      WHERE user_id = auth.uid() AND can_view = true
    )
  );

-- RLS Policies for team_space_links
CREATE POLICY "Users can view links in accessible categories"
  ON team_space_links
  FOR SELECT
  TO authenticated
  USING (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

CREATE POLICY "Users can create links in accessible categories"
  ON team_space_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

CREATE POLICY "Users can update links in accessible categories"
  ON team_space_links
  FOR UPDATE
  TO authenticated
  USING (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

CREATE POLICY "Users can delete links in accessible categories"
  ON team_space_links
  FOR DELETE
  TO authenticated
  USING (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

-- RLS Policies for team_space_notes
CREATE POLICY "Users can view notes in accessible categories"
  ON team_space_notes
  FOR SELECT
  TO authenticated
  USING (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

CREATE POLICY "Users can create notes in accessible categories"
  ON team_space_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

CREATE POLICY "Users can update notes in accessible categories"
  ON team_space_notes
  FOR UPDATE
  TO authenticated
  USING (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

CREATE POLICY "Users can delete notes in accessible categories"
  ON team_space_notes
  FOR DELETE
  TO authenticated
  USING (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

-- RLS Policies for team_space_pdfs
CREATE POLICY "Users can view pdfs in accessible categories"
  ON team_space_pdfs
  FOR SELECT
  TO authenticated
  USING (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

CREATE POLICY "Users can create pdfs in accessible categories"
  ON team_space_pdfs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

CREATE POLICY "Users can update pdfs in accessible categories"
  ON team_space_pdfs
  FOR UPDATE
  TO authenticated
  USING (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

CREATE POLICY "Users can delete pdfs in accessible categories"
  ON team_space_pdfs
  FOR DELETE
  TO authenticated
  USING (
    category_id IN (
      SELECT tsc.id FROM team_space_categories tsc
      JOIN team_space_members tsm ON tsc.space_id = tsm.space_id
      WHERE tsm.user_id = auth.uid() AND tsm.can_view = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_space_members_space_user ON team_space_members(space_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_space_categories_space ON team_space_categories(space_id);
CREATE INDEX IF NOT EXISTS idx_team_space_links_category ON team_space_links(category_id);
CREATE INDEX IF NOT EXISTS idx_team_space_notes_category ON team_space_notes(category_id);
CREATE INDEX IF NOT EXISTS idx_team_space_pdfs_category ON team_space_pdfs(category_id);