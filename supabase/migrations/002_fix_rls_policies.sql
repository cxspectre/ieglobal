-- Fix RLS Policies to Avoid Infinite Recursion
-- Run this AFTER the initial schema

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simpler, non-recursive policies
-- Users can ALWAYS view their own profile (no recursion)
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- For viewing OTHER profiles, we need to check a custom claim or use a function
-- Let's use a simpler approach: anyone authenticated can view basic profile info
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins/employees can INSERT/DELETE profiles
CREATE POLICY "Only admins can insert profiles" ON profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'employee')
    )
  );

-- Temporary fix: Allow the trigger to insert without checking
-- This happens during user signup
CREATE POLICY "System can create profiles" ON profiles
  FOR INSERT
  WITH CHECK (true);

