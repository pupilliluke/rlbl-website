const { query } = require('../../lib/database');

class StreamChatDao {
    constructor() {
        this.tableName = 'stream_chat_messages';
    }

    /**
     * Get recent chat messages (limited to prevent spam)
     * @param {number} limit - Maximum number of messages to return (default 50)
     * @param {number} offset - Offset for pagination (default 0)
     * @returns {Promise<Array>} Array of chat messages
     */
    async getRecentMessages(limit = 50, offset = 0) {
        try {
            // Limit to maximum of 100 messages per request
            const safeLimit = Math.min(limit, 100);

            const result = await query(
                `SELECT id, message_text, user_color, created_at
                 FROM stream_chat_messages
                 WHERE is_deleted = false
                 ORDER BY created_at DESC
                 LIMIT $1 OFFSET $2`,
                [safeLimit, offset]
            );

            // Reverse to show oldest first
            return result.rows.reverse();
        } catch (error) {
            console.error('Error getting recent messages:', error);
            throw error;
        }
    }

    /**
     * Add a new chat message
     * @param {string} messageText - The message content
     * @param {string} userColor - The user's anonymous color
     * @param {string} [ipAddress] - Optional IP address for moderation
     * @returns {Promise<Object>} Created message object
     */
    async addMessage(messageText, userColor, ipAddress = null) {
        try {
            // Sanitize message text (basic protection)
            const sanitizedText = messageText.trim();

            if (!sanitizedText) {
                throw new Error('Message text cannot be empty');
            }

            if (sanitizedText.length > 500) {
                throw new Error('Message text cannot exceed 500 characters');
            }

            const result = await query(
                'INSERT INTO stream_chat_messages (message_text, user_color, ip_address) VALUES ($1, $2, $3) RETURNING id, message_text, user_color, created_at',
                [sanitizedText, userColor, ipAddress]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error adding message:', error);
            throw error;
        }
    }

    /**
     * Soft delete a message (for moderation)
     * @param {number} messageId - ID of the message to delete
     * @returns {Promise<boolean>} True if deleted, false if not found
     */
    async deleteMessage(messageId) {
        try {
            const result = await query(
                'UPDATE stream_chat_messages SET is_deleted = true WHERE id = $1 AND is_deleted = false',
                [messageId]
            );
            return result.rowCount > 0;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    /**
     * Get message count (for pagination)
     * @returns {Promise<number>} Total number of active messages
     */
    async getMessageCount() {
        try {
            const result = await query(
                'SELECT COUNT(*) as count FROM stream_chat_messages WHERE is_deleted = false'
            );
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error getting message count:', error);
            throw error;
        }
    }

    /**
     * Clean up old messages (keep only recent ones)
     * @param {number} keepCount - Number of recent messages to keep (default 1000)
     * @returns {Promise<number>} Number of messages deleted
     */
    async cleanupOldMessages(keepCount = 1000) {
        try {
            const result = await this.db.run(
                `DELETE FROM stream_chat_messages
                 WHERE id NOT IN (
                     SELECT id FROM stream_chat_messages
                     ORDER BY created_at DESC
                     LIMIT ?
                 )`,
                [keepCount]
            );
            return result.changes;
        } catch (error) {
            console.error('Error cleaning up old messages:', error);
            throw error;
        }
    }

    /**
     * Delete all chat messages (admin only)
     * @returns {Promise<number>} Number of messages deleted
     */
    async deleteAllMessages() {
        try {
            const result = await query('DELETE FROM stream_chat_messages');
            return result.rowCount;
        } catch (error) {
            console.error('Error deleting all messages:', error);
            throw error;
        }
    }

    /**
     * Get messages by IP address (for moderation)
     * @param {string} ipAddress - IP address to search for
     * @param {number} limit - Maximum number of messages to return
     * @returns {Promise<Array>} Array of messages from that IP
     */
    async getMessagesByIP(ipAddress, limit = 20) {
        try {
            const result = await query(
                `SELECT id, message_text, user_color, created_at, is_deleted
                 FROM stream_chat_messages
                 WHERE ip_address = $1
                 ORDER BY created_at DESC
                 LIMIT $2`,
                [ipAddress, limit]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting messages by IP:', error);
            throw error;
        }
    }
}

module.exports = StreamChatDao;