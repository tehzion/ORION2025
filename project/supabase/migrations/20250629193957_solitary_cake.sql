/*
  # Add Global Roles and Support System

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text, nullable)
      - `global_role` (text, default 'user')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `departments`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `description` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `support_tickets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `subject` (text, not null)
      - `description` (text, not null)
      - `status` (text, default 'open')
      - `priority` (text, default 'medium')
      - `assigned_to_department_id` (uuid, foreign key to departments)
      - `assigned_to_user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `ticket_messages`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, foreign key to support_tickets)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each role level
    - Super admin has full access to all tables
    - Regular users can only access their own data

  3. Functions and Triggers
    - Auto-create profile when user signs up
    - Handle user metadata properly
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  global_role text DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure valid global roles
  CONSTRAINT valid_global_role CHECK (global_role IN ('user', 'super_admin'))
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Super admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
    )
  );

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Departments policies
CREATE POLICY "All authenticated users can read departments"
  ON departments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage departments"
  ON departments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
    )
  );

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open' NOT NULL,
  priority text DEFAULT 'medium' NOT NULL,
  assigned_to_department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  assigned_to_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure valid status values
  CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'closed', 'resolved')),
  
  -- Ensure valid priority values
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Support tickets policies
CREATE POLICY "Users can read own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can read all tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
    )
  );

CREATE POLICY "Assigned users can read their tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = assigned_to_user_id);

CREATE POLICY "Users can create tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can update all tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
    )
  );

CREATE POLICY "Assigned users can update ticket status"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = assigned_to_user_id);

CREATE POLICY "Users can delete own unassigned tickets"
  ON support_tickets
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND assigned_to_user_id IS NULL 
    AND status NOT IN ('closed', 'resolved')
  );

CREATE POLICY "Super admins can delete any ticket"
  ON support_tickets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
    )
  );

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Ticket messages policies
CREATE POLICY "Users can read messages on accessible tickets"
  ON ticket_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = ticket_messages.ticket_id
      AND (
        st.user_id = auth.uid()
        OR st.assigned_to_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
        )
      )
    )
  );

CREATE POLICY "Users can add messages to accessible tickets"
  ON ticket_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = ticket_messages.ticket_id
      AND (
        st.user_id = auth.uid()
        OR st.assigned_to_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
        )
      )
    )
  );

CREATE POLICY "Users can update own messages"
  ON ticket_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can update any message"
  ON ticket_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
    )
  );

CREATE POLICY "Users can delete own messages"
  ON ticket_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can delete any message"
  ON ticket_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.global_role = 'super_admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_global_role_idx ON profiles(global_role);
CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_assigned_to_user_id_idx ON support_tickets(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS support_tickets_assigned_to_department_id_idx ON support_tickets(assigned_to_department_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_priority_idx ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS ticket_messages_ticket_id_idx ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS ticket_messages_user_id_idx ON ticket_messages(user_id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, global_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user_profile();
  END IF;
END $$;

-- Insert default departments
INSERT INTO departments (name, description) VALUES
  ('Technical Support', 'Website maintenance, bug fixes, and technical issues'),
  ('Design', 'UI/UX design, graphics, and visual content'),
  ('Development', 'New features, integrations, and custom development'),
  ('Marketing', 'SEO, content marketing, and digital campaigns'),
  ('General', 'General inquiries and other support requests')
ON CONFLICT (name) DO NOTHING;

-- Create profiles for existing users (if any)
DO $$
BEGIN
  INSERT INTO profiles (id, full_name, global_role)
  SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', ''),
    'user'
  FROM auth.users
  ON CONFLICT (id) DO NOTHING;
END $$;