/*
  # Create comments table for task discussions

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key to tasks table)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text, the comment content)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `comments` table
    - Add policies for authenticated users to read comments on tasks they have access to
    - Add policies for authenticated users to create their own comments
    - Add policies for authenticated users to update/delete their own comments
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read comments on tasks they have access to
CREATE POLICY "Users can read comments on accessible tasks"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = comments.task_id 
      AND tasks.assignee_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM tasks 
      JOIN projects ON tasks.project_id = projects.id
      WHERE tasks.id = comments.task_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Policy to allow authenticated users to create comments
CREATE POLICY "Users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own comments
CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS comments_task_id_idx ON comments(task_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

-- This migration appears to be the initial setup
-- Let me create a comprehensive project management schema