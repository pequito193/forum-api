const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true},
    username_lowercase: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    date_created: {type: Date, required: true},
    posts_liked: {type: Array, required: true}
});

module.exports = mongoose.model('Users', UserSchema);