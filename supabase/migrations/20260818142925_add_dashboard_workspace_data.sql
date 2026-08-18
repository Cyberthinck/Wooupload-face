/*
# WooUpload — dashboard workspace data

1. New Tables
- `user_settings` — one private settings record per signed-in user
  - `user_id` uuid primary key and owner
  - `company_name`, `company_code` editable workspace details
  - `rest_base_url` allowlisted REST service base URL configured by the user
  - `woo_store_url` WooCommerce store URL
  - `created_at`, `updated_at`
- `activity_logs` — private activity history created by the signed-in user
  - `id`, `user_id`, `title`, `detail`, `kind`, `created_at`
- `workspace_invitations` — invitation requests created by the signed-in user
  - `id`, `inviter_id`, `email`, `role`, `status`, `created_at`

2. Security
- RLS is enabled on all tables.
- Each table has four separate CRUD policies scoped to auth.uid().
- User-owned records default their owner from auth.uid().
- No API secrets are stored in these tables; REST and WooCommerce URLs are configuration only.
*/

CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT '',
  company_code text NOT NULL DEFAULT '',
  rest_base_url text NOT NULL DEFAULT '',
  woo_store_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_user_settings" ON user_settings;
CREATE POLICY "select_own_user_settings" ON user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_user_settings" ON user_settings;
CREATE POLICY "insert_own_user_settings" ON user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_user_settings" ON user_settings;
CREATE POLICY "update_own_user_settings" ON user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_user_settings" ON user_settings;
CREATE POLICY "delete_own_user_settings" ON user_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  detail text,
  kind text NOT NULL DEFAULT 'info',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_activity_logs" ON activity_logs;
CREATE POLICY "select_own_activity_logs" ON activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_activity_logs" ON activity_logs;
CREATE POLICY "insert_own_activity_logs" ON activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_activity_logs" ON activity_logs;
CREATE POLICY "update_own_activity_logs" ON activity_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_activity_logs" ON activity_logs;
CREATE POLICY "delete_own_activity_logs" ON activity_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_workspace_invitations" ON workspace_invitations;
CREATE POLICY "select_own_workspace_invitations" ON workspace_invitations FOR SELECT TO authenticated USING (auth.uid() = inviter_id);
DROP POLICY IF EXISTS "insert_own_workspace_invitations" ON workspace_invitations;
CREATE POLICY "insert_own_workspace_invitations" ON workspace_invitations FOR INSERT TO authenticated WITH CHECK (auth.uid() = inviter_id);
DROP POLICY IF EXISTS "update_own_workspace_invitations" ON workspace_invitations;
CREATE POLICY "update_own_workspace_invitations" ON workspace_invitations FOR UPDATE TO authenticated USING (auth.uid() = inviter_id) WITH CHECK (auth.uid() = inviter_id);
DROP POLICY IF EXISTS "delete_own_workspace_invitations" ON workspace_invitations;
CREATE POLICY "delete_own_workspace_invitations" ON workspace_invitations FOR DELETE TO authenticated USING (auth.uid() = inviter_id);

CREATE INDEX IF NOT EXISTS activity_logs_user_created_idx ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS workspace_invitations_inviter_idx ON workspace_invitations(inviter_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_user_settings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS user_settings_set_updated_at ON user_settings;
CREATE TRIGGER user_settings_set_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION set_user_settings_updated_at();
