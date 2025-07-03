/*
  # Add timezone support to profiles

  1. Changes
    - Add `timezone` column to `profiles` table
    - Set default timezone based on user preference
    - Update existing profiles to have a default timezone

  2. Security
    - No changes to RLS policies needed
    - Users can update their own timezone through existing policies
*/

-- Add timezone column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN timezone text;
  END IF;
END $$;

-- Update the handle_new_user_profile function to include timezone
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, global_role, timezone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    'UTC' -- Default timezone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set default timezone for existing profiles without one
UPDATE profiles 
SET timezone = 'UTC' 
WHERE timezone IS NULL;