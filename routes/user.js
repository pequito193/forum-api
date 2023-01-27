var express = require('express');
var router = express.Router();
const User = require('../models/user_model');
const Post = require('../models/post_model');
const Comment = require('../models/comment_model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

// ------------------------------------------------------------------------------------------------------------------------

// GET requests
router.get('/', authenticateToken, (req, res, next) => {
  User.find({username: req.user.name}, (err, user) => {
    if (err) {
      return next(err);
    }
    Post.countDocuments({username: req.user.name}, (err, postCount) => {
      if (err) {
        return next(err);
      }
      Comment.countDocuments({username: req.user.name}, (err, commentCount) => {
        if (err) {
          return next(err);
        }
        res.json({user: user, postCount: postCount, commentCount: commentCount});
      })
    })
  })
})

// ------------------------------------------------------------------------------------------------------------------------

// POST requests
router.post('/signup', (req, res, next) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // Check if password fields match
  if (!(password === confirmPassword)) {
    res.json({message: 'Passwords do not match!'});
  };

  // Check if username already exists
  User.countDocuments({username_lowercase: req.body.username.toLowerCase()}, function(err, count) {
    if (count > 0 || req.body.username === 'deleted_account') {
      res.json({message: 'Username already taken!'});
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
            username_lowercase: req.body.username.toLowerCase(),
            email: req.body.email,
            password: hashedPassword,
            date_created: new Date(),
            posts_liked: []
          })
          .save(err => {
            if (err) { 
                return next(err);
            }
          })
          res.json({result: 'Success'});
        };
      });
    }
  });
})

router.post('/login', (req, res, next) => {
    const username = req.body.username;
    const requestPassword = req.body.password;
    
    // Check username
    User.findOne({username: username}, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        res.json({message: 'User not found!'});
      }

      // Check password
      bcrypt.compare(requestPassword, user.password, (err, result) => {
        if (err) {
          return next(err);
        }
        if (!result) {
          res.json({message: 'Incorrect password!'});
        }

        // Successfull login
        if (result) {
          const user = {name: username};
          const accessToken = jwt.sign(user, process.env.SECRET_ACCESS_KEY);
          res.json({accessToken});
        }
      })
    })
})

router.post('/delete', authenticateToken, (req, res, next) => {
  Promise.all([
    // Remove the user from the list of likes of the post (but keep the like amount, this is only to prevent future users with the same name not being able to like the same post)
    Post.updateMany({}, {$pull: {liked_by: req.user.name}}, (err) => {
      if (err) {
        return next(err);
      }
    }).clone(),

    // Remove the user from the list of likes of comment (but keep the like amount, this is only to prevent future users with the same name not being able to like the same comment)
    Comment.updateMany({}, {$pull: {liked_by: req.user.name}}, (err) => {
      if (err) {
        return next(err);
      }
    }).clone(),

    // Change the username of the posts created by the deleted user
    Post.updateMany({username: req.user.name}, {$set: {
      username: 'deleted_account'
    }}, (err) => {
      if (err) {
        return next(err);
      }
    }).clone(),

    // Change the username of the comments created by the deleted user
    Comment.updateMany({username: req.user.name}, {$set: {
      username: 'deleted_account'
    }}, (err) => {
      if (err) {
        return next(err);
      }
    }).clone(),

    // Finally, delete the user
    User.findOneAndDelete({username: req.user.name}, (err) => {
      if (err) {
          return next(err);
      }
    }).clone()

  ])
  .then(() => {
    res.json({message: 'Success'});
  })
})

module.exports = router;