-- Script to make user with email ismaelmvula@gmail.com an admin
-- This updates the user's role in the profiles table

-- Update the user's role to admin
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'ismaelmvula@gmail.com';

-- Verify the update
DO $$ 
DECLARE
    user_count INTEGER;
    user_role TEXT;
BEGIN
    -- Check if user exists and get their role
    SELECT COUNT(*), MAX(role::text) INTO user_count, user_role
    FROM public.profiles 
    WHERE email = 'ismaelmvula@gmail.com';
    
    IF user_count = 0 THEN
        RAISE NOTICE '❌ User with email ismaelmvula@gmail.com not found!';
        RAISE NOTICE 'Please ensure the user has signed up first.';
    ELSIF user_role = 'admin' THEN
        RAISE NOTICE '✅ User ismaelmvula@gmail.com is now an ADMIN!';
        RAISE NOTICE 'This user has full administrative privileges.';
    ELSE
        RAISE NOTICE '⚠️ Update may have failed. Current role: %', user_role;
    END IF;
END $$;

-- Show the updated user details
SELECT id, email, display_name, role, status, created_at 
FROM public.profiles 
WHERE email = 'ismaelmvula@gmail.com';