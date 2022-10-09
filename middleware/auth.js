var User = require('../models/User');
module.exports = {
  loggedInUser: (req, res, next) => {
    try {
      if (req.session && req.session.userId) {
        return next();
      } else {
        req.flash('error', 'To use this feature you have to sign in first..');
        return res.redirect('/users/signin');
      }
    } catch (error) {
      return next(error);
    }
  },

  userInfo: (req, res, next) => {
    try {
      const userId = req.session && req.session.userId;
      if (userId) {
        User.findById(
          userId,
          'firstName lastName email isAdmin subscription',
          (err, user) => {
            if (err) return next(err);
            req.user = user;
            res.locals.user = user;
            return next();
          }
        );
      } else {
        req.user = null;
        res.locals.user = null;
        return next();
      }
    } catch (error) {
      return next(error);
    }
  },
};
