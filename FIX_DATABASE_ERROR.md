# Fix Database Error - User Registration Issue

## Problem
The user registration is failing with "Database error saving new user" because the trigger that creates profile records when new users sign up is not properly configured in your Supabase instance.

## Solution

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ugctohwrmliejdbrkter

2. Navigate to the **SQL Editor** section

3. Copy and paste the contents of `fix-user-trigger.sql` file

4. Click **Run** to execute the SQL

5. You should see a success message

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push --db-url "postgresql://postgres:[YOUR-DB-PASSWORD]@db.ugctohwrmliejdbrkter.supabase.co:5432/postgres"
```

### Option 3: Run the Full Migration

If the above doesn't work, you may need to run the full migration:

1. Go to Supabase Dashboard SQL Editor
2. Run the entire `supabase/migrations/001_initial_schema.sql` file

## Verification

After applying the fix, test user registration:

1. Run the test script:
   ```bash
   node test-db-connection.js
   ```

2. Or manually test by:
   - Going to http://localhost:3000/auth/sign-up
   - Creating a new account
   - Check if the user appears in the Supabase Dashboard under Authentication > Users

## Root Cause

The issue occurs because:
1. The Supabase project was created but the database migrations weren't fully applied
2. The trigger `on_auth_user_created` that automatically creates a profile record when a user signs up is missing
3. Without this trigger, the auth system creates the user but fails when it can't create the corresponding profile

## Additional Notes

- The profiles table exists and has the correct structure
- The foreign key constraint to auth.users is properly set up
- Only the trigger and function need to be created to fix the issue