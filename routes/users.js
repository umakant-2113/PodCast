var express = require('express');
var router = express.Router();
var User = require('../models/User');
var auth = require('../middleware/auth');
var Podcast = require("../models/Podcast");

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });


router.get('/signup', (req, res) => {
  var error = req.flash('error')[0];
  res.render('signup', { error });
});

// register

router.post('/signup', (req, res, next) => {
  User.create(req.body, (err, user) => {
    // console.log(err, user)
    if (err) {
      if (err.code === 11000) {
        req.flash('error', 'This email is already registered');
        return res.redirect('/users/signup');
      }
      if (err.name === 'ValidationError') {
        req.flash('error', err.message);
        return res.redirect('/users/signup');
      }
      return res.json({ err });
    }
    res.redirect('/users/signin');
  });
});

// user login

router.get('/signin', (req, res, next) => {
  var error = req.flash('error')[0];
  res.render('signin', { error });
});

// login

router.post('/signin', (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email and Password required');
    return res.redirect('/users/signin');
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    // no user
    if (!user) {
      req.flash('error', 'This email is not registered!');
      return res.redirect('/users/signin');
    }
    // compare password

    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash('error', 'Incorrect Password!');
        return res.redirect('/users/signin');
      }

      // persist logged in user information
      req.session.userId = user._id;
      res.redirect('/podcast');
    });
  });
});


// upgrade

router.get("/upgrade", auth.loggedInUser, (req, res, next) => {
  res.render("upgrade")
});

router.post("/upgrade", (req, res, next) => {
     var userId = req.user.id;
      User.findById(userId, (err, user) => {
      if (err) return next(err);

      let subscription = {
        currentSubscription: user.subscription.currentSubscription,
        isRequested: true,
        requestedFor: req.body.subscription,
      };

     User.findByIdAndUpdate(userId, { subscription }, (err, user) => {
       if (err) return next(err);
       res.redirect('/podcast');
     });
   });
});

router.get("/upgradeRequest", auth.loggedInUser, (req, res, next) => {
  User.find({ 'subscription.isRequested': true}, (err, user) => {
    if (err) return next(err);
    // console.log(user);
    res.render('pendingUpgrade', { user });
  })
})

router.get('/:id/approve', (req, res, next) => {
  const userId = req.params.id;
  User.findById(userId, (err, user) => {
    if (err) return next(err);

    let subscription = {
      currentSubscription: user.subscription.requestedFor,
      isRequested: false,
      requestedFor: '',
    };

    User.findByIdAndUpdate(userId, { subscription }, (err, user) => {
      if (err) return next(err);
      console.log(user);
      res.redirect('/podcast');
    });
      
  });
})


// logout

router.get('/logout', auth.loggedInUser, (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/signin');
});


module.exports = router;
