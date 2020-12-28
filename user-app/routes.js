const express = require('express');
const router = express.Router();
const c = require('./controller');

// <--------------------- GET REQUEST ------------------------>
router.get('/allevents', c.allevents);                                                      // all events
router.get('/updates', c.updates);                                                          // all updates
router.get('/user/:username', c.authToken, c.private, c.userdetials);                       // user details
router.get('/:username/played', c.checkUserParams, c.authToken, c.allowAdmin, c.played);    // total played event by the user
router.get('/:username/present', c.checkUserParams, c.authToken, c.allowAdmin, c.present);  // total present events by the user

// <--------------------- POST REQUEST ------------------------>
router.post('/signup', c.signup);                                                          // Signup
router.post('/login', c.login);                                                            // Login
router.post('/:username/:event', c.checkUserParams, c.authToken, c.private, c.register);   // User Register for the Event
router.post('/razorpay', c.payment);                                                       // Razorpay API
router.post('/verification', c.verification);                                              // Verification
router.post('/addteam', c.authToken, c.createteams);                                       // add Teams

// <--------------------- PUT REQUEST ------------------------>
router.put('/:username/update', c.authToken, c.private, c.updateuser);  // Update User details

// <--------------------- ADMIN ------------------------>
router.get('/allteams', c.authToken, c.onlyAdmin, c.createteams);       // All teams
router.get('/allusers', c.authToken, c.onlyAdmin, c.allusers);          // All Users
router.get('/allregs', c.authToken, c.onlyAdmin, c.allregs);            // All registrations
router.get('/event/:event', c.authToken, c.onlyAdmin, c.eventusers);    // All registrations of the event
router.post('/addupdate', c.authToken, c.onlyAdmin, c.updates);         // Adding Update
router.post('/eventlogin', c.authToken, c.onlyAdmin, c.eventlogin);     // Login From the main Event
router.post('/addevent', c.authToken, c.onlyAdmin, c.allevents);        // Add any event
router.put('/edit/:event', c.authToken, c.onlyAdmin, c.allevents);      // Edit particular Event

module.exports = router;
// MIDDLE WARES 
// authToken -> check JWT token correct or not and authenticate user
// private -> compare url user with authenticated user, only he can access
// allowAdmin -> compare url name with authenticated user and admin users, both user and admin can access
// checkUserParams -> check url params exists or not 
// onlyAdmin -> only admin can access