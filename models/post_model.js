const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    id: {type: String, required: true},
    title: {type: String, required: true},
    content: {type: String, required: true},
    username: {type: String, required: true},
    date: {type: String, required: true},
    likes : {type: Number}
});

module.exports = mongoose.model('Posts', PostSchema);