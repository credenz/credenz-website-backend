const express = require('express');
const router = express.Router();
const c = require('./controller');

// ADMIN SESSION
// router.get('/admin', c.authToken, c.onlyAdmin);

// GET REQUEST
router.get('/signup', c.signup);
router.get('/login', c.login);
router.get('/events', c.allevents); 
router.get('/:username/played/', c.authToken, c.private, c.played);
router.get('/:username/present/', c.authToken, c.private, c.present);

// POST REQUEST
router.post('/signup', c.signup);
router.post('/login', c.login);
// router.post('/razorpay', c.payment); 
// router.post('/verification', c.verification);

// DELETE REQUEST

module.exports = router;

// private -> compare url user with authenticated user, only he can access
// allowAdmin -> compare url name with authenticated user and admin users
// authToken -> Compare JWT token and authenticate user
// checkUserParams -> check url username exists or not