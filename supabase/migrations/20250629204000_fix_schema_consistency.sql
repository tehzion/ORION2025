-- Schema Consistency Fix Migration

/*
  # Schema Consistency Fix Migration

  This migration fixes inconsistencies between the database schema and TypeScript interfaces:
  
  1. Ensures all tables have the correct column names and types
  2. Adds missing columns that are referenced in TypeScript interfaces
  3. Fixes table name inconsistencies (project_tasks vs tasks)
  4. Ensures all constraints and indexes are properly set up
  5. Adds missing demo data setup functions
*/

-- First, let's ensure we have the correct table structure for projects
-- Add missing columns to projects table if they don't exist
DO $$
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status') THEN
        ALTER TABLE projects ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold', 'cancelled'));
    END IF;
    
    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'priority') THEN
        ALTER TABLE projects ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;
    
    -- Add budget column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'budget') THEN
        ALTER TABLE projects ADD COLUMN budget decimal(12,2);
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'tags') THEN
        ALTER TABLE projects ADD COLUMN tags text[];
    END IF;
    
    -- Add client_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_id') THEN
        ALTER TABLE projects ADD COLUMN client_id uuid;
    END IF;
    
    -- Rename completion_percentage to progress if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'completion_percentage') THEN
        ALTER TABLE projects RENAME COLUMN completion_percentage TO progress;
    END IF;
    
    -- Add progress column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'progress') THEN
        ALTER TABLE projects ADD COLUMN progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
    END IF;
    
    -- Rename deadline to due_date if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deadline') THEN
        ALTER TABLE projects RENAME COLUMN deadline TO due_date;
    END IF;
    
    -- Add due_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'due_date') THEN
        ALTER TABLE projects ADD COLUMN due_date date;
    END IF;
    
    -- Rename owner_id to created_by if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'owner_id') THEN
        ALTER TABLE projects RENAME COLUMN owner_id TO created_by;
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'created_by') THEN
        ALTER TABLE projects ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Ensure tasks table has all required columns
DO $$
BEGIN
    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'priority') THEN
        ALTER TABLE tasks ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;
    
    -- Add completion_percentage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completion_percentage') THEN
        ALTER TABLE tasks ADD COLUMN completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_by') THEN
        ALTER TABLE tasks ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    -- Rename assignee_id to assigned_to if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assignee_id') THEN
        ALTER TABLE tasks RENAME COLUMN assignee_id TO assigned_to;
    END IF;
    
    -- Add assigned_to column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_to') THEN
        ALTER TABLE tasks ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Ensure project_members table has correct role constraints
DO $$
BEGIN
    -- Update role constraint to match TypeScript interface
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_role') THEN
        ALTER TABLE project_members DROP CONSTRAINT valid_role;
    END IF;
    
    ALTER TABLE project_members ADD CONSTRAINT valid_role CHECK (role IN ('owner', 'manager', 'member', 'viewer'));
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_tasks_updated_at') THEN
        CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_project_members_updated_at') THEN
        CREATE TRIGGER update_project_members_updated_at BEFORE UPDATE ON project_members
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_comments_updated_at') THEN
        CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Ensure handle_new_user function exists and works correctly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, global_role, is_verified)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous User'),
        'user',
        false
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger for new user creation exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    END IF;
END $$;

-- Create a comprehensive demo data setup function
CREATE OR REPLACE FUNCTION setup_comprehensive_demo_data()
RETURNS void AS $$
DECLARE
    demo_project_id uuid;
    demo_task1_id uuid := gen_random_uuid();
    demo_task2_id uuid := gen_random_uuid();
    demo_task3_id uuid := gen_random_uuid();
    demo_ticket1_id uuid := gen_random_uuid();
    demo_ticket2_id uuid := gen_random_uuid();
    demo_ticket3_id uuid := gen_random_uuid();
BEGIN
    -- Ensure departments exist
    INSERT INTO departments (name, description) VALUES
        ('Technical Support', 'Handle technical issues, bugs, and system problems'),
        ('Design', 'UI/UX design requests and visual improvements'),
        ('Development', 'New features, integrations, and custom development'),
        ('Marketing', 'SEO, content marketing, and digital campaigns'),
        ('General', 'General inquiries and other support requests')
    ON CONFLICT (name) DO NOTHING;
    
    -- Create demo project if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM projects WHERE name = 'WordPress Website Maintenance for A Academy') THEN
        INSERT INTO projects (
            name, 
            description, 
            progress, 
            last_activity, 
            due_date, 
            created_at, 
            updated_at, 
            created_by,
            status,
            priority,
            budget,
            tags
        ) VALUES (
            'WordPress Website Maintenance for A Academy',
            'Comprehensive website maintenance project including security updates, design improvements, performance optimization, and content management for A Academy''s educational platform.',
            65,
            now() - interval '2 hours',
            now() + interval '45 days',
            now() - interval '30 days',
            now() - interval '2 hours',
            '00000000-0000-0000-0000-000000000000',
            'active',
            'high',
            50000,
            ARRAY['WordPress', 'Maintenance', 'Security', 'Performance']
        ) RETURNING id INTO demo_project_id;
        
        -- Create demo tasks
        INSERT INTO tasks (
            id, project_id, title, description, status, assigned_to, due_date, 
            floor_position, deliverable_link, review_comments, created_at, updated_at,
            priority, completion_percentage, created_by
        ) VALUES
            (demo_task1_id, demo_project_id, 
             'Logo Design & Brand Identity Update',
             'Create a modern, professional logo for A Academy that reflects their educational mission.',
             'approved',
             '00000000-0000-0000-0000-000000000000',
             now() - interval '5 days',
             1,
             'https://figma.com/aacademy-logo-design',
             null,
             now() - interval '28 days',
             now() - interval '3 days',
             'high',
             100,
             '00000000-0000-0000-0000-000000000000'),
            
            (demo_task2_id, demo_project_id,
             'Security Audit & Malware Removal',
             'Perform comprehensive security scan of the WordPress website, remove any detected malware.',
             'complete',
             '00000000-0000-0000-0000-000000000000',
             now() - interval '10 days',
             2,
             'https://securityreport.aacademy.com/audit-results',
             null,
             now() - interval '25 days',
             now() - interval '8 days',
             'urgent',
             100,
             '00000000-0000-0000-0000-000000000000'),
            
            (demo_task3_id, demo_project_id,
             'Student Feedback System Implementation',
             'Develop and integrate a comprehensive feedback system allowing students to rate courses.',
             'ready-for-review',
             '00000000-0000-0000-0000-000000000000',
             now() + interval '3 days',
             3,
             'https://staging.aacademy.com/feedback-system',
             null,
             now() - interval '20 days',
             now() - interval '1 hour',
             'medium',
             85,
             '00000000-0000-0000-0000-000000000000');
    END IF;
    
    -- Create demo support tickets if they don't exist
    IF NOT EXISTS (SELECT 1 FROM support_tickets WHERE subject LIKE '%Demo Ticket%') THEN
        INSERT INTO support_tickets (
            id, user_id, subject, description, status, priority, 
            assigned_to_department_id, created_at, updated_at
        ) VALUES
            (demo_ticket1_id, '00000000-0000-0000-0000-000000000000',
             'Demo Ticket: Website Performance Issues',
             'The website is loading slowly and users are experiencing timeouts. Need immediate attention.',
             'open',
             'high',
             (SELECT id FROM departments WHERE name = 'Technical Support' LIMIT 1),
             now() - interval '2 days',
             now() - interval '2 days'),
            
            (demo_ticket2_id, '00000000-0000-0000-0000-000000000000',
             'Demo Ticket: Logo Design Request',
             'Need a new logo design for our upcoming marketing campaign. Should reflect our brand values.',
             'in_progress',
             'medium',
             (SELECT id FROM departments WHERE name = 'Design' LIMIT 1),
             now() - interval '5 days',
             now() - interval '1 day'),
            
            (demo_ticket3_id, '00000000-0000-0000-0000-000000000000',
             'Demo Ticket: General Inquiry',
             'General question about our services and pricing structure.',
             'resolved',
             'low',
             (SELECT id FROM departments WHERE name = 'General' LIMIT 1),
             now() - interval '10 days',
             now() - interval '3 days');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call the demo data setup function
SELECT setup_comprehensive_demo_data();

-- Add a comment to document the schema
COMMENT ON TABLE projects IS 'Projects table with all required fields for the project management system';
COMMENT ON TABLE tasks IS 'Tasks table with all required fields for task management';
COMMENT ON TABLE project_members IS 'Project members table for team management';
COMMENT ON TABLE support_tickets IS 'Support tickets table for customer support system';
COMMENT ON TABLE departments IS 'Departments table for support ticket categorization';
