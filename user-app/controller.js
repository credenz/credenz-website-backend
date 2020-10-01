require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const { User } = require('./model');
const shortid = require('shortid');
const path = require('path'); 

const ROLE = {
    BASIC: 'basic',
    ADMIN: 'admin'
};

// WORKING
logo = (req, res) => {
    res.sendFile(path.join(__dirname, '../logo.svg')); 
}

signup = async (req, res) => {
    // GET POST
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

            var role = null;
            if (req.body.role === undefined) role = ROLE.BASIC; else role = ROLE.ADMIN;

            const hashedpassword = await bcrypt.hash(req.body.password, 10);

            const new_user = new User({
                username: req.body.username.toLowerCase(),
                password: hashedpassword,
                numberQue: 0,
                role: role
            });
            
            const waiteduser = await new_user.save();

            const accessToken = jwt.sign(waiteduser.toJSON(), process.env.ACCESS_TOKEN_SECRET);
            res.json({accessToken: accessToken}).status(201);
        } catch (err) {
            res.status(400).json({ message: `post internal error: ${err}` });
        }
    }
};

// RAZORPAY FUNCTIONS 
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

verification = async (req, res) => {
    // verification logic 
    const SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
    console.log("VERIFICATION: ", req.body);
    
    res.json({ status: 'ok'});
}

payment = async (req, res) => {
    const payment_capture = 1;
    const amount = 499;
    const currency = 'INR'

    const options = {
        amount: amount*100, 
        currency, 
        receipt: shortid.gene, 
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

// WORKING
login = async (req, res) => {
    // GET  POST
    const users = await User.find()
    if(req.method === 'GET'){
        try {
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
      } 
  
    else if (req.method === 'POST') {
        const user = users.find(user => user.username === req.body.username)
        if(user == null) {
            return res.json({ message: 'User Not Found'}).status(400)
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
    login, signup, payment, verification, logo, 
    // MIDDLE WARES
    authToken, private, allowAdmin, onlyAdmin
};
