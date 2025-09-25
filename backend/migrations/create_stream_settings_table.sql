-- Create stream_settings table to store stream configuration
-- This replaces localStorage usage with persistent database storage

CREATE TABLE IF NOT EXISTS stream_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default stream link setting
INSERT INTO stream_settings (setting_key, setting_value, description)
VALUES ('stream_link', '', 'Twitch stream URL for the public stream page')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update the updated_at timestamp
DROP TRIGGER IF EXISTS update_stream_settings_timestamp ON stream_settings;
CREATE TRIGGER update_stream_settings_timestamp
  BEFORE UPDATE ON stream_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create stream_chat_messages table to store anonymous chat messages
CREATE TABLE IF NOT EXISTS stream_chat_messages (
  id SERIAL PRIMARY KEY,
  message_text TEXT NOT NULL,
  user_color VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  is_deleted BOOLEAN DEFAULT false
);

-- Create index for efficient retrieval of recent messages
CREATE INDEX IF NOT EXISTS idx_stream_chat_created_at ON stream_chat_messages(created_at DESC);

-- Create index for non-deleted messages
CREATE INDEX IF NOT EXISTS idx_stream_chat_active ON stream_chat_messages(is_deleted, created_at DESC) WHERE is_deleted = false;