require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Event, Register, Update, Teams } = require('./model');
const Razorpay = require('razorpay')
const shortid = require('shortid')

const ROLE = {
    BASIC: 'basic',
    ADMIN: 'admin'
};

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
            const user = await User.findOne({username: req.body.username});  
            if(user != null) return res.status(404).json({message: 'username Already Taken'});

            const hashedpassword = await bcrypt.hash(req.body.password, 10);
            
            const new_user = new User({
                username: req.body.username.toLowerCase(),
                name: req.body.name,
                password: hashedpassword,
                email: req.body.email,
                phoneno: req.body.phoneno,
                clgname: req.body.clgname,
                role: ROLE.BASIC
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
    if (req.method === 'POST') {
        var user = await User.findOne({username: req.body.username});
        if(!user) {
            user = await User.findOne({email: req.body.username}); 
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

    if(req.method === 'PUT') {
        try {
            var oneevent = await Event.findOne({ event_username: req.params.event}); 
            oneevent.event_name = req.body.event_name; 
            oneevent.event_time = req.body.event_time;
            oneevent.event_price = req.body.event_price; 
            oneevent.event_des = req.body.event_des; 
            await oneevent.save(); 
            console.log(oneevent); 

            return res.json(oneevent).status(200); 
        } catch (err) {
            return res.json({message: `Internsal Error: ${err}`}).status(500)
        }
    }
};

// WORKING
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
            const eventreg = await Register.findOne({username: req.params.username, event_username: req.params.event, played: false});
            if (eventreg == null) {
                const reg = new Register({
                    event_username: req.params.event,
                    username: req.params.username, 
                    price: req.params_event.event_price,
                    random_pw: pass,
                    played: false
                });
                const waitedreg = await reg.save();
                res.json(waitedreg).status(201);
            } 
            res.json({message: "Event Already Registered!"})
        } catch (err) {
            res.status(400).json({ message: `Post Internal Error: ${err}` });
        }
    }
}

// WORKING 
played = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const registrations = await Register.find({username: req.params.username, played: true});
            res.status(200).json(registrations); 
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    }
}

RegOne = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const registrations = await Register.find({username: req.params.username});
            res.status(200).json(registrations); 
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    }
}

// WORKING 
present = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const registrations = await Register.find({username: req.params.username, played: false});
            res.status(200).json(registrations); 
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    }
}

// WORKING 
eventlogin = async (req, res) => {
    if (req.method==='POST')  {
        var user;
        user = await User.findOne({username: req.body.username}); 
        if(!user) {
            user = await User.findOne({email: req.body.email});
            if (!user) return res.json({ allow: false, message: 'User Not Found'}).status(400);
        }
        
        try {
            const reg = Register.findOne({username: req.body.username, event_username: req.body.event, played: false}); 
            if (reg.random_pw==req.body.password){
                // reg.played = true;                 
                // await reg.save();
                res.json({allow: true}).status(200);
            } else {
                res.json({ allow: false, message: 'Password Wrong!'}).status(401); 
            }
        } catch (err) {
            res.status(500).json({allow: false, message: `Internal error ${err}`});
        }
    }
}

// WORKING
updates = async (req, res) => {
    if (req.method == 'GET') {
        var updates = await Update.find();
        return res.json(updates).status(200);
    } 
    else if (req.method == 'POST') {
        const update = new Update({
            headline: req.body.headline,
            info: req.body.info
        }); 
        var waitedupdate = await update.save(); 
        res.json(waitedupdate).status(200); 
    }
}

// WORKING
updateuser = async (req, res) => {
    if (req.method==='PUT') {
        const hashedpassword = await bcrypt.hash(req.body.password, 10);
        try {
            var user = await User.findOne({username: req.user.username});
            user.password = hashedpassword;
            user.email = req.body.email;
            user.phoneno = req.body.phoneno;
            user.clgname = req.body.clgname;
            user.name = req.body.name;
            await user.save();

            // for await
            console.log(req.user);
            console.log(user);
            
            return res.json(user).status(200);     
        } catch (err) {
            return res.json({message: `Internal Error ${err}`}).status(500); 
        }
    }
}

// WORKING
eventusers = async (req, res) => {
    if (req.method==='GET'){
        try {
            eventreg = await Register.find({event_username: req.params.event});
            return res.json(eventreg).status(200);    
        } catch (err) {
            return res.json(`Internal Server Error: ${err}`).status(500);
        }
    }
}

// RAZORPAY FUNCTIONS 
// WORKING
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

verification = async (req, res) => {
    // verification logic 
    //const SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
    // Still remaining
    console.log("VERIFICATION: ", req.body);
    res.json({ status: 'ok'});
}

// WORKING
payment = async (req, res) => {
    const payment_capture = 1;
    const amount = 499;
    const currency = 'INR'

    const options = {
        amount: amount*100, 
        currency, 
        receipt: shortid.generate(), 
        payment_capture
    }

    try {
        const response = await razorpay.orders.create(options);
        console.log("PAYMENT: ", response);
        res.json({
            id: response.id, 
            currency: response.currency,
            amount: response.amount
        }); 
    } catch (error) {
        console.log("ERROR (PAYMENT) : ", error); 
    }
}




// MIDDLE WARES //
// WORKING
authToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    // Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.status(401).json({message: 'Invaild Token'});
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
        if (err) {
            res.status(400).json({message: err.message});
            // if (req.method === 'GET') return res.redirect(301, '/login');
            // else if (req.method === 'POST') return res.redirect(307, '/login');
        }
        req.user = user;
        next();
    });
}

private = (req, res, next) => {
    if (req.user.username !== req.params.username) {    
        res.json({ message: 'You can only view your Data'}).status(400);
    }
    next();
}

allowAdmin = (req, res, next) => {
    if(req.params.username === req.user.username || req.user.role === ROLE.ADMIN){
        next();
        return;
    }
    return res.status(403).json({ message: 'Accessed not allowed!'});
}

onlyAdmin= (req, res, next) => {
    if(req.user.role != ROLE.ADMIN){
        res.status(403).json({ message: 'Accessed not allowed!'});
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
    allusers, allevents, allregs, login, signup, register, played, present, eventlogin, eventusers, updateuser, updates, payment, verification,
    // payment, verification, 
    // MIDDLEWARES
    authToken, private, allowAdmin, onlyAdmin, checkUserParams
};
