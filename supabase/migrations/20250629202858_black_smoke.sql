/*
  # Demo Data Setup for A Academy Project

  1. Demo Structure
    - Creates demo project data that can be used once real users sign up
    - Sets up departments, sample project, tasks, and support tickets
    - Provides demo credentials information for frontend use

  2. Demo Scenario
    - Organization: A Academy (Educational Institution)
    - Project: WordPress Website Maintenance
    - Roles: Owner, Developer, Client, Viewer, Super Admin
    - Features: Complete task workflow, comments, support tickets

  3. Usage
    - Users can sign up with demo emails to get pre-configured data
    - One-click demo login will use these predefined credentials
    - All demo data is realistic and production-ready
*/

-- Ensure departments exist for demo
INSERT INTO departments (name, description) VALUES
  ('Technical Support', 'Website maintenance, bug fixes, and technical issues'),
  ('Design', 'UI/UX design, graphics, and visual content'),
  ('Development', 'New features, integrations, and custom development'),
  ('Marketing', 'SEO, content marketing, and digital campaigns'),
  ('General', 'General inquiries and other support requests')
ON CONFLICT (name) DO NOTHING;

-- Create a function to set up demo data for a user when they sign up with demo credentials
CREATE OR REPLACE FUNCTION setup_demo_user_data(user_id uuid, user_email text)
RETURNS void AS $$
DECLARE
    project_id uuid;
    owner_id uuid;
    developer_id uuid;
    client_id uuid;
    viewer_id uuid;
    admin_id uuid;
    task1_id uuid := gen_random_uuid();
    task2_id uuid := gen_random_uuid();
    task3_id uuid := gen_random_uuid();
    task4_id uuid := gen_random_uuid();
    task5_id uuid := gen_random_uuid();
    task6_id uuid := gen_random_uuid();
    ticket1_id uuid := gen_random_uuid();
    ticket2_id uuid := gen_random_uuid();
    ticket3_id uuid := gen_random_uuid();
    dept_tech_id uuid;
    dept_design_id uuid;
    dept_general_id uuid;
    demo_project_exists boolean := false;
BEGIN
    -- Get department IDs
    SELECT id INTO dept_tech_id FROM departments WHERE name = 'Technical Support';
    SELECT id INTO dept_design_id FROM departments WHERE name = 'Design';
    SELECT id INTO dept_general_id FROM departments WHERE name = 'General';

    -- Check if demo project already exists
    SELECT EXISTS(
        SELECT 1 FROM projects WHERE name = 'WordPress Website Maintenance for A Academy'
    ) INTO demo_project_exists;

    -- Only proceed if this is a demo email and demo project doesn't exist
    IF user_email IN ('owner@aacademy.com', 'developer@aacademy.com', 'client@aacademy.com', 'viewer@aacademy.com', 'admin@mojodigital.com') 
       AND NOT demo_project_exists THEN
        
        -- Set up the user's profile based on their email
        IF user_email = 'owner@aacademy.com' THEN
            UPDATE profiles SET 
                full_name = 'Sarah Johnson',
                global_role = 'user',
                timezone = 'America/New_York',
                is_verified = true
            WHERE id = user_id;
            
            -- Create the demo project
            INSERT INTO projects (name, description, completion_percentage, last_activity, deadline, created_at, updated_at, owner_id) 
            VALUES (
                'WordPress Website Maintenance for A Academy',
                'Comprehensive website maintenance project including security updates, design improvements, performance optimization, and content management for A Academy''s educational platform. This project involves logo redesign, malware removal, user feedback implementation, and ongoing technical support.',
                65,
                now() - interval '2 hours',
                now() + interval '45 days',
                now() - interval '30 days',
                now() - interval '2 hours',
                user_id
            ) RETURNING id INTO project_id;

            -- Add owner as project member
            INSERT INTO project_members (project_id, user_id, role, invited_by, invited_at, joined_at, created_at, updated_at) 
            VALUES (project_id, user_id, 'owner', null, now() - interval '30 days', now() - interval '30 days', now() - interval '30 days', now() - interval '30 days');

        ELSIF user_email = 'developer@aacademy.com' THEN
            UPDATE profiles SET 
                full_name = 'Mike Chen',
                global_role = 'user',
                timezone = 'America/Los_Angeles',
                is_verified = true
            WHERE id = user_id;

        ELSIF user_email = 'client@aacademy.com' THEN
            UPDATE profiles SET 
                full_name = 'Lisa Rodriguez',
                global_role = 'user',
                timezone = 'America/Chicago',
                is_verified = true
            WHERE id = user_id;

        ELSIF user_email = 'viewer@aacademy.com' THEN
            UPDATE profiles SET 
                full_name = 'Tom Wilson',
                global_role = 'user',
                timezone = 'America/Denver',
                is_verified = true
            WHERE id = user_id;

        ELSIF user_email = 'admin@mojodigital.com' THEN
            UPDATE profiles SET 
                full_name = 'Admin User',
                global_role = 'super_admin',
                timezone = 'UTC',
                is_verified = true
            WHERE id = user_id;
        END IF;

        -- If this is the owner, create all the demo tasks and data
        IF user_email = 'owner@aacademy.com' THEN
            -- Create demo tasks
            INSERT INTO tasks (id, project_id, title, description, status, assignee_id, due_date, floor_position, deliverable_link, review_comments, created_at, updated_at) VALUES
            
            (task1_id, project_id, 
             'Logo Design & Brand Identity Update',
             'Create a modern, professional logo for A Academy that reflects their educational mission. Include primary logo, variations, color palette, and brand guidelines. The logo should be versatile for web, print, and merchandise applications.',
             'approved',
             user_id,
             now() - interval '5 days',
             1,
             'https://figma.com/aacademy-logo-design',
             null,
             now() - interval '28 days',
             now() - interval '3 days'),

            (task2_id, project_id,
             'Security Audit & Malware Removal',
             'Perform comprehensive security scan of the WordPress website, remove any detected malware, update all plugins and themes, implement security hardening measures, and set up monitoring for future threats.',
             'complete',
             user_id,
             now() - interval '10 days',
             2,
             'https://securityreport.aacademy.com/audit-results',
             null,
             now() - interval '25 days',
             now() - interval '8 days'),

            (task3_id, project_id,
             'Student Feedback System Implementation',
             'Develop and integrate a comprehensive feedback system allowing students to rate courses, provide comments, and suggest improvements. Include admin dashboard for managing feedback and generating reports.',
             'ready-for-review',
             user_id,
             now() + interval '3 days',
             3,
             'https://staging.aacademy.com/feedback-system',
             null,
             now() - interval '20 days',
             now() - interval '1 hour'),

            (task4_id, project_id,
             'Website Performance Optimization',
             'Optimize website loading speeds, implement caching solutions, compress images, minify CSS/JS files, and improve Core Web Vitals scores. Target: achieve 90+ PageSpeed score.',
             'revisions-requested',
             user_id,
             now() + interval '7 days',
             4,
             'https://performance.aacademy.com/optimization-report',
             'Great work on the caching implementation! However, the image compression needs improvement - some images are still quite large. Also, please implement lazy loading for below-the-fold content. The CSS minification is working well.',
             now() - interval '18 days',
             now() - interval '6 hours'),

            (task5_id, project_id,
             'Staff Training: Content Management System',
             'Provide comprehensive training to A Academy staff on using WordPress CMS, including content creation, media management, user roles, and basic troubleshooting. Create training materials and documentation.',
             'in-progress',
             user_id,
             now() + interval '10 days',
             5,
             null,
             null,
             now() - interval '15 days',
             now() - interval '4 hours'),

            (task6_id, project_id,
             'Mobile Responsiveness Enhancement',
             'Ensure the website is fully responsive across all device types. Test and optimize for mobile phones, tablets, and various screen sizes. Implement touch-friendly navigation and improve mobile user experience.',
             'pending',
             user_id,
             now() + interval '15 days',
             6,
             null,
             null,
             now() - interval '10 days',
             now() - interval '10 days');

            -- Add realistic comments to tasks
            INSERT INTO comments (task_id, user_id, content, created_at, updated_at) VALUES
            
            (task1_id, user_id, 
             'The initial logo concepts look great! I particularly like the modern approach with the graduation cap integrated into the "A". Could we see a version with our school colors (navy blue and gold)?',
             now() - interval '15 days', now() - interval '15 days'),
            
            (task1_id, user_id,
             'The final logo design is perfect! It captures our educational mission while looking modern and professional. The brand guidelines document is very comprehensive.',
             now() - interval '3 days', now() - interval '3 days'),

            (task3_id, user_id,
             'The feedback system is now live on staging. Students can rate courses on a 5-star scale, leave detailed comments, and suggest improvements. The admin dashboard shows real-time analytics.',
             now() - interval '2 hours', now() - interval '2 hours'),

            (task4_id, user_id,
             'I''ve implemented the image compression improvements and added lazy loading for all images below the fold. The PageSpeed score has improved from 78 to 89. Working on getting it above 90.',
             now() - interval '4 hours', now() - interval '4 hours'),

            (task5_id, user_id,
             'The training sessions have been very helpful! Our staff is much more confident using the CMS now. The documentation you provided is excellent - we''re using it as our reference guide.',
             now() - interval '2 days', now() - interval '2 days');

            -- Create demo support tickets
            INSERT INTO support_tickets (id, user_id, subject, description, status, priority, assigned_to_department_id, assigned_to_user_id, created_at, updated_at) VALUES
            
            (ticket1_id, user_id,
             'Login Issues for Students',
             'Several students are reporting that they cannot log into their accounts. They receive an "Invalid credentials" error even when using the correct username and password. This started happening yesterday around 3 PM EST. Approximately 15-20 students are affected.',
             'in_progress',
             'high',
             dept_tech_id,
             null,
             now() - interval '1 day',
             now() - interval '3 hours'),

            (ticket2_id, user_id,
             'Course Catalog Page Design Update',
             'We need to update the design of our course catalog page to better showcase our new programs. The current layout feels outdated and doesn''t highlight our premium courses effectively. We''d like a more modern, grid-based layout with better filtering options.',
             'open',
             'medium',
             dept_design_id,
             null,
             now() - interval '6 hours',
             now() - interval '6 hours'),

            (ticket3_id, user_id,
             'How to Add New Course Materials',
             'I need help understanding how to upload and organize new course materials in the system. Specifically, I want to know the best practices for file naming, folder structure, and how to make materials available to specific student groups.',
             'resolved',
             'low',
             dept_general_id,
             null,
             now() - interval '3 days',
             now() - interval '1 day');

            -- Add ticket messages
            INSERT INTO ticket_messages (ticket_id, user_id, content, created_at, updated_at) VALUES
            
            (ticket1_id, user_id,
             'This is becoming urgent as it''s affecting our students'' ability to access their coursework. The affected students are primarily in our Advanced Mathematics and Science programs.',
             now() - interval '1 day', now() - interval '1 day'),

            (ticket3_id, user_id,
             'I''m specifically looking for guidance on organizing video lectures, PDF handouts, and interactive assignments. Should these be in separate folders?',
             now() - interval '3 days', now() - interval '3 days'),
            
            (ticket3_id, user_id,
             'Perfect! This is exactly what I needed. The email guide was very helpful. Thank you for the quick response!',
             now() - interval '1 day', now() - interval '1 day');

        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically set up demo data when demo users sign up
CREATE OR REPLACE FUNCTION handle_demo_user_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Call the demo setup function for demo emails
    PERFORM setup_demo_user_data(NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for demo user setup (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_demo_user_created'
    ) THEN
        CREATE TRIGGER on_demo_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION handle_demo_user_signup();
    END IF;
END $$;

-- Create a function to get demo credentials (for frontend use)
CREATE OR REPLACE FUNCTION get_demo_credentials()
RETURNS TABLE (
    role text,
    email text,
    password text,
    full_name text,
    description text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'owner'::text as role,
        'owner@aacademy.com'::text as email,
        'DemoPass123!'::text as password,
        'Sarah Johnson'::text as full_name,
        'Project Owner - Full access to create projects, manage team members, and oversee all aspects of project development.'::text as description
    UNION ALL
    SELECT 
        'developer'::text,
        'developer@aacademy.com'::text,
        'DemoPass123!'::text,
        'Mike Chen'::text,
        'Developer - Can create and manage tasks, upload deliverables, and collaborate on project development.'::text
    UNION ALL
    SELECT 
        'client'::text,
        'client@aacademy.com'::text,
        'DemoPass123!'::text,
        'Lisa Rodriguez'::text,
        'Client - Can review work, approve tasks, request revisions, and provide feedback on deliverables.'::text
    UNION ALL
    SELECT 
        'viewer'::text,
        'viewer@aacademy.com'::text,
        'DemoPass123!'::text,
        'Tom Wilson'::text,
        'Viewer - Read-only access to view project progress, tasks, and basic project information.'::text
    UNION ALL
    SELECT 
        'admin'::text,
        'admin@mojodigital.com'::text,
        'DemoPass123!'::text,
        'Admin User'::text,
        'Super Admin - Full system access including user management, support tickets, and administrative functions.'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to add other demo users to the project when they sign up
CREATE OR REPLACE FUNCTION add_demo_user_to_project(user_id uuid, user_email text)
RETURNS void AS $$
DECLARE
    project_id uuid;
    owner_id uuid;
    user_role text;
BEGIN
    -- Get the demo project ID
    SELECT p.id, p.owner_id INTO project_id, owner_id 
    FROM projects p 
    WHERE p.name = 'WordPress Website Maintenance for A Academy'
    LIMIT 1;

    -- Only proceed if demo project exists and this is a demo user
    IF project_id IS NOT NULL AND user_email IN ('developer@aacademy.com', 'client@aacademy.com', 'viewer@aacademy.com') THEN
        
        -- Determine role based on email
        CASE user_email
            WHEN 'developer@aacademy.com' THEN user_role := 'developer';
            WHEN 'client@aacademy.com' THEN user_role := 'client';
            WHEN 'viewer@aacademy.com' THEN user_role := 'viewer';
        END CASE;

        -- Add user to project if not already a member
        INSERT INTO project_members (project_id, user_id, role, invited_by, invited_at, joined_at, created_at, updated_at) 
        VALUES (
            project_id, 
            user_id, 
            user_role, 
            owner_id, 
            now() - interval '25 days', 
            now() - interval '25 days', 
            now() - interval '25 days', 
            now() - interval '25 days'
        )
        ON CONFLICT (project_id, user_id) DO NOTHING;

        -- Update task assignees for developer
        IF user_email = 'developer@aacademy.com' THEN
            UPDATE tasks 
            SET assignee_id = user_id 
            WHERE project_id = project_id 
            AND title IN (
                'Logo Design & Brand Identity Update',
                'Security Audit & Malware Removal',
                'Student Feedback System Implementation',
                'Website Performance Optimization',
                'Mobile Responsiveness Enhancement'
            );
        END IF;

        -- Update task assignees for client
        IF user_email = 'client@aacademy.com' THEN
            UPDATE tasks 
            SET assignee_id = user_id 
            WHERE project_id = project_id 
            AND title = 'Staff Training: Content Management System';

            -- Add client comments
            INSERT INTO comments (task_id, user_id, content, created_at, updated_at)
            SELECT t.id, user_id, 
                   'This looks fantastic! The interface is very user-friendly. One question: can we add the ability for instructors to respond to feedback directly through the system?',
                   now() - interval '1 hour', now() - interval '1 hour'
            FROM tasks t 
            WHERE t.project_id = project_id 
            AND t.title = 'Student Feedback System Implementation'
            AND NOT EXISTS (
                SELECT 1 FROM comments c 
                WHERE c.task_id = t.id AND c.user_id = user_id
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the demo user signup function to also add users to existing projects
CREATE OR REPLACE FUNCTION handle_demo_user_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Set up demo data for owner
    PERFORM setup_demo_user_data(NEW.id, NEW.email);
    
    -- Add other demo users to existing project
    PERFORM add_demo_user_to_project(NEW.id, NEW.email);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for demo project overview
CREATE OR REPLACE VIEW demo_project_overview AS
SELECT 
    p.name as project_name,
    p.completion_percentage,
    p.deadline,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status IN ('complete', 'approved') THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN t.status = 'ready-for-review' THEN 1 END) as review_tasks,
    COUNT(pm.id) as team_members
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE p.name = 'WordPress Website Maintenance for A Academy'
GROUP BY p.id, p.name, p.completion_percentage, p.deadline;

-- Add comments to document the demo setup
COMMENT ON FUNCTION get_demo_credentials() IS 'Returns demo user credentials for testing. Password for all demo accounts is "DemoPass123!"';
COMMENT ON FUNCTION setup_demo_user_data(uuid, text) IS 'Sets up demo project data when demo users sign up';
COMMENT ON FUNCTION add_demo_user_to_project(uuid, text) IS 'Adds demo users to existing demo project';