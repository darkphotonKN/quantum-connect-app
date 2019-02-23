const express = require('express');
const router = express.Router();

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// load User model
const User = require('../../models/User');

// @route GET api/users/test
// @desc Tests post route
// @access Public

router.get('/test', (req, res) => {
  res.json({
    msg: "User's Works",
    status: 200
  });
});

// @route GET api/users/register
// @desc Register a user
// @access Public

router.post('/register', (req, res) => {
  // using mongoose to find if the email exists
  // depending on if found or not do the following actions following '.then'
  User.findOne({ email: req.body.email }).then((user) => {
    // user already registered so return error status
    if (user) {
      return res.status(404).json({
        email: 'Email already exists'
      });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', // size
        rating: 'pg', // rating
        d: 'mm' // default
      });

      // creating a new instance of our User, properties match our schema
      // model in models/User.js
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        // note this is text need to still encrypt the password
        password: req.body.password,
        avatar
      });

      // encrypting password with SALT via bcrypt package
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          // replacing our plain text to the hashed password
          newUser.password = hash;
          // save newUser with mongoose in our mongoDB database, then return
          // to client side with the user data in json format
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

module.exports = router;
