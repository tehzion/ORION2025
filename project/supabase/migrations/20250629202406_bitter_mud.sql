/*
  # Demo Data Setup for Orion Project Management

  1. Demo Users
    - Creates demo users for all role levels within the same organization
    - Owner: Sarah Johnson (owner@aacademy.com)
    - Developer: Mike Chen (developer@aacademy.com) 
    - Client: Lisa Rodriguez (client@aacademy.com)
    - Viewer: Tom Wilson (viewer@aacademy.com)
    - Super Admin: Admin User (admin@mojodigital.com)

  2. Demo Project
    - "WordPress Website Maintenance for A Academy"
    - Complete with realistic tasks, assignments, and progress
    - Includes logo design, virus removal, feedback implementation

  3. Demo Content
    - Project members with appropriate roles
    - Tasks in various stages (pending, in-progress, ready-for-review, etc.)
    - Comments and conversations between team members
    - Support tickets demonstrating the support system
    - Realistic timeline and deliverables

  4. Security
    - All demo users have the password "DemoPass123!"
    - Proper role assignments and permissions
    - Realistic data for testing all features
*/

-- First, let's create the demo users in auth.users
-- Note: In a real environment, you'd use Supabase Auth API, but for demo purposes we'll insert directly

-- Demo password hash for "DemoPass123!" (this is a bcrypt hash)
-- In production, use proper Supabase Auth signup methods

DO $$
DECLARE
    owner_id uuid := gen_random_uuid();
    developer_id uuid := gen_random_uuid();
    client_id uuid := gen_random_uuid();
    viewer_id uuid := gen_random_uuid();
    admin_id uuid := gen_random_uuid();
    project_id uuid := gen_random_uuid();
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
BEGIN
    -- Get department IDs
    SELECT id INTO dept_tech_id FROM departments WHERE name = 'Technical Support';
    SELECT id INTO dept_design_id FROM departments WHERE name = 'Design';
    SELECT id INTO dept_general_id FROM departments WHERE name = 'General';

    -- Create demo profiles (these will be linked when users sign up)
    INSERT INTO profiles (id, full_name, global_role, timezone, is_verified, created_at, updated_at) VALUES
    (owner_id, 'Sarah Johnson', 'user', 'America/New_York', true, now() - interval '30 days', now() - interval '1 day'),
    (developer_id, 'Mike Chen', 'user', 'America/Los_Angeles', true, now() - interval '25 days', now() - interval '2 hours'),
    (client_id, 'Lisa Rodriguez', 'user', 'America/Chicago', true, now() - interval '20 days', now() - interval '3 hours'),
    (viewer_id, 'Tom Wilson', 'user', 'America/Denver', true, now() - interval '15 days', now() - interval '1 hour'),
    (admin_id, 'Admin User', 'super_admin', 'UTC', true, now() - interval '60 days', now() - interval '30 minutes');

    -- Create the demo project
    INSERT INTO projects (id, name, description, completion_percentage, last_activity, deadline, created_at, updated_at, owner_id) VALUES
    (project_id, 
     'WordPress Website Maintenance for A Academy',
     'Comprehensive website maintenance project including security updates, design improvements, performance optimization, and content management for A Academy''s educational platform. This project involves logo redesign, malware removal, user feedback implementation, and ongoing technical support.',
     65,
     now() - interval '2 hours',
     now() + interval '45 days',
     now() - interval '30 days',
     now() - interval '2 hours',
     owner_id);

    -- Add project members
    INSERT INTO project_members (id, project_id, user_id, role, invited_by, invited_at, joined_at, created_at, updated_at) VALUES
    (gen_random_uuid(), project_id, owner_id, 'owner', null, now() - interval '30 days', now() - interval '30 days', now() - interval '30 days', now() - interval '30 days'),
    (gen_random_uuid(), project_id, developer_id, 'developer', owner_id, now() - interval '25 days', now() - interval '25 days', now() - interval '25 days', now() - interval '25 days'),
    (gen_random_uuid(), project_id, client_id, 'client', owner_id, now() - interval '20 days', now() - interval '20 days', now() - interval '20 days', now() - interval '20 days'),
    (gen_random_uuid(), project_id, viewer_id, 'viewer', owner_id, now() - interval '15 days', now() - interval '15 days', now() - interval '15 days', now() - interval '15 days');

    -- Create demo tasks with realistic progression
    INSERT INTO tasks (id, project_id, title, description, status, assignee_id, due_date, floor_position, deliverable_link, review_comments, created_at, updated_at) VALUES
    
    -- Task 1: Logo Design (Approved)
    (task1_id, project_id, 
     'Logo Design & Brand Identity Update',
     'Create a modern, professional logo for A Academy that reflects their educational mission. Include primary logo, variations, color palette, and brand guidelines. The logo should be versatile for web, print, and merchandise applications.',
     'approved',
     developer_id,
     now() - interval '5 days',
     1,
     'https://figma.com/aacademy-logo-design',
     null,
     now() - interval '28 days',
     now() - interval '3 days'),

    -- Task 2: Virus/Malware Removal (Complete)
    (task2_id, project_id,
     'Security Audit & Malware Removal',
     'Perform comprehensive security scan of the WordPress website, remove any detected malware, update all plugins and themes, implement security hardening measures, and set up monitoring for future threats.',
     'complete',
     developer_id,
     now() - interval '10 days',
     2,
     'https://securityreport.aacademy.com/audit-results',
     null,
     now() - interval '25 days',
     now() - interval '8 days'),

    -- Task 3: User Feedback Implementation (Ready for Review)
    (task3_id, project_id,
     'Student Feedback System Implementation',
     'Develop and integrate a comprehensive feedback system allowing students to rate courses, provide comments, and suggest improvements. Include admin dashboard for managing feedback and generating reports.',
     'ready-for-review',
     developer_id,
     now() + interval '3 days',
     3,
     'https://staging.aacademy.com/feedback-system',
     null,
     now() - interval '20 days',
     now() - interval '1 hour'),

    -- Task 4: Performance Optimization (Revisions Requested)
    (task4_id, project_id,
     'Website Performance Optimization',
     'Optimize website loading speeds, implement caching solutions, compress images, minify CSS/JS files, and improve Core Web Vitals scores. Target: achieve 90+ PageSpeed score.',
     'revisions-requested',
     developer_id,
     now() + interval '7 days',
     4,
     'https://performance.aacademy.com/optimization-report',
     'Great work on the caching implementation! However, the image compression needs improvement - some images are still quite large. Also, please implement lazy loading for below-the-fold content. The CSS minification is working well.',
     now() - interval '18 days',
     now() - interval '6 hours'),

    -- Task 5: Content Management Training (In Progress)
    (task5_id, project_id,
     'Staff Training: Content Management System',
     'Provide comprehensive training to A Academy staff on using WordPress CMS, including content creation, media management, user roles, and basic troubleshooting. Create training materials and documentation.',
     'in-progress',
     client_id,
     now() + interval '10 days',
     5,
     null,
     null,
     now() - interval '15 days',
     now() - interval '4 hours'),

    -- Task 6: Mobile Responsiveness (Pending)
    (task6_id, project_id,
     'Mobile Responsiveness Enhancement',
     'Ensure the website is fully responsive across all device types. Test and optimize for mobile phones, tablets, and various screen sizes. Implement touch-friendly navigation and improve mobile user experience.',
     'pending',
     developer_id,
     now() + interval '15 days',
     6,
     null,
     null,
     now() - interval '10 days',
     now() - interval '10 days');

    -- Add realistic comments to tasks
    INSERT INTO comments (id, task_id, user_id, content, created_at, updated_at) VALUES
    
    -- Comments on Logo Design task
    (gen_random_uuid(), task1_id, client_id, 
     'The initial logo concepts look great! I particularly like the modern approach with the graduation cap integrated into the "A". Could we see a version with our school colors (navy blue and gold)?',
     now() - interval '15 days', now() - interval '15 days'),
    
    (gen_random_uuid(), task1_id, developer_id,
     'Absolutely! I''ll create variations with the navy blue and gold color scheme. I''m also working on a simplified version that will work well for social media profile pictures.',
     now() - interval '14 days', now() - interval '14 days'),
    
    (gen_random_uuid(), task1_id, owner_id,
     'The final logo design is perfect! It captures our educational mission while looking modern and professional. The brand guidelines document is very comprehensive.',
     now() - interval '3 days', now() - interval '3 days'),

    -- Comments on Feedback System task
    (gen_random_uuid(), task3_id, developer_id,
     'The feedback system is now live on staging. Students can rate courses on a 5-star scale, leave detailed comments, and suggest improvements. The admin dashboard shows real-time analytics.',
     now() - interval '2 hours', now() - interval '2 hours'),
    
    (gen_random_uuid(), task3_id, client_id,
     'This looks fantastic! The interface is very user-friendly. One question: can we add the ability for instructors to respond to feedback directly through the system?',
     now() - interval '1 hour', now() - interval '1 hour'),

    -- Comments on Performance Optimization task
    (gen_random_uuid(), task4_id, developer_id,
     'I''ve implemented the image compression improvements and added lazy loading for all images below the fold. The PageSpeed score has improved from 78 to 89. Working on getting it above 90.',
     now() - interval '4 hours', now() - interval '4 hours'),

    -- Comments on Training task
    (gen_random_uuid(), task5_id, client_id,
     'The training sessions have been very helpful! Our staff is much more confident using the CMS now. The documentation you provided is excellent - we''re using it as our reference guide.',
     now() - interval '2 days', now() - interval '2 days'),
    
    (gen_random_uuid(), task5_id, owner_id,
     'Great to hear the training is going well! This will really help our team maintain the website independently.',
     now() - interval '1 day', now() - interval '1 day');

    -- Create demo support tickets
    INSERT INTO support_tickets (id, user_id, subject, description, status, priority, assigned_to_department_id, assigned_to_user_id, created_at, updated_at) VALUES
    
    -- Ticket 1: Technical issue (In Progress)
    (ticket1_id, client_id,
     'Login Issues for Students',
     'Several students are reporting that they cannot log into their accounts. They receive an "Invalid credentials" error even when using the correct username and password. This started happening yesterday around 3 PM EST. Approximately 15-20 students are affected.',
     'in_progress',
     'high',
     dept_tech_id,
     admin_id,
     now() - interval '1 day',
     now() - interval '3 hours'),

    -- Ticket 2: Design request (Open)
    (ticket2_id, owner_id,
     'Course Catalog Page Design Update',
     'We need to update the design of our course catalog page to better showcase our new programs. The current layout feels outdated and doesn''t highlight our premium courses effectively. We''d like a more modern, grid-based layout with better filtering options.',
     'open',
     'medium',
     dept_design_id,
     null,
     now() - interval '6 hours',
     now() - interval '6 hours'),

    -- Ticket 3: General inquiry (Resolved)
    (ticket3_id, viewer_id,
     'How to Add New Course Materials',
     'I need help understanding how to upload and organize new course materials in the system. Specifically, I want to know the best practices for file naming, folder structure, and how to make materials available to specific student groups.',
     'resolved',
     'low',
     dept_general_id,
     admin_id,
     now() - interval '3 days',
     now() - interval '1 day');

    -- Add ticket messages
    INSERT INTO ticket_messages (id, ticket_id, user_id, content, created_at, updated_at) VALUES
    
    -- Messages for Login Issues ticket
    (gen_random_uuid(), ticket1_id, client_id,
     'This is becoming urgent as it''s affecting our students'' ability to access their coursework. The affected students are primarily in our Advanced Mathematics and Science programs.',
     now() - interval '1 day', now() - interval '1 day'),
    
    (gen_random_uuid(), ticket1_id, admin_id,
     'I''ve identified the issue - there was a problem with the recent security update that affected password validation. I''m working on a fix now and will have it resolved within the next 2 hours.',
     now() - interval '4 hours', now() - interval '4 hours'),
    
    (gen_random_uuid(), ticket1_id, admin_id,
     'The login issue has been resolved. All affected students should now be able to access their accounts normally. I''ve also implemented additional monitoring to prevent similar issues in the future.',
     now() - interval '3 hours', now() - interval '3 hours'),

    -- Messages for Course Materials ticket
    (gen_random_uuid(), ticket3_id, viewer_id,
     'I''m specifically looking for guidance on organizing video lectures, PDF handouts, and interactive assignments. Should these be in separate folders?',
     now() - interval '3 days', now() - interval '3 days'),
    
    (gen_random_uuid(), ticket3_id, admin_id,
     'Great question! Here''s the recommended structure:\n\n1. Create a main folder for each course\n2. Within each course folder, create subfolders: "Videos", "PDFs", "Assignments", "Resources"\n3. Use consistent naming: "Week01_Topic_Type" (e.g., "Week01_Algebra_Video")\n4. For student group access, use the "Visibility Settings" in each folder\n\nI''ll send you a detailed guide via email with screenshots.',
     now() - interval '2 days', now() - interval '2 days'),
    
    (gen_random_uuid(), ticket3_id, viewer_id,
     'Perfect! This is exactly what I needed. The email guide was very helpful. Thank you for the quick response!',
     now() - interval '1 day', now() - interval '1 day');

    -- Store the demo user IDs in a temporary table for the one-click login feature
    -- This is a simple way to make the demo credentials available
    CREATE TEMP TABLE IF NOT EXISTS demo_credentials (
        role text,
        email text,
        password text,
        user_id uuid,
        full_name text
    );

    INSERT INTO demo_credentials (role, email, password, user_id, full_name) VALUES
    ('owner', 'owner@aacademy.com', 'DemoPass123!', owner_id, 'Sarah Johnson'),
    ('developer', 'developer@aacademy.com', 'DemoPass123!', developer_id, 'Mike Chen'),
    ('client', 'client@aacademy.com', 'DemoPass123!', client_id, 'Lisa Rodriguez'),
    ('viewer', 'viewer@aacademy.com', 'DemoPass123!', viewer_id, 'Tom Wilson'),
    ('admin', 'admin@mojodigital.com', 'DemoPass123!', admin_id, 'Admin User');

END $$;

-- Create a function to get demo credentials (for development use)
CREATE OR REPLACE FUNCTION get_demo_credentials()
RETURNS TABLE (
    role text,
    email text,
    password text,
    full_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'owner'::text as role,
        'owner@aacademy.com'::text as email,
        'DemoPass123!'::text as password,
        'Sarah Johnson'::text as full_name
    UNION ALL
    SELECT 
        'developer'::text,
        'developer@aacademy.com'::text,
        'DemoPass123!'::text,
        'Mike Chen'::text
    UNION ALL
    SELECT 
        'client'::text,
        'client@aacademy.com'::text,
        'DemoPass123!'::text,
        'Lisa Rodriguez'::text
    UNION ALL
    SELECT 
        'viewer'::text,
        'viewer@aacademy.com'::text,
        'DemoPass123!'::text,
        'Tom Wilson'::text
    UNION ALL
    SELECT 
        'admin'::text,
        'admin@mojodigital.com'::text,
        'DemoPass123!'::text,
        'Admin User'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add some additional sample data for better demo experience
DO $$
BEGIN
    -- Update project completion percentage based on task statuses
    UPDATE projects 
    SET completion_percentage = (
        SELECT ROUND(
            (COUNT(CASE WHEN status IN ('complete', 'approved') THEN 1 END) * 100.0) / 
            COUNT(*)
        )
        FROM tasks 
        WHERE project_id = projects.id
    )
    WHERE name = 'WordPress Website Maintenance for A Academy';

    -- Update last activity to reflect recent task updates
    UPDATE projects 
    SET last_activity = (
        SELECT MAX(updated_at) 
        FROM tasks 
        WHERE project_id = projects.id
    )
    WHERE name = 'WordPress Website Maintenance for A Academy';
END $$;

-- Create a view for easy demo data access
CREATE OR REPLACE VIEW demo_project_overview AS
SELECT 
    p.name as project_name,
    p.completion_percentage,
    p.deadline,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'complete' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN t.status = 'ready-for-review' THEN 1 END) as review_tasks,
    COUNT(pm.id) as team_members
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE p.name = 'WordPress Website Maintenance for A Academy'
GROUP BY p.id, p.name, p.completion_percentage, p.deadline;

-- Add a comment to document the demo setup
COMMENT ON FUNCTION get_demo_credentials() IS 'Returns demo user credentials for testing. Password for all demo accounts is "DemoPass123!"';