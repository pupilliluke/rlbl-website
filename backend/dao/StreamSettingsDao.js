const { query } = require('../../lib/database');

class StreamSettingsDao {
    constructor() {
        this.tableName = 'stream_settings';
    }

    /**
     * Get a specific setting by key
     * @param {string} key - The setting key
     * @returns {Promise<Object|null>} Setting object or null if not found
     */
    async getSetting(key) {
        try {
            const result = await query(
                'SELECT * FROM stream_settings WHERE setting_key = $1',
                [key]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error(`Error getting setting ${key}:`, error);
            throw error;
        }
    }

    /**
     * Get the value of a specific setting by key
     * @param {string} key - The setting key
     * @returns {Promise<string|null>} Setting value or null if not found
     */
    async getSettingValue(key) {
        try {
            const setting = await this.getSetting(key);
            return setting ? setting.setting_value : null;
        } catch (error) {
            console.error(`Error getting setting value ${key}:`, error);
            throw error;
        }
    }

    /**
     * Update or insert a setting
     * @param {string} key - The setting key
     * @param {string} value - The setting value
     * @param {string} [description] - Optional description
     * @returns {Promise<Object>} Updated setting object
     */
    async setSetting(key, value, description = null) {
        try {
            const result = await query(
                `INSERT INTO stream_settings (setting_key, setting_value, description)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (setting_key)
                 DO UPDATE SET
                   setting_value = EXCLUDED.setting_value,
                   description = COALESCE(EXCLUDED.description, stream_settings.description),
                   updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [key, value, description || '']
            );
            return result.rows[0];
        } catch (error) {
            console.error(`Error setting ${key}:`, error);
            throw error;
        }
    }

    /**
     * Get all settings
     * @returns {Promise<Array>} Array of all settings
     */
    async getAllSettings() {
        try {
            const result = await query('SELECT * FROM stream_settings ORDER BY setting_key');
            return result.rows;
        } catch (error) {
            console.error('Error getting all settings:', error);
            throw error;
        }
    }

    /**
     * Delete a setting by key
     * @param {string} key - The setting key
     * @returns {Promise<boolean>} True if deleted, false if not found
     */
    async deleteSetting(key) {
        try {
            const result = await query(
                'DELETE FROM stream_settings WHERE setting_key = $1',
                [key]
            );
            return result.rowCount > 0;
        } catch (error) {
            console.error(`Error deleting setting ${key}:`, error);
            throw error;
        }
    }
}

module.exports = StreamSettingsDao;