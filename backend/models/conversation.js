const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema({
  members: {
    // it will be only contain conversationID, and members
    type: Array,
    // required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// to get virtual id not this _id
conversationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
conversationSchema.set("toJSON", {
  virtuals: true,
});

exports.Conversation = mongoose.model("Conversation", conversationSchema);
