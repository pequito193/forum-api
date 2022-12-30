var express = require('express');
var router = express.Router();
const User = require('./../models/user_model');

router.get('/', (req, res) => {
    res.json('get request received')
})

router.post('/sign-up', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });
    user.save((err) => {
        if (err) {
            res.json({error: err});
        }
    })
})

router.post('/log-in', (req, res) => {
    
})

module.exports = router;
