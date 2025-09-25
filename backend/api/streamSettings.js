const express = require('express');
const router = express.Router();
const StreamSettingsDao = require('../dao/StreamSettingsDao');

/**
 * GET /api/stream-settings/:key - Get a specific setting by key
 */
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const streamSettingsDao = new StreamSettingsDao();

        const setting = await streamSettingsDao.getSetting(key);

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            data: setting
        });
    } catch (error) {
        console.error('Error fetching stream setting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stream setting',
            error: error.message
        });
    }
});

/**
 * GET /api/stream-settings/value/:key - Get just the value of a specific setting
 */
router.get('/value/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const streamSettingsDao = new StreamSettingsDao();

        const value = await streamSettingsDao.getSettingValue(key);

        res.json({
            success: true,
            data: {
                key: key,
                value: value
            }
        });
    } catch (error) {
        console.error('Error fetching stream setting value:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stream setting value',
            error: error.message
        });
    }
});

/**
 * GET /api/stream-settings - Get all settings
 */
router.get('/', async (req, res) => {
    try {
        const streamSettingsDao = new StreamSettingsDao();

        const settings = await streamSettingsDao.getAllSettings();

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching all stream settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stream settings',
            error: error.message
        });
    }
});

/**
 * PUT /api/stream-settings/:key - Update or create a setting
 */
router.put('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;

        if (value === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Value is required'
            });
        }

        const streamSettingsDao = new StreamSettingsDao();

        const updatedSetting = await streamSettingsDao.setSetting(key, value, description);

        res.json({
            success: true,
            message: 'Setting updated successfully',
            data: updatedSetting
        });
    } catch (error) {
        console.error('Error updating stream setting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stream setting',
            error: error.message
        });
    }
});

/**
 * DELETE /api/stream-settings/:key - Delete a setting
 */
router.delete('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const streamSettingsDao = new StreamSettingsDao();

        const deleted = await streamSettingsDao.deleteSetting(key);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            message: 'Setting deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting stream setting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete stream setting',
            error: error.message
        });
    }
});

module.exports = router;