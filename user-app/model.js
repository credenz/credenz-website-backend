const mongoose = require('mongoose');

const user_schema = mongoose.Schema({
    username: { type: String, require: true },
    password: { type: String, require: true },
    email: { type: String, require: true },
    phoneno: { type: Number, require: true },
    clgname: { type: String, require: true },
    name : { type: String, require: true },
    present_events: [Number],
    played_events: [Number]
})

const event = mongoose.Schema({
    event_id: { type: Number, require: true },
    event_name: { type: String, require: true },
    event_des: { type: String, require: true },
    event_time: { type: String, require: true }, 
    event_price: {type: Number, require: true}
})

User = mongoose.model('User', user_schema, 'users');
Event = mongoose.model('Event', event, 'events');

module.exports = {
    User, 
    Event
}