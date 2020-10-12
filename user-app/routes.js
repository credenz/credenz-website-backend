const express = require('express');
const router = express.Router();
const c = require('./controller');

// ADMIN SESSION
router.get('/admin', c.authToken, c.onlyAdmin);

// GET REQUEST
router.get('/signup', c.signup);
router.get('/logo', c.logo);
router.get('/login', c.login);

// POST REQUEST
router.post('/signup', c.signup);
router.post('/login', c.login);
router.post('/razorpay', c.payment); 
router.post('/verification', c.verification);

// PUT REQUEST


// DELETE REQUEST

module.exports = router;
