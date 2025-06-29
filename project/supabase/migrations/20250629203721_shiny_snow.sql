/*
  # Demo Data Setup Migration

  1. Departments
    - Creates support departments (Technical Support, Design, General)
    - Uses ON CONFLICT to prevent duplicate entries

  2. Demo Credentials Function
    - Provides demo user credentials for client-side authentication
    - Returns email/password combinations for testing

  Note: User-dependent data (profiles, projects, tasks, etc.) will be created
  dynamically by the client application after successful demo user signup.
  This ensures proper foreign key relationships with auth.users table.
*/

-- Create departments for support system
INSERT INTO departments (id, name, description, created_at, updated_at) VALUES
(gen_random_uuid(), 'Technical Support', 'Handle technical issues, bugs, and system problems', now(), now()),
(gen_random_uuid(), 'Design', 'UI/UX design requests and visual improvements', now(), now()),
(gen_random_uuid(), 'General', 'General inquiries and non-technical support', now(), now())
ON CONFLICT (name) DO NOTHING;

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

-- Add a comment to document the demo setup
COMMENT ON FUNCTION get_demo_credentials() IS 'Returns demo user credentials for testing. Password for all demo accounts is "DemoPass123!". User-dependent data will be created by the client application after successful signup.';