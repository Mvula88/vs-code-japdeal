-- First, ensure the profiles table has the correct structure
-- Check if the table exists and has correct columns
DO $$ 
BEGIN
    -- Ensure custom types exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('buyer', 'admin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
    END IF;
END $$;

-- Drop existing trigger and function to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the function in public schema with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert the profile with error handling
    INSERT INTO public.profiles (
        id,
        email,
        display_name,
        role,
        status,
        created_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            split_part(NEW.email, '@', 1)
        ),
        'buyer'::user_role,
        'active'::user_status,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        last_login_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail the auth transaction
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- Verify the setup
DO $$
DECLARE
    trigger_exists boolean;
    function_exists boolean;
BEGIN
    -- Check if trigger exists
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) INTO trigger_exists;
    
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user'
    ) INTO function_exists;
    
    IF trigger_exists AND function_exists THEN
        RAISE NOTICE 'SUCCESS: Trigger and function created successfully!';
    ELSE
        IF NOT trigger_exists THEN
            RAISE WARNING 'Trigger was not created';
        END IF;
        IF NOT function_exists THEN
            RAISE WARNING 'Function was not created';
        END IF;
    END IF;
END $$;

-- Alternative: Create a simpler version if the above fails
-- This creates a function that can be called manually if trigger doesn't work
CREATE OR REPLACE FUNCTION public.create_profile_for_user(user_id uuid, user_email text, user_display_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, role, status, created_at)
    VALUES (
        user_id,
        user_email,
        COALESCE(user_display_name, split_part(user_email, '@', 1)),
        'buyer'::user_role,
        'active'::user_status,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        last_login_at = NOW();
END;
$$;

-- Grant permission to call this function
GRANT EXECUTE ON FUNCTION public.create_profile_for_user TO anon, authenticated;