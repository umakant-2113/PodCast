var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /@/,
    },
    phone: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 14,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    subscription: {
      currentSubscription: { type: String, default: 'regular' },
      isRequested: { type: Boolean, default: false },
      requestedFor: { type: String, default: '' },
    },
    
    myPodcasts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Podcast' }],
  },
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  var adminEmails = [
    'admin1@gmail.com',
    'admin2@gmail.com',
    'admin3@gmail.com',
  ];
  // Deciding Admin
  if (adminEmails.includes(this.email)) {
    this.isAdmin = true;
  }
  // Hashing Password
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hashedPwd) => {
      this.password = hashedPwd;
      return next();
    });
  } else {
    return next();
  }
});

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};

var User = mongoose.model('User', userSchema);
module.exports = User;
