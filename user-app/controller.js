require('dotenv').config();

const jwt = require('jsonwebtoken');
const { User, Event, Register, Update, Teams } = require('./model');
const Razorpay = require('razorpay')
const shortid = require('shortid')

const ROLE = {
    BASIC: 'basic',
    ADMIN: 'admin'
};

// 
// Get('/allusers', c.authToken, c.onlyAdmin, c.allusers);
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

// 
// Get ('/allregs', c.authToken, c.onlyAdmin, c.allregs)
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

// 
// Get('/allteams', c.authToken, c.onlyAdmin, c.allteams)
allteams = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const teams = await Teams.find()
            res.status(200).json(teams);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    }
}

// FINAL WORKING
// Post('/signup', c.signup)
signup = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const user = await User.findOne({username: req.body.username});  
            if(user != null) return res.status(404).json({message: 'username Already Taken'});

            const new_user = new User({
                _id: await User.count() + 1,
                username: req.body.username.toLowerCase(),
                name: req.body.name,
                password: req.body.password,
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

// FINAL WORKING
// Post('/login', c.login)
login = async (req, res) => {
    if (req.method === 'POST') {
        var user = await User.findOne({username: req.body.username});
        if(!user) {
            user = await User.findOne({email: req.body.username}); 
            if (!user) return res.json({ message: 'User Not Found'}).status(400); 
        }

        try {
            if(req.body.password == user.password) {
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

// FINAL WORKING
// Get('/user/:username', c.authToken, c.private, c.userdetails); 
userdetials = async (req, res) => {
    if (req.method === 'GET'){
        var user = await User.findOne({username: req.params.username});
        if(!user) {
            return res.json({ message: 'User Not Found'}).status(400); 
        }
        return res.json(user).status(200);
    }
}

// Get('/allevents', c.allevents) -- FINAL WORKING
// Post('/addevent', c.authToken, c.onlyAdmin, c.allevents) -- FINAL WORKING
// Put('/edit/:event', c.authToken, c.onlyAdmin, c.allevents) -- FINAL WORKING
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
                _id: await Event.count() + 1,
                event_username: req.body.event_username,
                event_name: req.body.event_name,
                event_des: req.body.event_des,
                event_time: new Date(yyyy, mm, dd, hour, min, 0, 0),
                event_price: req.body.event_price
            });
            
            const waitedevent = await event.save();
            return res.json(waitedevent).status(201);
        } catch (err) {
            return res.status(400).json({ message: `post internal error: ${err}` });
        }
    } 

    if(req.method === 'PUT') {
        try {
            var mm = req.body.mm;
            var yyyy = req.body.yyyy; 
            var dd = req.body.dd;
            var hour = req.body.hour; 
            var min = req.body.min;

            var oneevent = await Event.findOne({ event_username: req.params.event}); 
            oneevent.event_name = req.body.event_name; 
            oneevent.event_time = new Date(yyyy, mm, dd, hour, min, 0, 0);
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

// FINAL WORKING
// Post('/:username/:event', c.authToken, c.checkUserParams, c.register)
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
                    _id: await Register.count() + 1,
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
// Get('/:username/played', c.checkUserParams, c.authToken, c.allowAdmin, c.played)
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

// WORKING
// Get('/:username/present', c.checkUserParams, c.authToken, c.allowAdmin, c.present)
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
// Post('/eventlogin', c.authToken, c.onlyAdmin, c.eventlogin)
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

// 
// Get('/updates', c.updates)
// Post('/addupdate', c.authToken, c.onlyAdmin, c.updates)
updates = async (req, res) => {
    if (req.method == 'GET') {
        var updates = await Update.find();
        return res.json(updates).status(200);
    } 
    else if (req.method == 'POST') {
        const update = new Update({
            _id: await Update.count() + 1,
            event: req.body.event,
            headline: req.body.headline,
            info: req.body.info
        });
        var waitedupdate = await update.save(); 
        res.json(waitedupdate).status(200); 
    }
}

// 
// Put('/:username/update', c.authToken, c.private, c.updateuser)
updateuser = async (req, res) => {
    if (req.method==='PUT') {
        try {
            var user = await User.findOne({username: req.user.username});
            user.password = req.body.password;
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

// 
// Get('/event/:event', c.authToken, c.onlyAdmin, c.eventusers)
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

// Get('/allteams', c.authToken, c.onlyAdmin, c.teamlogic) - FINAL WORKING
// Post('/addteam', c.authToken, c.private, c.teamlogic) - FINAL WORKING
createteams = async (req, res) => {
    if (req.method === 'GET') {
        team = await Teams.find();
        return res.json(team).status(200);
    } 
    
    else if (req.method === 'POST') {
        // list of other members of the teams
        var players = req.body.players;
        var event_name = req.body.event_name;
        var team_username = req.body.team_username;
        var no_of_players = req.body.no_of_players;

        players.push(req.user.username);

        try {
            const team = new Teams({
                _id: await Teams.count() + 1,
                team_username: team_username,
                no_of_players: no_of_players,
                players: players,
                count: 0,
                logedin_players: [],
                event_name: event_name,
            });
            console.log(team); 
    
            req.body.players.forEach(async (element) => {
                user = await User.find({username: element});
                if(!user) return res.json({message: "One of the user not found"}).status(400);
            });
    
            await team.save(); 
            return res.json(team).status(200);    
        }

        catch(err) {
            return res.json({message: "Internal server Error"}).status(500); 
        }
    }
}

// RAZORPAY FUNCTIONS 
// 
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

// 
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
// 
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
    allusers, allevents, allregs, allteams, login, signup, register, played, present, eventlogin, 
    eventusers, updateuser, updates, payment, verification, userdetials, createteams,
    // MIDDLEWARES
    authToken, private, allowAdmin, onlyAdmin, checkUserParams
};
