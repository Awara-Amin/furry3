const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  conversationId: {
    type: String,
  },
  //  this will be containing the sender Id
  sender: {
    type: String,
  },
  text: {
    type: String,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// to get virtual id not this _id
messageSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
messageSchema.set("toJSON", {
  virtuals: true,
});
exports.Message = mongoose.model("Message", messageSchema);
