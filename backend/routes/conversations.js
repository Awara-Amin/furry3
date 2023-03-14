const express = require("express");
const { Conversation } = require("../models/conversation");
// const { Coupon } = require("../models/coupon");
// const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
// const console = require("console");

// new conversation
router.post(`/`, async (req, res) => {
  console.log(req.body.senderId);
  console.log(req.body.receiverId);
  //   let newConversation = new Conversation({
  //     members: [req.body.senderId, req.body.receiverId],
  //   });
  //   newConversation = await newConversation.save();

  //   if (!newConversation)
  //     return res.status(500).send("The conversation can not be created");
  //   res.status(200).json(newConversation);

  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conver of a user
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
