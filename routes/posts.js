var express = require('express');
var router = express.Router();
const Post = require('./../models/post_model');
const Comment = require('./../models/comment_model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.body.jwt;
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

router.get('/', (req, res, next) => {
    Post.find({}).sort({date: -1})
    .exec(function(err, posts) {
        if (err) {
            return next(err);
        }
        res.json({data: posts});
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
            res.json({error: err});
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
            res.end;
        });
    } else if (req.body.info === 'Dislike') {
        Post.findOneAndUpdate({id: req.params.id}, {$inc: { likes: -1 }, $pull: { liked_by: req.user.name }}, (err) => {
            if (err) {
                return next(err);
            }
            res.end;
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