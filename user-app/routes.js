const express = require('express');
const router = express.Router();
const c = require('./controller');

// GET REQUEST
router.get('/allevents', c.allevents);
router.get('/updates', c.updates);
router.get('/:username/played', c.checkUserParams, c.authToken, c.allowAdmin, c.played);
router.get('/:username/present', c.checkUserParams, c.authToken, c.allowAdmin, c.present);

// POST REQUEST
router.post('/signup', c.signup);
router.post('/login', c.login);
router.post('/:username/:event', c.authToken, c.checkUserParams, c.register);
router.post('/razorpay', c.payment); 
router.post('/verification', c.verification);

// PUT REQUEST
router.put('/:username/update', c.authToken, c.private, c.updateuser); 

// ADMIN
router.get('/allusers', c.authToken, c.onlyAdmin, c.allusers);
router.get('/allregs', c.authToken, c.onlyAdmin, c.allregs);
router.get('/:event', c.authToken, c.onlyAdmin, c.eventusers); 
router.post('/addupdate', c.authToken, c.onlyAdmin, c.updates);
router.post('/eventlogin', c.authToken, c.onlyAdmin, c.eventlogin);
router.post('/addevent', c.authToken, c.onlyAdmin, c.allevents);
router.put('/edit/:event', c.authToken, c.onlyAdmin, c.allevents);

module.exports = router;
// MIDDLE WARES 
// authToken -> check JWT token correct or not and authenticate user
// private -> compare url user with authenticated user, only he can access
// allowAdmin -> compare url name with authenticated user and admin users, both user and admin can access
// checkUserParams -> check url params exists or not 
// onlyAdmin -> only admin can access