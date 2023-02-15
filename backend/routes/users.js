const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// edit user
const multer = require("multer");
const path = require("path");
// const console = require("console");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  const userList = await User.find();
  // const userList = await User.find().select("name phone email");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(userList);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  // const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res
      .status(500)
      .json({ message: "the user with the given id was not found" });
  }
  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();
  if (!user) return res.status(404).send("the user can not be created");

  res.send(user);
});

// router.post("/login", async (req, res) => {
//   const user = await User.findOne({ email: req.body.email });
//   const secret = process.env.secret;
//   if (!user) {
//     return res.status(400).send("The user not found");
//   }

//   if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
//     res.status(200).send("user Authenticated");
//   } else {
//     res.status(400).send("password is wrong!");
//   }
// });

router.post("/login", async (req, res) => {
  // const user = await User.findOne({ email: req.body.email });
  // const user = await User.findOne({ email: req.body.email });
  // console.log("req.body.email 11");
  // console.log(req.body.phone);
  const user = await User.findOne(
    { phone: req.body.phone }
    // { $or: [{ email: req.body.email }, { phone: req.body.email }] }
    //  ({ "$or":[ { email: email },       { phone: req.body.phone} ] }

    // function (err, user) {
    //   if (err) {
    //     res.send(err);
    //   }
    //   console.log(user);
    //   res.json(user);
    // }
  );
  // console.log("req.body.phone");
  // console.log(user);
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).send("The user not found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("password is wrong!");
  }
});
// BENAWA for e-comerce mobile
// router.post("/login", async (req, res) => {
//   // const user = await User.findOne({ email: req.body.email });
//   // const user = await User.findOne({ email: req.body.email });
//   console.log(req.body.email);
//   const user = await User.findOne(
//     { $or: [{ email: req.body.email }, { phone: req.body.email }] }
//     //  ({ "$or":[ { email: email },       { phone: req.body.phone} ] }

//     // function (err, user) {
//     //   if (err) {
//     //     res.send(err);
//     //   }
//     //   console.log(user);
//     //   res.json(user);
//     // }
//   );
//   const secret = process.env.secret;
//   if (!user) {
//     return res.status(400).send("The user not found");
//   }

//   if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
//     const token = jwt.sign(
//       {
//         userId: user.id,
//         isAdmin: user.isAdmin,
//       },
//       secret,
//       { expiresIn: "1d" }
//     );

//     res.status(200).send({ user: user.email, token: token });
//   } else {
//     res.status(400).send("password is wrong!");
//   }
// });

router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

router.put("/notifications", uploadOptions.none(), async (req, res) => {
  // const user = await User.findOne({ email: req.body.email });
  // const user = await User.findOne({ email: req.body.email });
  // console.log("inside user kaka -111111 1111111111111-a1");
  const { userIDD, useNAMEE, messageText, discountAmount } = req.body;
  // console.log(userIDD);
  // console.log(" 100444");
  // console.log(useNAMEE);
  // console.log(" 100555");
  // console.log(messageText);
  // console.log(" 100555");
  // console.log(discountAmount);
  const usercopunNumber = Math.random() * 2;
  const user = await User.findOne({ _id: userIDD });

  // const user = await User.findOne(
  //   { $or: [{ email: req.body.email }, { phone: req.body.email }] }
  //   //  ({ "$or":[ { email: email },       { phone: req.body.phone} ] }

  //   // function (err, user) {
  //   //   if (err) {
  //   //     res.send(err);
  //   //   }
  //   //   console.log(user);
  //   //   res.json(user);
  //   // }
  // );

  if (!user) return res.status(400).send("Invalid User kaka!");
  // const secret = process.env.secret;
  // if (!user) {
  //   return res.status(400).send("The user not found, do registration first");
  // }
  // if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {

  if (user && user.isCouponGiven == false) {
    const unseenNotifications = user.unseenNotifications;
    unseenNotifications.push({
      // type: "new-doctor-request-changed",
      type: `${discountAmount}`,
      message: `${usercopunNumber}`,
      message2: `${messageText}`,
      // message: `it is ${"patientNamekaka.patientName"} due to enter, please`,
      data: {
        // doctorId: newdoctor._id,
        // doctorId: doctorId,
        // name: patientName + " " + "newdoctor.lastName",
        name: `${useNAMEE}`,
      },
      // onClickPath: "/notifications",
    });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { unseenNotifications },
      { new: true }
    );

    // await doctor.save();

    res.status(200).send({
      message: "User status updated successfully har esta",
      success: true,
      data: updatedUser,
    });
    // const updatedUserPassword = await User.updateOne(
    //   { $or: [{ email: req.body.email }, { phone: req.body.email }] },

    //   {
    //     passwordHash: bcrypt.hashSync(req.body.confirmPassword, 10),
    //     // name: req.body.name,
    //     // email: req.body.email,
    //     // isAdmin: Boolean(req.body.isAdmin),
    //   },
    //   { new: true }
    // );
    // if (!updatedUserPassword)
    //   return res.status(500).send("the userPassword can not be edited bram");
    // res.status(200).send(updatedUserPassword);
  }
});

router.put("/admin-notifications", uploadOptions.none(), async (req, res) => {
  // const user = await User.findOne({ email: req.body.email });
  // const user = await User.findOne({ email: req.body.email });
  // console.log("inside user kaka -111111 1111111111111-20233333333-2001");
  // const { userIDD, useNAMEE, messageText, discountAmount } = req.body;
  const { userIDD, useNAMEE } = req.body;
  // console.log(userIDD);
  // console.log(" 2023-2002");
  // console.log(useNAMEE);
  // console.log(" 2023-2003");
  // console.log(messageText);
  // console.log(" 100555");
  // console.log(discountAmount);
  // const usercopunNumber = Math.random() * 2;
  // const user = await User.findOne({ _id: userIDD });
  const user = await User.findOne({ isAdmin: true });
  // console.log(" 2023-2004");
  // console.log(user._id);
  // const user = await User.findOne(
  //   { $or: [{ email: req.body.email }, { phone: req.body.email }] }
  //   //  ({ "$or":[ { email: email },       { phone: req.body.phone} ] }

  //   // function (err, user) {
  //   //   if (err) {
  //   //     res.send(err);
  //   //   }
  //   //   console.log(user);
  //   //   res.json(user);
  //   // }
  // );

  // if (!user) return res.status(400).send("Invalid User kaka!");
  // const secret = process.env.secret;
  // if (!user) {
  //   return res.status(400).send("The user not found, do registration first");
  // }
  // if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {

  // if (user && user.isCouponGiven == false) {
  if (user.isAdmin == true) {
    const unseenNotifications = user.unseenNotifications;
    unseenNotifications.push({
      type: "new-notification-of-order-for-admin",
      // type: `${discountAmount}`,
      // message: `${usercopunNumber}`,
      // message2: `${messageText}`,
      // message: `it is ${"patientNamekaka.patientName"} due to enter, please`,
      data: {
        // doctorId: newdoctor._id,
        // doctorId: doctorId,
        // name: patientName + " " + "newdoctor.lastName",
        name: `${useNAMEE}`,
      },
      // onClickPath: "/notifications",
    });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { unseenNotifications },
      { new: true }
    );

    res.status(200).send({
      message: "User status updated successfully har esta for Admin",
      success: true,
      data: updatedUser,
    });
    console.log(" 2023-2010");
    const io = req.app.get("socketio");
    // // io.emit("pong2", { updatedProduct, by: "mehdi-2" });
    // io.to(user.isAdmin).emit("notif", {
    io.emit("notif", {
      //   // productId: updatedProduct.id,
      updatedUserSocket: updatedUser,

      //   // review: review,
      //   // review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      // });
      // const updatedUserPassword = await User.updateOne(
      //   { $or: [{ email: req.body.email }, { phone: req.body.email }] },

      //   {
      //     passwordHash: bcrypt.hashSync(req.body.confirmPassword, 10),
      //     // name: req.body.name,
      //     // email: req.body.email,
      //     // isAdmin: Boolean(req.body.isAdmin),
      //   },
      //   { new: true }

      // if (!updatedUserPassword)
      //   return res.status(500).send("the userPassword can not be edited bram");
      // res.status(200).send(updatedUserPassword);
    });
  }
});
//   "/got-coupon/:id",
router.put("/a-coupon", uploadOptions.none(), async (req, res) => {
  // const user = await User.findOne({ email: req.body.email });
  // const user = await User.findOne({ email: req.body.email });
  // console.log("inside user kaka EEEEEEEEEEEEE-30001");
  const { userIDD, useNAMEE, couponNumber } = req.body;
  // console.log(userIDD);
  // console.log(" 100444");
  // console.log(useNAMEE);
  // console.log(" 100555");
  // console.log(couponNumber);
  // console.log(" 100555");
  // console.log(discountAmount);
  // const usercopunNumber = Math.random() * 2;
  const user = await User.findOne({ _id: userIDD });

  // const user = await User.findOne(
  //   { $or: [{ email: req.body.email }, { phone: req.body.email }] }
  //   //  ({ "$or":[ { email: email },       { phone: req.body.phone} ] }

  //   // function (err, user) {
  //   //   if (err) {
  //   //     res.send(err);
  //   //   }
  //   //   console.log(user);
  //   //   res.json(user);
  //   // }
  // );
  if (!user) return res.status(400).send("Invalid User kaka!");
  // const secret = process.env.secret;
  // if (!user) {
  //   return res.status(400).send("The user not found, do registration first");
  // }
  // if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {

  if (user) {
    user.isCouponGiven === true; //I believe you can remove this, no need
    // const unseenNotifications = user.unseenNotifications;
    // const seenNotifications = user.seenNotifications;

    // seenNotifications.push(...unseenNotifications);
    // user.unseenNotifications = [];
    // user.seenNotifications = seenNotifications;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      // { unseenNotifications: [], seenNotifications, isCouponGiven: true },
      { isCouponGiven: true },
      { new: true }
    );

    // await doctor.save();

    res.status(200).send({
      message: "User Agian status updated successfully har esta",
      success: true,
      data: updatedUser,
    });
    // const updatedUserPassword = await User.updateOne(
    //   { $or: [{ email: req.body.email }, { phone: req.body.email }] },

    //   {
    //     passwordHash: bcrypt.hashSync(req.body.confirmPassword, 10),
    //     // name: req.body.name,
    //     // email: req.body.email,
    //     // isAdmin: Boolean(req.body.isAdmin),
    //   },
    //   { new: true }
    // );
    // if (!updatedUserPassword)
    //   return res.status(500).send("the userPassword can not be edited bram");
    // res.status(200).send(updatedUserPassword);
  }
});

router.put("/admin-updates-notification", async (req, res) => {
  // const user = await User.findOne({ email: req.body.email });
  // const user = await User.findOne({ email: req.body.email });
  // console.log("inside user kaka EEEEEEEEEEEEE-30001");
  // const { userIDD, useNAMEE, couponNumber } = req.body;
  // console.log(userIDD);
  // console.log(" 100444");
  // console.log(useNAMEE);
  // console.log(" 100555");
  // console.log(couponNumber);
  // console.log(" 100555");
  // console.log(discountAmount);
  // const usercopunNumber = Math.random() * 2;

  // const user = await User.findOne({ _id: userIDD });
  const user = await User.findOne({ isAdmin: true });
  // console.log(" 2023-2005");
  // console.log(user._id);

  // const user = await User.findOne(
  //   { $or: [{ email: req.body.email }, { phone: req.body.email }] }
  //   //  ({ "$or":[ { email: email },       { phone: req.body.phone} ] }

  //   // function (err, user) {
  //   //   if (err) {
  //   //     res.send(err);
  //   //   }
  //   //   console.log(user);
  //   //   res.json(user);
  //   // }
  // );
  // if (!user) return res.status(400).send("Invalid User kaka!");
  // const secret = process.env.secret;
  // if (!user) {
  //   return res.status(400).send("The user not found, do registration first");
  // }
  // if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {

  // if (user) {
  if (user.isAdmin == true) {
    // user.isCouponGiven === true; //I believe you can remove this, no need
    // const unseenNotifications = user.unseenNotifications;
    // const seenNotifications = user.seenNotifications;

    // seenNotifications.push(...unseenNotifications);
    // user.unseenNotifications = [];
    // user.seenNotifications = seenNotifications;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      // { unseenNotifications: [], seenNotifications, isCouponGiven: true },
      { unseenNotifications: [] },
      // { isCouponGiven: true },
      { new: true }
    );

    // await doctor.save();

    res.status(200).send({
      message: "User Agian status updated successfully har esta",
      success: true,
      data: updatedUser,
    });
    // console.log(" 2023-2007");
    // console.log(data);
    // const updatedUserPassword = await User.updateOne(
    //   { $or: [{ email: req.body.email }, { phone: req.body.email }] },

    //   {
    //     passwordHash: bcrypt.hashSync(req.body.confirmPassword, 10),
    //     // name: req.body.name,
    //     // email: req.body.email,
    //     // isAdmin: Boolean(req.body.isAdmin),
    //   },
    //   { new: true }
    // );
    // if (!updatedUserPassword)
    //   return res.status(500).send("the userPassword can not be edited bram");
    // res.status(200).send(updatedUserPassword);
  }
});
// User Edit
router.put("/:id", uploadOptions.none(), async (req, res) => {
  // in this case API will return error if we pass wrong id
  // mongoose.isValidObjectId(req.params.id);
  const productId = req.params.id;
  // console.log("req.bodyyyyyyyyyyyy shexa");
  // console.log(req.body.email);
  // console.log(req.body.phone);
  // console.log(req.body.id);
  // console.log(req.params.id);
  // console.log(req.body.isAdmin);
  // console.log(Boolean(req.params.isAdmin));
  // if (!mongoose.isValidObjectId(req.params.id)) {
  //   res.status(400).send("Invalid Product Id");
  // }

  // const category = await User.findById(req.body.productId);
  // if (!category) return res.status(400).send("Invalid User kaka taza1");

  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("Invalid User kaka!");

  // const file = req.file;
  // console.log("wtaht is fileeeeeeeeeeeee");
  // console.log(file);
  // let imagepath;

  // if (file) {
  //   const fileName = file.filename;
  //   const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  //   imagepath = `${basePath}${fileName}`;
  // } else {
  //   imagepath = product.image;
  // }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      // isAdmin: Boolean(req.body.isAdmin),
      // image: req.body.image,
      // image: imagepath,
      // images: req.body.Images,
      // brand: req.body.brand,
      // price: req.body.price,
      // category: req.body.category,
      // countInStock: req.body.countInStock,
      // rating: req.body.rating,
      // numReviews: req.body.numReviews,
      // isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!updatedUser)
    return res.status(500).send("the user can not be edited bram");
  res.send(updatedUser);
});

// forgotten Passwords

router.put(
  "/forgottenpassword/update",
  uploadOptions.none(),
  async (req, res) => {
    // const user = await User.findOne({ email: req.body.email });
    // const user = await User.findOne({ email: req.body.email });
    // console.log("passssssssswoooooooooord-111111");
    // console.log(req.body.email);
    const user = await User.findOne(
      { $or: [{ email: req.body.email }, { phone: req.body.email }] }
      //  ({ "$or":[ { email: email },       { phone: req.body.phone} ] }

      // function (err, user) {
      //   if (err) {
      //     res.send(err);
      //   }
      //   console.log(user);
      //   res.json(user);
      // }
    );
    if (!user) return res.status(400).send("Invalid User kaka!");
    // const secret = process.env.secret;
    // if (!user) {
    //   return res.status(400).send("The user not found, do registration first");
    // }
    // if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    if (user && req.body.newPassword === req.body.confirmPassword) {
      const updatedUserPassword = await User.updateOne(
        { $or: [{ email: req.body.email }, { phone: req.body.email }] },

        {
          passwordHash: bcrypt.hashSync(req.body.confirmPassword, 10),
          // name: req.body.name,
          // email: req.body.email,
          // isAdmin: Boolean(req.body.isAdmin),
        },
        { new: true }
      );
      if (!updatedUserPassword)
        return res.status(500).send("the userPassword can not be edited bram");
      res.status(200).send(updatedUserPassword);
    }
  }
);

module.exports = router;
