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

router.get('/', (req, res) => {
    Post.find({}).sort({date: -1})
    .exec(function(err, posts) {
        if (err) {
            res.json({error: err});
        }
        res.json({data: posts});
    })
})

router.get('/:id', (req, res) => {
    console.log(req.params.id)
    Post.find({id: req.params.id})
    .exec(function(err, posts) {
        if (err) {
            res.json({error: err});
        }
        res.json({posts: posts});
    })
})

router.post('/new', authenticateToken, (req, res) => {
    const post = new Post({
        id: crypto.randomBytes(32).toString('hex'),
        title: req.body.title,
        content: req.body.content,
        username: req.user.name,
        date: new Date(),
        likes: 0
    })
    post.save((err) => {
        if (err) {
            res.json({error: err});
        }
        res.json({message: 'Success'});
    })
})

router.delete('/delete/:id', authenticateToken, (req, res) => {
    Post.findByIdAndDelete({id: req.params.id}, (err) => {
        if (err) {
            return next(err);
        }
    })
})

module.exports = router;