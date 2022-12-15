var express = require('express');
var router = express.Router();
const Post = require('./../models/post_model');
const Comment = require('./../models/comment_model');
const User = require('./../models/user_model');
const crypto = require('crypto');

router.get('/', (req, res) => {
    res.redirect('/list');
})

router.get('/list', (req, res) => {
    Post.find({})
    .exec(function(err, results) {
        if (err) {
            res.json({error: err});
        }
        res.json({data: results});
    });
})

router.get('/:id', (req, res) => {
    Post.find({title: req.params.id})
    .exec(function(err, posts) {
        if (err) {
            res.json({error: err});
        }
        Comment.find({postID: req.params.id //dont know yet
    })
        .exec(function(err, comments) {
            if (err) {
                res.json({error: err});
            }
            res.json({posts: posts, comments: comments});
        })
    })
})

router.post('/create', (req, res) => {
    const post = new Post({
        id: crypto.randomBytes(32).toString('hex'),
        title: req.body.title,
        content: req.body.content,
        username: req.body.username,
        date: new Date()
    })
    post.save((err) => {
        if (err) {
            res.json({error: err});
        }
    })
})

router.delete('/delete/:id', (req, res) => {
    Post.findByIdAndDelete({})
})

module.exports = router;