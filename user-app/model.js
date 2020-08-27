const mongoose = require('mongoose');

const user_schema = mongoose.Schema({
    username: { type: String, require: true },
    password: { type: String, require: true },
    role: { type: String, default: 'basic' },
})

// numberQue is count of all the questions submited by the user including deleted questions.
// currentQue is count of the current present number.

User = mongoose.model('User', user_schema, 'users');
    
module.exports = {
    User
}