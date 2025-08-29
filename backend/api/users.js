const express = require('express');
const router = express.Router();
const UsersSyncDao = require('../dao/UsersSyncDao');

const usersSyncDao = new UsersSyncDao();

// GET /users - Get all users with pagination
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const users = await usersSyncDao.list({ limit, offset });
    res.json(users);
  } catch (error) {
    if (error.message.includes('relation "neon_auth.users_sync" does not exist')) {
      res.status(503).json({ error: 'User authentication system not configured' });
    } else {
      res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
  }
});

// GET /users/all - Get all users without pagination
router.get('/all', async (req, res) => {
  try {
    const users = await usersSyncDao.findAll();
    res.json(users);
  } catch (error) {
    if (error.message.includes('relation "neon_auth.users_sync" does not exist')) {
      res.status(503).json({ error: 'User authentication system not configured' });
    } else {
      res.status(500).json({ error: 'Failed to fetch all users', details: error.message });
    }
  }
});

// GET /users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await usersSyncDao.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    if (error.message.includes('relation "neon_auth.users_sync" does not exist')) {
      res.status(503).json({ error: 'User authentication system not configured' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
  }
});

// GET /users/email/:email - Get user by email
router.get('/email/:email', async (req, res) => {
  try {
    const user = await usersSyncDao.findByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    if (error.message.includes('relation "neon_auth.users_sync" does not exist')) {
      res.status(503).json({ error: 'User authentication system not configured' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user by email', details: error.message });
    }
  }
});

// POST /users - Create new user (if auth system supports it)
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    const userData = {
      name,
      email
    };

    const user = await usersSyncDao.create(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error.message.includes('relation "neon_auth.users_sync" does not exist')) {
      res.status(503).json({ error: 'User authentication system not configured' });
    } else if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'User with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
  }
});

// PUT /users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const user = await usersSyncDao.update(req.params.id, updateData);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    if (error.message.includes('relation "neon_auth.users_sync" does not exist')) {
      res.status(503).json({ error: 'User authentication system not configured' });
    } else if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'User with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
  }
});

// DELETE /users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await usersSyncDao.delete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user });
  } catch (error) {
    if (error.message.includes('relation "neon_auth.users_sync" does not exist')) {
      res.status(503).json({ error: 'User authentication system not configured' });
    } else {
      res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
  }
});

module.exports = router;