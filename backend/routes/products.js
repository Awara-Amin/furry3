const { Product } = require("../models/product");
const { Category } = require("../models/category");
const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const console = require("console");

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
  // localhost:3000/api/v1/products?categories=123445,234567    >v40
  let filter = {}; // when it is empty we get all
  //but when there are/is query we get based on the query
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  // const productList = await Product.find({ category: [] }).populate("category");
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  // console.log("res.data aaaaaaaaaaaaaaaaaa 1001");
  // console.log(productList);
  res.send(productList);
});

router.get(`/:id`, async (req, res) => {
  // const product = await Product.findById(req.params.id);
  // console.log("thissssssssss is get by id");
  // console.log(req.params.id);
  // video 35 WOW
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

// router.post(`${api}/products`, (req, res) => {
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file = req.file;
  // console.log("wtaht is fileeeeeeeeeeeee");
  // console.log(file);
  if (!file) return res.status(400).send("No image in the request");

  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
    images: [],
    brand: req.body.brand,
    price: req.body.price,
    discount: req.body.discount,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    numReviews: 0,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The product can not be created");

  res.send(product);
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  // in this case API will return error if we pass wrong id
  // mongoose.isValidObjectId(req.params.id);
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findById(req.params.id);
  // console.log("wtaht is product tttttttttttttttttttt");
  // console.log(product);
  // console.log(product.image);
  if (!product) return res.status(400).send("Invalid Product!");

  const file = req.file;
  // console.log("wtaht is fileeeeeeeeeeeee");
  // console.log(file);
  let imagepath;

  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      // image: req.body.image,
      image: imagepath,
      // images: req.body.Images,
      brand: req.body.brand,
      price: req.body.price,
      discount: req.body.discount,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!updatedProduct)
    return res.status(500).send("the product can not be created");
  res.send(updatedProduct);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "The product is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product was not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  // res.send(productCount);
  res.send({
    productCount: productCount,
  });
});

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 6),
  async (req, res) => {
    // console.log("req qqqqqqqqqqqqqqqqqqqqqqq");
    // console.log(req);
    // console.log("req qqqqqqqqqqqqqqqqqqqqqqq2");
    // console.log(req.body.data);
    // console.log("req qqqqqqqqqqqqqqqqqqqqqqq3");
    // console.log(req.body.data);
    // console.log(req.body._parts);
    // console.log(req.body.images);
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send("Invalid Product!");

    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!updatedProduct)
      return res.status(500).send("the gallery cannot be updated!");

    res.send(updatedProduct);
  }
);

router.put("/:id/reviews", uploadOptions.none(), async (req, res) => {
  const productId = req.params.id;
  // console.log(req.body.name);
  // const obj = req.body.data.name;
  // console.log(req.body.toString());
  // console.log(req.params);
  const product = await Product.findById(productId);
  // console.log("ourrrrrrrr product is ");
  // console.log(product);
  if (product) {
    if (product.reviews.find((x) => x.name === req.body.name)) {
      return res
        .status(401)
        .send({ message: "You have already submitted a review" });
    }
    // console.log("req.bodyyyyyyyyyyyy 36");
    const review = {
      name: req.body.name,
      // rating: Number(req.body.rating),
      rating: req.body.rating,
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      message: "Review Created",
      review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      // review: review,
    });
    const io = req.app.get("socketio");
    // io.emit("pong2", { updatedProduct, by: "mehdi-2" });
    io.emit("addProductReview", {
      productId: updatedProduct.id,
      review: review,
      // review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
    });
    // io.emit("addProductReview", { updatedProduct, by: "mehdi-2" });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

///////////////////////////////

// router.put(
//   "/gallery-images/:id",
//   uploadOptions.fields([
//     { name: "name", maxCount: 1 },
//     { name: "images", maxCount: 6 },
//   ]),
//   async (req, res) => {
//     console.log("req qqqqqqqqqqqqqqqqqqqqqqq");
//     console.log(req.body);
//     console.log(req.body.name);
//     if (!mongoose.isValidObjectId(req.params.id)) {
//       return res.status(400).send("Invalid Product Id");
//     }

//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(400).send("Invalid Product!");

//     const files = req.files;
//     let imagesPaths = [];
//     const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

//     if (files) {
//       files.map((file) => {
//         imagesPaths.push(`${basePath}${file.filename}`);
//       });
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       {
//         images: imagesPaths,
//       },
//       { new: true }
//     );

//     if (!updatedProduct)
//       return res.status(500).send("the gallery cannot be updated!");

//     res.send(product);
//   }
// );

/////////////////////////////

router.put(
  "/:id/updateproductafterselling",
  uploadOptions.none(),
  async (req, res) => {
    const productId2 = req.params.id;
    // console.log("req.bodyyyyyyyyyyyy estaaaaaaaaaaaa 20000");
    // console.log(productId2);

    const quantity2 = req.params;
    const qtyNew = req.body.qtty;

    // console.log("req.bodyyyyyyyyyyyy estaaaaaa2222222 3333333");
    // console.log(qtyNew);

    // console.log(req.params);
    // console.log("req.paramsssssssssss");
    const product = await Product.findById(productId2);

    if (product) {
      // console.log("req.mareeeeeeeeeeeeee");
      product.countInStock = product.countInStock - qtyNew;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: "produce modified",
        updatedProduct,
      });
      const io = req.app.get("socketio");
      // io.emit("pong", { updatedProduct, by: "mehdi" });
      io.emit("ponga", { updatedProduct });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  }
);

// Best Selling Products
router.put(
  "/:id/bestsellingproducts",
  uploadOptions.none(),
  async (req, res) => {
    const productId = req.params.id;
    console.log("req.bodyyyyyyyyyyyy");
    // console.log(req.body.name);
    // const obj = req.body.data.name;
    // console.log(req.body.toString());
    // console.log(obj);
    // console.log("nothing is sent to here through formData!");
    // console.log(req.params);
    // console.log("req.paramsssssssssss");
    const product = await Product.findById(productId);
    // console.log("ourrrrrrrr product is ");
    // console.log(product);

    if (product) {
      // if (product.reviews.find((x) => x.name === req.body.name)) {
      //   return res
      //     .status(400)
      //     .send({ message: "You have already submitted a review" });
      // }
      const bestSellingProduct = {
        name: req.body.name,
        // rating: Number(req.body.rating),
        rating: req.body.rating,
        // comment: req.body.comment,
      };
      product.bestSellingProducts.push(bestSellingProduct);
      // product.numReviews = product.bestSellingProducts.length;

      //   let myArray = [
      //     { id: 0, name: "Jhon" },
      //     { id: 1, name: "sara" },
      //     { id: 2, name: "pop" },
      //     { id: 3, name: "sara" }
      // ]

      const findUnique = new Set(
        product.bestSellingProducts.map((x) => {
          return x.name;
        })
      );

      if (findUnique.size < myArray.length) {
        console.log("duplicates found!");
      } else {
        console.log("Done!");
      }

      // const counts = {};
      // const sampleArray = ['a', 'a', 'b', 'c'];
      // sampleArray.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
      // console.log(counts)
      // product.rating =
      //   product.reviews.reduce((a, c) => c.rating + a, 0) /
      //   product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: "Bset Selling Product Created",
        // review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  }
);

module.exports = router;
