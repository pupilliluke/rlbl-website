const express = require('express');
const router = express.Router();
const StreamChatDao = require('../dao/StreamChatDao');

// Rate limiting for chat messages (simple in-memory store)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 10; // Max 10 messages per minute per IP

/**
 * Simple rate limiting middleware
 */
const rateLimitMiddleware = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!rateLimitStore.has(clientIP)) {
        rateLimitStore.set(clientIP, { count: 0, resetTime: now + RATE_LIMIT_WINDOW });
    }

    const clientData = rateLimitStore.get(clientIP);

    // Reset if window has passed
    if (now > clientData.resetTime) {
        clientData.count = 0;
        clientData.resetTime = now + RATE_LIMIT_WINDOW;
    }

    // Check if rate limit exceeded
    if (clientData.count >= MAX_MESSAGES_PER_WINDOW) {
        return res.status(429).json({
            success: false,
            message: 'Too many messages. Please wait before sending another message.',
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
    }

    next();
};

/**
 * GET /api/stream-chat/messages - Get recent chat messages
 */
router.get('/messages', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const streamChatDao = new StreamChatDao();

        const messages = await streamChatDao.getRecentMessages(limit, offset);
        const totalCount = await streamChatDao.getMessageCount();

        res.json({
            success: true,
            data: {
                messages,
                totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chat messages',
            error: error.message
        });
    }
});

/**
 * POST /api/stream-chat/messages - Send a new chat message
 */
router.post('/messages', rateLimitMiddleware, async (req, res) => {
    try {
        const { message, userColor } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

        // Validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Message text is required'
            });
        }

        if (!userColor || typeof userColor !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'User color is required'
            });
        }

        // Valid color check
        const validColors = ['purple', 'blue', 'green', 'red', 'yellow', 'pink', 'indigo', 'teal'];
        if (!validColors.includes(userColor)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user color'
            });
        }

        const streamChatDao = new StreamChatDao();

        // Add message to database
        const newMessage = await streamChatDao.addMessage(message, userColor, clientIP);

        // Update rate limit counter
        const clientData = rateLimitStore.get(clientIP);
        if (clientData) {
            clientData.count++;
        }

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Error sending chat message:', error);

        // Handle specific validation errors
        if (error.message.includes('exceed 500 characters') || error.message.includes('cannot be empty')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to send chat message',
            error: error.message
        });
    }
});

/**
 * DELETE /api/stream-chat/messages/:id - Delete a message (admin only)
 */
router.delete('/messages/:id', async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);

        if (!messageId || isNaN(messageId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid message ID is required'
            });
        }

        const streamChatDao = new StreamChatDao();

        const deleted = await streamChatDao.deleteMessage(messageId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting chat message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete chat message',
            error: error.message
        });
    }
});

/**
 * GET /api/stream-chat/stats - Get chat statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const streamChatDao = new StreamChatDao();

        const totalMessages = await streamChatDao.getMessageCount();

        res.json({
            success: true,
            data: {
                totalMessages,
                activeConnections: rateLimitStore.size // Rough estimate
            }
        });
    } catch (error) {
        console.error('Error getting chat stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chat statistics',
            error: error.message
        });
    }
});

/**
 * POST /api/stream-chat/cleanup - Clean up old messages (admin only)
 */
router.post('/cleanup', async (req, res) => {
    try {
        const keepCount = parseInt(req.body.keepCount) || 1000;

        const streamChatDao = new StreamChatDao();

        const deletedCount = await streamChatDao.cleanupOldMessages(keepCount);

        res.json({
            success: true,
            message: `Cleaned up ${deletedCount} old messages`,
            data: {
                deletedCount,
                keepCount
            }
        });
    } catch (error) {
        console.error('Error cleaning up messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clean up messages',
            error: error.message
        });
    }
});

/**
 * DELETE /api/stream-chat/all - Delete all chat messages (admin only)
 */
router.delete('/all', async (req, res) => {
    try {
        const streamChatDao = new StreamChatDao();

        const deletedCount = await streamChatDao.deleteAllMessages();

        res.json({
            success: true,
            message: `Deleted all ${deletedCount} chat messages`,
            data: {
                deletedCount
            }
        });
    } catch (error) {
        console.error('Error deleting all messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete all messages',
            error: error.message
        });
    }
});

module.exports = router;