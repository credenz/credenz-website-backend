require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Event } = require('./model');
// const Razorpay = require('razorpay');
// const shortid = require('shortid');
// const path = require('path'); 

signup = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const users = await User.find()
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    }

    else if (req.method === 'POST') {
        try {
            const users = await User.find()
            const user = users.find(user => user.username === req.body.username)
            if(user != null) return res.status(404).json({message: 'username Already Taken'});

            const hashedpassword = await bcrypt.hash(req.body.password, 10);
            
            const new_user = new User({
                username: req.body.username.toLowerCase(),
                name: req.body.name,
                password: hashedpassword,
                email: req.body.email,
                phoneno: req.body.phoneno,
                clgname: req.body.clgname,
                present_events: [],
                played_events: []
            });
            
            const waiteduser = await new_user.save();
            
            const accessToken = jwt.sign(waiteduser.toJSON(), process.env.ACCESS_TOKEN_SECRET);
            res.json({accessToken: accessToken}).status(201);
        } catch (err) {
            res.status(400).json({ message: `post internal error: ${err}` });
        }
    }
};

login = async (req, res) => {
    const users = await User.find()
    if(req.method === 'GET'){
        try {
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
      } 

    else if (req.method === 'POST') {
        var user;
        user = users.find(user => user.username === req.body.username)
        if(!user) {
            user = users.find(user => user.email === req.body.username); 
            if (!user) return res.json({ message: 'User Not Found'}).status(400); 
        }

        try {
            if (await bcrypt.compare(req.body.password, user.password)){
                const accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET);
                res.json({accessToken: accessToken});
            } else {
                res.json({ message: 'Password Wrong!'})
            }
        } catch (err) {
            res.status(500).json({message: `Internal error ${err}`});
        }
    }
};

// static all events
allevents = async (req, res) => {
    // GET
    const events = await Event.find()
    if(req.method === 'GET'){
        try {
            res.status(200).json(events);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    } 
};

// played events by the user
played = async (req, res) => {
    const user = await User.find()
    if(req.method === 'GET'){
        try {

        } catch (err) {
            res.status(500).json({message: err.message});
        }
    }
}

// yet to play events by the user
present = async (req, res) => {
    const user = await User.find()
    if(req.method === 'GET'){
        try {

        } catch (err) {
            res.status(500).json({message: err.message});
        }
    }
}

// Event Login 
eventlogin = async (req, res) => {

}

registerEvent = async (req, res) => {
    
}

// MIDDLE WARES //
// WORKING
authToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    // Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.status(401).json({message: 'invaild token'});
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
        if (err) {
            res.status(400).json({message: err.message});
            // if (req.method === 'GET') return res.redirect(301, '/login');
            // else if (req.method === 'POST') return res.redirect(307, '/login');
        }
        req.user = user;
        next();
    });
};

private = (req, res, next) => {
    if (req.user.username !== req.params.username) {    
        res.json({ message: 'You Can only view your Questions'}).status(400);
    }
    next();
}

allowAdmin = (req, res, next) => {
    if(req.params.username === req.user.username || req.user.role === ROLE.ADMIN){
        next();
        return;
    }
    return res.status(403).json({ message: 'accessed not allowed!'});
}

onlyAdmin= (req, res, next) => {
    if(req.user.role != ROLE.ADMIN){
        res.status(403).json({ message: 'accessed not allowed!'});
    }
    next();
}

module.exports = {
    login, signup, allevents,
    // payment, verification, 
    // MIDDLE WARES
    authToken, private, allowAdmin, onlyAdmin
};
