var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var podcastSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    cover: {
      type: String,
      required: true,
    },
    audioTrack: {
      type: String,
      required: true,
    },
    categories: [{ type: String }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    accessFor: {
      type: String,
      required:true,
    },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timeStamps: true }
);

module.exports = mongoose.model("Podcast", podcastSchema);
