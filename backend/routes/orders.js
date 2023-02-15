const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();
const { OrderItem } = require("../models/order-item");
const { User } = require("../models/user");

router.get(`/`, async (req, res) => {
  // const orderList = await Order.find().populate("user");
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    // .populate({ path: "orderItems", populate: "product" });
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post("/", async (req, res) => {
  // console.log(" RRRRRRRRRRRRRRR order222RRRRRRRRRRRRRRRRRRRRR-0");
  // console.log(req.body);
  // console.log(req.body.order);
  // console.log(req.body.discountToBackend);
  const orderItemsIds = Promise.all(
    // req.body.orderItems.cartItems.map(async (orderItem) => {
    req.body.order.orderItems.cartItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
        // user: orderItem.user,
      });
      // console.log(" RRRRRRRRRRRRRRR order222RRRRRRRRRRRRRRRRRRRRR-1000");
      // console.log(orderItem.product._id);
      // let message = {
      //   productid: orderItem.product._id,
      //   qty: orderItem.quantity,
      // };
      // socket.to("products").emit("productUpdate", message);
      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;
  // console.log(orderItemsIdsResolved);

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  // console.log("totalPrices order22222222222222RRRRRRRRR-1");
  // console.log(totalPrices);
  // console.log("totalPrices order222222222222222222222222222222");
  // const orderTwo = req.body.order.user;
  // const orderThree = req;
  // console.log(orderTwo);
  // console.log(orderThree);

  // const user = await User.findById(req.body.user);
  // console.log("wtaht is user kaka tttttttttttttttttttt TTTTTTTT-1");
  // console.log(user);
  // console.log(user.seenNotifications);
  // console.log(user.seenNotifications.type);
  // if (user.seenNotifications.length !== 0) {
  // const discountRate = user.seenNotifications[0].type;
  // console.log("wtaht is user kaka tttttttttttttttttttt TTTTTTTT-2");
  // console.log(discountRate);
  const discount = totalPrice - req.body.discountToBackend;
  // console.log("wtaht is user kaka tttttttttttttttttttt RRRRRRRR-2");
  // console.log(discount);

  // let message = { productid: product.id, qty: product.qty };
  // socket.to("products").emit("productUpdate", message);
  // const discountRate = user.seenNotifications.type;
  // console.log("wtaht is user kaka tttttttttttttttttttt TTTTTTTT");
  // console.log(discountRate);
  // if (!coupon) return res.status(400).send("Invalid Coupon shekh!");

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.order.shippingAddress1,
    shippingAddress2: req.body.order.ordershippingAddress2,
    city: req.body.order.city,
    zip: req.body.order.zip,
    country: req.body.order.country,
    phone: req.body.order.phone,
    status: req.body.order.status,
    // totalPrice: req.body.totalPrice,
    totalPrice: totalPrice,
    user: req.body.order.user,
    couponDiscountAmount: discount,
  });

  order = await order.save();
  if (!order) return res.status(404).send("the order can not be created");

  res.send(order);
  // }
  // if (user.seenNotifications.length === 0) {
  // const discountRate = user.seenNotifications[0].type;
  // console.log("wtaht is user kaka tttttttttttttttttttt TTTTTTTT-2");
  // console.log(discountRate);
  // const discount = (discountRate / totalPrice) * 100;
  // console.log("wtaht is user kaka tttttttttttttttttttt TTTTTTTT-3");
  // console.log(discount);

  // const discountRate = user.seenNotifications.type;
  // console.log("wtaht is user kaka tttttttttttttttttttt TTTTTTTT");
  // console.log(discountRate);
  // if (!coupon) return res.status(400).send("Invalid Coupon shekh!");

  // let order = new Order({
  //   orderItems: orderItemsIdsResolved,
  //   shippingAddress1: req.body.shippingAddress1,
  //   shippingAddress2: req.body.shippingAddress2,
  //   city: req.body.city,
  //   zip: req.body.zip,
  //   country: req.body.country,
  //   phone: req.body.phone,
  //   status: req.body.status,
  //   // totalPrice: req.body.totalPrice,
  //   totalPrice: totalPrice,
  //   user: req.body.user,
  //   // couponDiscountPrice: discount,
  // });

  // order = await order.save();
  // if (!order) return res.status(404).send("the order can not be created");

  // res.send(order);
  // }
});

router.put("/:id", async (req, res) => {
  // console.log("wtaht is user kaka tttttttttttttttttttt TTTTTTTT-2");
  // console.log(req);
  const orderId = req.params.id;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) return res.status(404).send("the order can not be created");
  res.send(order);
  const io = req.app.get("socketio");
  // io.emit("pong2", { updatedProduct, by: "mehdi-2" });
  io.emit("changeStatus", {
    // productId: updatedProduct.id,
    order,
    orderId,
    // review: review,
    // review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
  });
  // io.emit("addProductReview", { updatedProduct, by: "mehdi-2" });
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalsales: totalSales.pop().totalsales });
});

router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments((count) => count);

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    orderCount: orderCount,
  });
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

// Fuad for order details inside order part at admin side
router.get("/inside-myorder/:id", async (req, res) => {
  try {
    const orderDetail = await (
      await Order.findById(req.params.id)
    ).populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });
    res.status(200).send({
      message: "Order fetched successfully",
      success: true,
      data: orderDetail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching order",
      success: false,
      error,
    });
  }
});

module.exports = router;
