var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var Podcast = require('../models/Podcast');
var Comment = require('../models/Comment');
var User = require('../models/User');
var multer = require('multer');
var path = require('path');


const storage = multer.diskStorage({

  destination: function (req, file, cb) {
     if (file.originalname.split('.')[file.originalname.split('.').length - 1] ==='mp3'){
       cb(null, path.join(__dirname, '../public/uploads/tracks/')); 
     } else {
       cb(null, path.join(__dirname, '../public/uploads/covers/')); 
   }
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get('/', function (req, res, next) {
  let userId = req.user.id;
  User.findById(userId, (err, user) => {
    if (err) return next(err);
    if (user.isAdmin === true) {
      Podcast.find({})
        .populate('author')
        .exec((err, podcasts) => {
          if (err) return next(err);
            res.render('adminDashboard', { podcasts, user });
        });
    } else if (user.isAdmin === false) {
      if (user.subscription.currentSubscription === 'VIP') {
        Podcast.find({ isVerified: true })
          .populate('author')
          .exec((err, podcasts) => {
            if (err) return next(err);
            res.render('userDashboard', { podcasts, user });
          });
      } else if (user.subscription.currentSubscription === 'regular') {
        Podcast.find({ isVerified: true, accessFor: 'regular' })
          .populate('author')
          .exec((err, podcasts) => {
            if (err) return next(err);
            res.render('userDashboard', { podcasts, user });
          });
      } else if (user.subscription.currentSubscription === 'premium') {
        Podcast.find({ isVerified: true, accessFor: 'premium'   })
          .populate('author')
          .exec((errP, podcastsP) => {
            if (err) return next(err);
            // res.render('userDashboard', { podcasts, user });
            Podcast.find({ isVerified: true, accessFor: 'regular' })
              .populate('author')
              .exec((err, podcastsR) => {
                if (err) return next(err);
                let podcasts = podcastsP.concat(podcastsR);
                res.render('userDashboard', { podcasts, user });
              });
          });
      }
      
    }
  });
});

router.get('/new', auth.loggedInUser, (req, res, next) => {
  res.render('addPodcast');
});


router.get('/pending', auth.loggedInUser, (req, res, next) => {
  Podcast.find({ isVerified: false }, (err, podcast) => {
    if (err) return next(err);
    res.render('pending', { podcast });
  })
})


router.post(
  '/',
  auth.loggedInUser,

  upload.fields([{ name: 'cover' }, { name: 'audioTrack' }]),
  (req, res, next) => {
    req.body.author = req.user._id;
      req.body.accessFor = req.user.subscription.currentSubscription;
    req.body.cover = req.files.cover[0].filename;
    req.body.audioTrack = req.files.audioTrack[0].filename;
    Podcast.create(req.body, (err, createdPodcast) => {
      if (err) return next(err);
      res.redirect('podcast');
    });
  }
);


router.get('/:id', (req, res, next) => {
  const podcastId = req.params.id;
  Podcast.findById(podcastId)
    .populate('author')
    .exec((err, podcast) => {
      if (err) return next(err);
      res.render('podcast', { podcast });
    });
});

router.get('/:id/verify', (req, res, next) => {
  const podcastId = req.params.id;
  Podcast.findByIdAndUpdate(podcastId,{isVerified:true})
    .populate('author')
    .exec((err, podcast) => {
      if (err) return next(err);
      res.render('podcast', { podcast });
    });
});


router.get('/:id/delete', (req, res, next) => {
  var id = req.params.id;
  Podcast.findByIdAndDelete(id, req.body, (err, event) => {
    if (err) return next(err);
    res.redirect('/podcast')
  });
});


module.exports = router;
