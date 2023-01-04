var express = require('express');
var router = express.Router();
const User = require('./../models/user_model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/signup', (req, res) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // Check if password fields match
  if (!(password === confirmPassword)) {
    res.json({message: 'Passwords do not match!'});
    return;
  };

  // Check if username already exists
  User.countDocuments({username: req.body.username}, function(err, count) {
    console.log(req.body.username, count)
    if (count > 0) {
      res.json({message: 'Username already taken!'});
      return;
    }

    else {
      // Encrypt password and create the user
      bcrypt.hash(`${password}`, 10, (err, hashedPassword) => {
        if(err) {
          return next(err);
        }

        else {
            const user = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
        })
        .save(err => {
            if (err) { 
                return next(err);
            }
        })
        
        res.end;

      };
      });
    }
  });

})

router.post('/login', (req, res) => {
    const username = req.body.username;
    const requestPassword = req.body.password;
    
    // Check username
    User.findOne({username: username}, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        res.json({message: 'User not found!'});
        return;
      }

      // Check password
      bcrypt.compare(requestPassword, user.password, (err, result) => {
        if (err) {
          return next(err);
        }
        if (!result) {
          res.json({message: 'Incorrect password!'});
          return;
        }

        // Successfull login
        if (result) {
          const user = {name: username};
          const accessToken = jwt.sign(user, process.env.SECRET_ACCESS_KEY);
          res.json({accessToken: accessToken});

        }
      })
    })
})

module.exports = router;
