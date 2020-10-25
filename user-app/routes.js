const express = require('express');
const router = express.Router();
const c = require('./controller');

// GET REQUEST
router.get('/allusers', c.allusers);
router.get('/allevents', c.allevents);
router.get('/allregs', c.allregs);
router.get('/:username/played', c.checkUserParams, c.authToken, c.allowAdmin, c.played);
router.get('/:username/present', c.checkUserParams, c.authToken, c.allowAdmin, c.present);

// POST REQUEST
router.post('/signup', c.signup);
router.post('/login', c.login);
router.post('/addevent', c.allevents);
router.post('/:username/:event', c.authToken, c.checkUserParams, c.register);
router.post('/eventlogin', c.eventlogin);
// router.post('/razorpay', c.payment); 
// router.post('/verification', c.verification);

module.exports = router;
// MIDDLE WARES 
// authToken -> check JWT token correct or not and authenticate user
// private -> compare url user with authenticated user, only he can access
// allowAdmin -> compare url name with authenticated user and admin users, both user and admin can access
// checkUserParams -> check url params exists or not 
// onlyAdmin -> only admin can access