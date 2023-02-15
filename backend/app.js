// esta
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
// const errorHandler = require("./helpers/error-handler");

// const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

app.use(cors());

app.options("*", cors());

// Middleware
app.use(express.json());
app.use(morgan("tiny"));
// app.use(authJwt());
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

// module.exports.getIO = function () {
//   return io;
// };

// Routers
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const favsRoutes = require("./routes/favoriteCartRoutes");
const couponsRoutes = require("./routes/coupons");

const api = process.env.API_URL;

app.set("socketio", io);

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/favs`, favsRoutes);
app.use(`${api}/coupons`, couponsRoutes);

// Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // dbName: "eshop-database",
    dbName: "ecomerce-mobile-app",
  })
  .then(() => {
    console.log("Database Conection has been successful kaka ...");
  })
  .catch((err) => {
    console.log(err);
  });

// esta
io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected kak Fuad1!`);
  // const users = [];
  socket.on("ping", (data) => {
    console.log("🔥: ping", data);
    // socket.emit('pong', {data, by:'mehdi'});
  });

  io.emit("reconnection", { status: "reconnected" });
  // socket.connect();

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});
// io.on("connection", (socket) => {
//   console.log("connection kakaaaaaaaaaaaa socket :)");

//   socket.on("disconnect", () => {
//     const user = users.find((x) => x.socketId === socket.id);
//     if (user) {
//       user.online = false;
//       console.log("Offline", user.name);
//       const admin = users.find((x) => x.isAdmin && x.online);
//       if (admin) {
//         io.to(admin.socketId).emit("updateUser", user);
//       }
//     }
//   });
// });

// io.on("connection", (socket) => {
//   console.log(`User Connected: ${socket.id}`);

//   // socket.on("join_room", (data) => {
//   socket.on("products", (data) => {
//     socket.join(data);
//     console.log(`User with ID: ${socket.id} joined room: ${data}`);
//   });

//   // socket.on("join_room", (data) => {
//   // socket.on("productOrdered", (data) => {
//   //   socket.join(data);
//   //   socket.join("data AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
//   //   // console.log(`User with ID: ${socket.id} joined room: ${data}`);
//   // });

//   // socket.on("send_message", (data) => {
//   //   // console.log(data);
//   //   // socket.to(data.room).emit("receive_message", data);
//   //   // socket.to("products").emit("productUpdate", data);
//   //   let message = { productid: product.id, qty: product.qty };
//   //   socket.to("products").emit("productUpdate", message);
//   // });

//   // socket.on("productUpdate", (data) => {
//   //   // console.log(data);
//   //   // socket.to(data.room).emit("receive_message", data);
//   //   // socket.to("products").emit("productUpdate", data);
//   //   let message = { productid: product.id, qty: product.qty };
//   //   socket.to("products").emit("productUpdate", message);
//   // });

//   socket.on("disconnect", () => {
//     console.log("User Disconnected", socket.id);
//   });
// });
const port = process.env.PORT || 3000;
// 2
// server.listen(3000, () => {
httpServer.listen(port || 3000, () => {
  // console.log("NEW serever is up and runing on here http://localhost:3000");
  console.log(`Server at http://localhost:${port}`);
});
// esta
// app.listen(3000, () => {
//   console.log("serever is up and runing on http://localhost:3000");
// });
