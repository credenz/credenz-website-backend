const express = require('express');
const router = express.Router();
const c = require('./controller')

// ADMIN SESSION
router.get('/admin', c.authToken, c.onlyAdmin);

// GET REQUEST
router.get('/', c.signup);
router.get('/login', c.login);

// POST REQUEST
router.post('/', c.signup);
router.post('/login', c.login);

// PUT REQUEST

// DELETE REQUEST

module.exports = router;
