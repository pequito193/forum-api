var express = require('express');
var router = express.Router();
const Post = require('./../models/post_model');
const Comment = require('./../models/comment_model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Checks if JWT sent to the server is correct
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });    
}

// -----------------------------------------------------------------------------------------------------

// GET routes
router.get('/', (req, res, next) => {
    Post.find({}).sort({date: -1})
    .exec(function(err, posts) {
        if (err) {
            return next(err);
        }
        res.json({posts: posts});
    })
})

router.get('/users/:user', authenticateToken, (req, res, next) => {
    Post.find({username: req.user.name}).sort({date: -1})
    .exec(function(err, posts) {
        if (err) {
            return next(err);
        }
        res.json({posts: posts});
    })
})

router.get('/:id', (req, res, next) => {
    Post.find({id: req.params.id})
    .exec(function(err, post) {
        if (err) {
            return next(err);
        }
        Comment.find({postID: req.params.id}).sort({date: -1})
        .exec(function(err, comments) {
            if (err) {
                return next(err);
            }
            res.json({post: post, comments: comments});
            return;
        })
    })
})

// -----------------------------------------------------------------------------------------------------

// POST routes
router.post('/new', authenticateToken, (req, res) => {
    const post = new Post({
        id: crypto.randomBytes(32).toString('hex'),
        title: req.body.title,
        content: req.body.content,
        username: req.user.name,
        date: new Date(),
        likes: 0,
        liked_by: []
    })
    post.save((err) => {
        if (err) {
            return next(err);
        }
        res.json({message: 'Success'});
    })
})

router.post('/likes/:id', authenticateToken, (req, res) => {
    if (req.body.info === 'Like') {
        Post.findOneAndUpdate({id: req.params.id}, {$inc: { likes: +1 }, $push: { liked_by: req.user.name }}, (err) => {
            if (err) {
                return next(err);
            }
            res.json({message: 'Success'});
        });
    } else if (req.body.info === 'Dislike') {
        Post.findOneAndUpdate({id: req.params.id}, {$inc: { likes: -1 }, $pull: { liked_by: req.user.name }}, (err) => {
            if (err) {
                return next(err);
            }
            res.json({message: 'Success'});
        });
    } else {
        res.json({error: 'Unknown request'});
    }
})

router.delete('/delete/:id', authenticateToken, (req, res) => {
    Post.findByIdAndDelete({id: req.params.id}, (err) => {
        if (err) {
            return next(err);
        }
    })
})

module.exports = router;