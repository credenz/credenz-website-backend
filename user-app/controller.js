require('dotenv').config();

const jwt = require('jsonwebtoken');
const { User, Event, Register, Update, Teams, Leaderboard, Sponsors } = require('./model');
var nodemailer = require('nodemailer');

// const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const ROLE = {
    BASIC: 'basic',
    ADMIN: 'admin'
};

// getCode = async (req, res) => {
//     client
//         .verify
//         .services(process.env.VERIFY_SERVICE_SID)
//         .verifications
//         .create({
//             to: `+${req.query.phonenumber}`,
//             channel: req.query.channel
//         })
//         .then(data => {
//             res.status(200).send(data);
//         })
// };

// verifyCode = async (req, res) => {
//     client
//         .verify
//         .services(process.env.VERIFY_SERVICE_SID)
//         .verificationChecks
//         .create({
//             to: `+${req.query.phonenumber}`,
//             code: req.query.code
//         })
//         .then(data => {
//             res.status(200).send(data);
//         });
// };

// Get('/allusers', c.authToken, c.onlyAdmin, c.allusers);
allusers = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const users = await User.find()
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({message: `Internal server error : ${err.message}`});
        }
    }
}

// Get ('/allregs', c.authToken, c.onlyAdmin, c.allregs)
allregs = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const regs = await Register.find()
            res.status(200).json(regs);
        } catch (err) {
            res.status(500).json({message: `Internal server error : ${err.message}`});
        }
    }
}

// Get('/allteams', c.authToken, c.onlyAdmin, c.allteams)
allteams = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const teams = await Teams.find()
            res.status(200).json(teams);
        } catch (err) {
            res.status(500).json({message: `Internal server error : ${err.message}`});
        }
    }
}

sponsors = async (req, res) => {
    if(req.method == 'GET') {
        try {
            const sponsors = await Sponsors.find()
            res.status(200).json(sponsors);    
        } catch (err) {
            res.status(500).json({message: `Internal server error : ${err.message}`});
        }
    } 
}

// Post('/signup', c.signup)
signup = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const user = await User.findOne({username: req.body.username});  
            if(user != null) res.status(404).json({message: 'username Already Taken'});

            var ieeeid = 0; 
            if (req.body.ieee == true) {
                ieeeid = req.body.ieeeid
            }

            const new_user = new User({
                _id: await User.count() + 1,
                username: req.body.username.toLowerCase(),
                name: req.body.name,
                password: req.body.password,
                email: req.body.email,
                phoneno: req.body.phoneno,
                clgname: req.body.clgname,
                ieee: req.body.ieee,
                role: ROLE.BASIC,
                ieeeid: ieeeid
            });
            
            const waiteduser = await new_user.save();
            
            const accessToken = jwt.sign(waiteduser.toJSON(), process.env.ACCESS_TOKEN_SECRET);
            res.json({accessToken: accessToken}).status(201);
        } catch (err) {
            res.status(400).json({ message: `post internal error: ${err}` });
        }
    }
};

// Post('/login', c.login)
login = async (req, res) => {
    if (req.method === 'POST') {
        var user = await User.findOne({username: req.body.username});
        if(!user) {
            user = await User.findOne({email: req.body.username}); 
            if (!user) res.json({ message: 'User Not Found'}).status(400); 
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

// Get('/user/:username', c.authToken, c.private, c.userdetails); 
userdetials = async (req, res) => {
    if (req.method === 'GET'){
        var user = await User.findOne({username: req.params.username});
        if(!user) {
            res.json({ message: 'User Not Found'}).status(400); 
        }
        res.json(user).status(200);
    }
}

// router.get('/admin/allregs/:id',  c.authToken, c.onlyAdmin ,c.allregsid);   
// router.post('/admin/allregs/:id',  c.authToken, c.onlyAdmin ,c.allregsid);
allregsid = async (req, res) => {
    var registration = await Register.findOne({_id: req.params.id});

    if(req.method === 'GET') {
        if(!registration) {
            res.json({ message: 'Registration Not Found'}).status(400); 
        }
        res.json(registration).status(200)
    }

    if(req.method === 'POST') {
        registration.approved = true;
        registration.save();
        // Send emails
        res.json(registration).status(200);
    }
}

// Get('/allevents', c.allevents)
// Post('/addevent', c.authToken, c.onlyAdmin, c.allevents)
// Put('/edit/:event', c.authToken, c.onlyAdmin, c.allevents)
allevents = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const events = await Event.find()
            res.status(200).json(events);
        } catch (err) {
            res.status(500).json({message: `Internal server error : ${err.message}`});
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
            res.json(waitedevent).status(201);
        } catch (err) {
            res.status(400).json({ message: `post internal error: ${err}` });
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

            res.json(oneevent).status(200); 
        } catch (err) {
            res.json({message: `Internsal Error: ${err}`}).status(500)
        }
    }
};

async function registerforevent (event_username, username, price, trans_id, approved) {
    var pass = ''; 
    var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +  
            'abcdefghijklmnopqrstuvwxyz0123456789@#$'; 
    for (i = 1; i <= 8; i++) { 
        var char = Math.floor(Math.random() * str.length + 1); 
        pass += str.charAt(char) 
    } 

    const reg = new Register({
        _id: await Register.count() + 1,
        event_username: event_username,
        username: username, 
        price: price,
        random_pw: pass,
        played: false,
        approved: approved,
        transaction_id: trans_id,
    });

    const waitedreg = await reg.save();
    return waitedreg;
}

// Post('/:username/:event', c.authToken, c.checkUserParams, c.register)
register = async (req, res) => {
    if (req.method === 'POST') {
        try {
            var registrations = await registerforevent(req.params.event, req.params.username, 
                                                        req.params_event.event_price, req.body.trans_id, req.body.approved);
            res.status(201).json(registrations);
        } catch (err) {
            res.status(500).json({ message: `Post Internal Error: ${err}` });
        }
    }
}

// Get('/:username/played', c.checkUserParams, c.authToken, c.allowAdmin, c.played)
played = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const registrations = await Register.find({username: req.params.username, played: true});
            res.status(200).json(registrations); 
        } catch (err) {
            res.status(500).json({message: `Internal server error : ${err.message}`});
        }
    }
}

// Get('/:username/present', c.checkUserParams, c.authToken, c.allowAdmin, c.present)
present = async (req, res) => {
    if(req.method === 'GET'){
        try {
            const registrations = await Register.find({username: req.params.username, played: false});
            res.status(200).json(registrations); 
        } catch (err) {
            res.status(500).json({message: `Internal server error : ${err.message}`});
        }
    }
}

// Post('/eventlogin', c.authToken, c.onlyAdmin, c.eventlogin)
eventlogin = async (req, res) => {
    if (req.method==='POST')  {
        var user;
        user = await User.findOne({username: req.body.username}); 
        if(!user) {
            user = await User.findOne({email: req.body.email});
            if (!user) res.json({ allow: false, message: 'User Not Found'}).status(400);
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

// Get('/updates', c.updates)
// Post('/addupdate', c.authToken, c.onlyAdmin, c.updates)
updates = async (req, res) => {
    if (req.method == 'GET') {
        var updates = await Update.find();
        res.json(updates).status(200);
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

leaderboard = async (req, res) => {
    if(req.method == 'GET') {
        var scores = await Leaderboard.find()
        res.json(scores).status(200);
    }
    else if (req.method == 'POST') {
        var user;
        user = await User.findOne({username: req.body.username});
        if(user) {
            const score = new Leaderboard({
                _id: await Leaderboard.count() + 1,
               username: req.body.username,
               college: req.body.college,
               score: req.body.score
           })

           var waitedscore = await score.save();
            res.json(waitedscore).status(200);


            /*            
            var scores = await Leaderboard.findOne({username: req.body.username});
            console.log(user)
            

            var score = ''

            if(scores) {
                console.log(scores)
                console.log(scores.id)
                console.log("If")
                score = new Leaderboard({
                    _id: scores.id,
                   username: req.body.username,
                   college: req.body.college,
                   score: req.body.score + scores.score
               })

               var waitedscore = await score.save();
            res.json(waitedscore).status(200);

            }else {
                console.log("else")
                score = new Leaderboard({
                    _id: await Leaderboard.count() + 1,
                   username: req.body.username,
                   college: req.body.college,
                   score: req.body.score + scores.score
               })

               var waitedscore = await score.save();
            res.json(waitedscore).status(200);

            }
*/
        }else {
            res.json("User doesnt exist").status(400);
        }
    }
}

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
            res.json(user).status(200);     
        } catch (err) {
            res.json({message: `Internal Error ${err}`}).status(500); 
        }
    }
}

// Get('/event/:event', c.authToken, c.onlyAdmin, c.eventusers)
eventusers = async (req, res) => {
    if (req.method==='GET'){
        try {
            eventreg = await Register.find({event_username: req.params.event});
            res.json(eventreg).status(200);    
        } catch (err) {
            res.json(`Internal Server Error: ${err}`).status(500);
        }
    }
}

// Get('/allteams', c.authToken, c.onlyAdmin, c.teamlogic)
// Post('/addteam', c.authToken, c.private, c.teamlogic)
createteams = async (req, res) => {
    if (req.method === 'GET') {
        team = await Teams.find();
        res.json(team).status(200);
    } 

    else if (req.method === 'POST') {
        // list of other members of the teams
        var players = req.body.players;
        var event_name = req.body.event_name;
        var team_username = req.body.team_username;
        var no_of_players = req.body.no_of_players;

        players.push(req.user.username);

        try{
            var event = await Event.findOne({event_username: req.body.event_name});
        } catch(err) {
            res.json({message: "Event not found"}).status(400); 
        }

        // check for repeated users
        for (var i=0; i<players.length; i++) {
            for(var j=0; j<players.length; j++){
                if (i!=j && players[i] == players[j]){
                    console.log("YES, CHECK 1");
                    res.json({message: "Username Repeated"}).status(400); 
                }
            }
        }

        var checkpromises = new Promise(async (resolve, reject) => {
            try {
                // Team username check
                var checkteam = await Teams.findOne({team_username: team_username, event_name: event_name});
                console.log("YES, CHECK 2");
                if (checkteam) throw "Team username already registered!";

                // check if username exists or not
                players.forEach(async (element) => {
                    user = await User.findOne({username: element});
                    console.log("YES, CHECK 3");
                    if(!user) throw "One of the user not found";
                });
                console.log("-----------------");
                resolve("success");
            } catch (err) {
                reject(err);
            }
        });

        checkpromises.then(async (message) => {
            var team = new Teams({
                _id: await Teams.count() + 1,
                team_username: team_username,
                event_name: event_name,
                no_of_players: no_of_players,
                players: players,
                count: 0,
                logedin_players: [null]
            });
            await team.save();  

            // register for all members
            players.forEach(async (element) => {       
                console.log("YES, FUNCTION CALL!");
                await registerforevent(event_name, element, event.event_price);
            });
            res.json(team).status(200);    
        }).catch((err) => {
            res.json({message: err}).status(400);
        });
    }
}



// <---------------------- MIDDLE WARES ---------------------->
authToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    // Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) res.status(401).json({message: 'Invaild Token'});
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
        if (err) {
            res.status(400).json({message: err.message});
            // if (req.method === 'GET') res.redirect(301, '/login');
            // else if (req.method === 'POST') res.redirect(307, '/login');
        }
        req.user = user;
        next();
    });
}

// Only Owner can access the API
private = (req, res, next) => {
    if (req.user.username !== req.params.username) {    
        res.json({ message: 'You can only view your Data'}).status(400);
    }
    next();
}

// Owner and Admin Can access the API
allowAdmin = (req, res, next) => {
    if(req.params.username === req.user.username || req.user.role === ROLE.ADMIN){
        next();
        return;
    }
    res.status(403).json({ message: 'Accessed not allowed!'});
}

// Only admins are allowed to access user
onlyAdmin= (req, res, next) => {
    if(req.user.role != ROLE.ADMIN){
        res.status(403).json({ message: 'Accessed not allowed!'});
    }
    next();
}

// Check if params Username and event exists or not
checkUserParams = async (req, res, next) => {
    try {
        const user = await User.findOne({username: req.params.username});
        if (user === null) res.status(400).json({message: `User doesn't exist`});
        
        var event; 
        if (req.params.event != null) {
            event = await Event.findOne({event_username: req.params.event});
            if (event === null) res.status(400).json({message: `Event doesn't exist!`}); 
            req.params_event = event; 
        }
    } catch (err) {
        res.status(500).json({message: `Internal error ${err}`});
    }
    next();
}


resetPassword = async (req, res) => {
    try{
        var user = await User.findOne({username: req.body.username});
        if(user) {
            var emailVal = user.email;
            console.log("emailVal" + emailVal)

                var smtpTransport = nodemailer.createTransport({  
                    service: 'SendGrid',  
                    auth: {  
                    user: 'sakshee1120@gmail.com',  
                    pass: ''  
                    }  
                });  

                const mailOptions = {  
                    to: emailVal,  
                    from: 'sakshee1120@gmail.com',  
                    subject: 'Node.js Password Reset',  
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +  
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +  
                        'http://' + req.headers.host + '/reset/' + username + '\n\n' +  
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'  
                };  
                smtpTransport.sendMail(mailOptions, function(err) {                 
                    console.log("HI:"+emailVal);  
                    res.json({status : 'success', message : 'An e-mail has been sent to ' + emailVal + ' with further instructions.'});              
                    done(err, 'done');  
                });
        }else {
            res.json("Invalid user").status(403)
        }
    }catch(err){
        res.json(err).status(400);
    }

}  
  
module.exports = {
    allusers, allevents, allregs, allteams, login, signup, register, played, present, eventlogin, 
    eventusers, updateuser, updates, userdetials, createteams, // getCode, verifyCode,
    resetPassword, leaderboard, sponsors, allregsid,
    // MIDDLEWARES
    authToken, private, allowAdmin, onlyAdmin, checkUserParams
};
