-- Fix: allow deleting clients/profiles when messages reference them.
-- messages.sender_id blocks profile deletion; set to NULL on profile delete.

-- Ensure sender_id allows NULL
ALTER TABLE messages ALTER COLUMN sender_id DROP NOT NULL;

-- Drop and recreate FK with ON DELETE SET NULL (preserves messages, nulls sender)
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE SET NULL;
