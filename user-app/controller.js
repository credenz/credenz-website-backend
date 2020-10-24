require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Event, Register } = require('./model');
// const Razorpay = require('razorpay');
// const shortid = require('shortid');
// const path = require('path'); 

// WORKING
allusers = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const users = await User.find()
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    }
}

// WORKING
allregs = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const regs = await Register.find()
            res.status(200).json(regs);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    }
}

// WORKING 
signup = async (req, res) => {
    if (req.method === 'POST') {
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
                clgname: req.body.clgname
            });
            
            const waiteduser = await new_user.save();
            
            const accessToken = jwt.sign(waiteduser.toJSON(), process.env.ACCESS_TOKEN_SECRET);
            res.json({accessToken: accessToken}).status(201);
        } catch (err) {
            res.status(400).json({ message: `post internal error: ${err}` });
        }
    }
};

// WORKING 
login = async (req, res) => {
    const users = await User.find(); 
    if (req.method === 'POST') {
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

// WORKING
allevents = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const events = await Event.find()
            res.status(200).json(events);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    } 

    if(req.method === 'POST'){
        try {       
            var mm = req.body.mm;
            var yyyy = req.body.yyyy; 
            var dd = req.body.dd;
            var hour = req.body.hour; 
            var min = req.body.min;

            const event = new Event({
                event_username: req.body.event_username,
                event_name: req.body.event_name,
                event_des: req.body.event_des,
                event_time: Date(yyyy, mm, dd, hour, min, 0, 0), 
                event_price: req.body.event_price
            });
            
            const waitedevent = await event.save();
            res.json(waitedevent).status(201);
        } catch (err) {
            res.status(400).json({ message: `post internal error: ${err}` });
        }
    } 
};

// :username/:id
register = async (req, res) => {
    if (req.method === 'POST') {
        try {
            var pass = ''; 
            var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +  
                    'abcdefghijklmnopqrstuvwxyz0123456789@#$'; 
            for (i = 1; i <= 8; i++) { 
                var char = Math.floor(Math.random() * str.length + 1); 
                pass += str.charAt(char) 
            } 
            
            const reg = new Register({
                event_username: req.params.event,
                username: req.params.username, 
                price: req.params_event.event_price,
                random_pw: pass,
                played: false
            });
            const waitedreg = await reg.save();
            res.json(waitedreg).status(201);
        } catch (err) {
            res.status(400).json({ message: `post internal error: ${err}` });
        }
    }
}

/* 
// played events by the user
played = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const registrations = await Register.find(); 

            var regs = registrations.find(reg => reg.username == req.user.username); 
            regs = regs.find(reg => reg.played==true); 

            res.json(regs).status(200)

        } catch (err) {
            res.status(500).json({message: err.message});
        }
    }
}

/*
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
*/ 

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

checkUserParams = async (req, res, next) => {
    try {
        const user = await User.findOne({username: req.params.username});
        if (user === null) return res.status(400).json({message: `User doesn't exist`});
        
        var event; 
        if (req.params.event != null)
            event = await Event.findOne({event_username: req.params.event});
        if (event === null) return res.return(400).json({message: `Event doesn't exist!`}); 
        req.params_event = event; 
    } catch (err) {
        res.status(500).json({message: `Internal error ${err}`});
    }
    next();
}

module.exports = {
    allusers, allevents, allregs, login, signup, allevents, register, 
    // payment, verification, 
    // MIDDLEWARES
    authToken, private, allowAdmin, onlyAdmin, checkUserParams
};
