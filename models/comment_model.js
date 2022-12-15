const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    postID: {type: String, required: true},
    content: {type: String, required: true},
    username: {type: String, required: true},
    date: {type: String, required: true}
});

module.exports = mongoose.model('Comments', CommentSchema);