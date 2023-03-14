const express = require("express");
const router = express.Router();
const { Category } = require("../models/category");
const { Favcard } = require("../models/favoriteCartModel.js");
const { Product } = require("../models/product.js");

// CREATE
router.post(`/:id`, async (req, res) => {
  const productId = req.params.id;
  const { userId } = req.body;
  // const { userId } = req.favorateProducts;
  // console.log("1");
  // console.log(productId);
  // console.log("2");
  // console.log(userId);

  try {
    // let favorite = await Favcard.findOne({userId});
    let favoriteProduct = await Product.findOne({ _id: productId });
    if (!favoriteProduct) {
      res.status(404).send("Item not found!");
    }

    // console.log(favoriteProduct);
    // console.log("favoriteys kaka");
    // const productId = favoriteProduct._id;
    // const name = favoriteProduct.name;
    // const image = favoriteProduct.image;

    const newFavoriteCart = new Favcard({
      userId,
      favorateProducts: [
        {
          productId: favoriteProduct._id,
          name: favoriteProduct.name,
          image: favoriteProduct.image,
          price: favoriteProduct.price,
        },
      ],
    });

    const favoriteCart = await newFavoriteCart.save();
    res.send({ favoriteCart });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});

// GET
router.get("/find/:userId", async (req, res) => {
  const favoriteCart = await Favcard.findOne({ userId: req.params.userId });
  if (favoriteCart) {
    res.send(favoriteCart);
  } else {
    res.status(404).send({ message: "favoriteCart Not Found" });
  }
});

// DELETE Fav product
router.delete("/:id", async (req, res) => {
  const productId = req.params.id;
  // console.log("11");
  // console.log(productId);
  // console.log("13");
  // console.log(Object.keys(Favcard).length);
  // const productFav = await Favcard.favorateProducts.find(
  //   (x) => x.productId === productId
  // );

  const productFav = Favcard.find({
    "favorateProducts.productId": productId,
  });
  // const productFav = Favcard.find({
  //   favorateProducts: { productId: productId },
  // });

  // console.log("12");
  // console.log(productFav);
  const favoriteCart = await Favcard.findByIdAndRemove(productId);
  // const favoriteCart = await Favcard.findByIdAndRemove.find((x) => x.productId === productId)){
  //   return res
  //   .status(400)
  //   .send({ message: "You have already submitted a review" });
  // }

  // console.log("14");
  // console.log(favoriteCart);
  if (favoriteCart) {
    res.send({
      message: "Favorite product has been deleted",
      favoriteCart: favoriteCart,
    });
  } else {
    res.status(404).send({ message: "favoriteCart Not Found" });
  }
});

// to get a favoriteCart by id
router.get("/:id", async (req, res) => {
  const favoriteCart = await Favcard.findById(req.params.id);
  if (favoriteCart) {
    res.send(favoriteCart);
  } else {
    res.status(404).send({ message: "favoriteCart Not Found" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  const favoriteCart = await Favcard.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  );
  if (favoriteCart) {
    const updatedFavoriteUser = await favoriteCart.save();
    res.send({
      message: "favoriteCart Updated",
      favoriteCart: updatedFavoriteUser,
    });
  } else {
    res.status(404).message({ message: "FavoriteCart not found bra" });
  }
});

module.exports = router;
