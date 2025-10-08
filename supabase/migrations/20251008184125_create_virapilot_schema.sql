/*
  # ViraPilot Content Management Schema

  1. New Tables
    - `content_items`
      - `id` (uuid, primary key)
      - `source_url` (text) - Original video URL
      - `title` (text) - Video title
      - `description` (text) - Video description
      - `thumbnail_url` (text) - Thumbnail image URL
      - `duration` (integer) - Video duration in seconds
      - `view_count` (bigint) - View count from source
      - `like_count` (bigint) - Like count from source
      - `ai_score` (numeric) - AI analysis score (0-100)
      - `status` (text) - Processing status
      - `processed_video_path` (text) - Path to processed video
      - `uploaded_urls` (jsonb) - URLs where content was uploaded
      - `created_at` (timestamptz)
      - `processed_at` (timestamptz)
      - `uploaded_at` (timestamptz)
    
    - `pipeline_runs`
      - `id` (uuid, primary key)
      - `status` (text) - Run status
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `items_processed` (integer)
      - `items_uploaded` (integer)
      - `error_message` (text)
    
    - `api_keys`
      - `id` (uuid, primary key)
      - `service` (text) - Service name (youtube, tiktok, openai, etc)
      - `key_data` (jsonb) - Encrypted key data
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key
      - `value` (jsonb) - Setting value
      - `updated_at` (timestamptz)
    
    - `processing_jobs`
      - `id` (uuid, primary key)
      - `content_item_id` (uuid, foreign key)
      - `status` (text)
      - `progress` (integer)
      - `error_message` (text)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Create content_items table
CREATE TABLE IF NOT EXISTS content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  thumbnail_url text,
  duration integer DEFAULT 0,
  view_count bigint DEFAULT 0,
  like_count bigint DEFAULT 0,
  ai_score numeric(5,2) DEFAULT 0,
  status text DEFAULT 'discovered',
  processed_video_path text,
  uploaded_urls jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  uploaded_at timestamptz
);

ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON content_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create pipeline_runs table
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text DEFAULT 'running',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  items_processed integer DEFAULT 0,
  items_uploaded integer DEFAULT 0,
  error_message text
);

ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on pipeline_runs"
  ON pipeline_runs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL,
  key_data jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on api_keys"
  ON api_keys FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create processing_jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid REFERENCES content_items(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  progress integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on processing_jobs"
  ON processing_jobs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON content_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_ai_score ON content_items(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started_at ON pipeline_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_content_item_id ON processing_jobs(content_item_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);