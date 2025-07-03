/*
  # Create project_members table

  1. New Tables
    - `project_members`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `user_id` (uuid, foreign key to auth.users)
      - `role` (text, values: 'owner', 'developer', 'client', 'viewer')
      - `invited_by` (uuid, foreign key to auth.users)
      - `invited_at` (timestamptz)
      - `joined_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `project_members` table
    - Add policy for users to read project members if they are project members themselves
    - Add policy for project owners to manage (insert/update/delete) project members
    - Add policy for users to read their own membership records

  3. Indexes
    - Index on project_id for efficient project member lookups
    - Index on user_id for efficient user membership lookups
    - Unique constraint on project_id + user_id to prevent duplicate memberships

  4. Constraints
    - Check constraint to ensure valid roles
    - Foreign key constraints for data integrity
*/

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique membership per project
  UNIQUE(project_id, user_id),
  
  -- Ensure valid roles
  CONSTRAINT valid_role CHECK (role IN ('owner', 'developer', 'client', 'viewer'))
);

-- Enable RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read project members if they are members of the project
CREATE POLICY "Users can read project members if they are project members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
    )
  );

-- Policy: Project owners can insert new members
CREATE POLICY "Project owners can add members"
  ON project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
  );

-- Policy: Project owners can update member roles
CREATE POLICY "Project owners can update member roles"
  ON project_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
  );

-- Policy: Project owners can remove members
CREATE POLICY "Project owners can remove members"
  ON project_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
    OR
    -- Users can remove themselves from projects
    project_members.user_id = auth.uid()
  );

-- Policy: Users can update their own joined_at timestamp
CREATE POLICY "Users can update their own membership status"
  ON project_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON project_members(project_id);
CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON project_members(user_id);
CREATE INDEX IF NOT EXISTS project_members_role_idx ON project_members(role);

-- Function to automatically add project owner as a member
CREATE OR REPLACE FUNCTION add_project_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', now())
  ON CONFLICT (project_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically add project owner as member when project is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'add_project_owner_as_member_trigger'
  ) THEN
    CREATE TRIGGER add_project_owner_as_member_trigger
      AFTER INSERT ON projects
      FOR EACH ROW
      EXECUTE FUNCTION add_project_owner_as_member();
  END IF;
END $$;

-- Update existing projects to have owner as member (if any exist)
DO $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role, joined_at)
  SELECT id, owner_id, 'owner', created_at
  FROM projects
  ON CONFLICT (project_id, user_id) DO NOTHING;
END $$;