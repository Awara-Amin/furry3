// esta

// const SocketIO = require("socket.io");
const express = require("express");
const app = express();
// const http = require("http");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");

// const server = http.Server(app);

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

// Routers
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const favsRoutes = require("./routes/favoriteCartRoutes");
const couponsRoutes = require("./routes/coupons");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/favs`, favsRoutes);
app.use(`${api}/coupons`, couponsRoutes);

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

// const users = [];

io.on("connection", (socket) => {
  console.log("connection kakaaaaaaaaaaaa socket :)");

  socket.on("disconnect", () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      user.online = false;
      console.log("Offline", user.name);
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit("updateUser", user);
      }
    }
  });

  // the second event
  // socket.on("onLogin", (user) => {
  //   const updatedUser = {
  //     ...user,
  //     online: true,
  //     socketId: socket.id,
  //     messages: [],
  //   };
  //   const existUser = users.find((x) => x._id === updatedUser._id);
  //   if (existUser) {
  //     existUser.socketId = socket.id;
  //     existUser.online = true;
  //   } else {
  //     users.push(updatedUser);
  //   }
  //   console.log("Online", user.name);
  //   const admin = users.find((x) => x.isAdmin && x.online);
  //   if (admin) {
  //     io.to(admin.socketId).emit("updateUser", updatedUser);
  //   }
  //   if (updatedUser.isAdmin) {
  //     io.to(updatedUser.socketId).emit("listUsers", users);
  //   }
  // });

  //  the next event is
  // socket.on("onUserSelected", (user) => {
  //   const admin = users.find((x) => x.isAdmin && x.online);
  //   if (admin) {
  //     const existUser = users.find((x) => x._id === user._id);
  //     io.to(admin.socketId).emit("selectUser", existUser);
  //   }
  // });

  // another event
  // socket.on("onMessage", (message) => {
  //   if (message.isAdmin) {
  //     const user = users.find((x) => x._id === message._id && x.online);
  //     if (user) {
  //       io.to(user.socketId).emit("message", message);
  //       user.messages.push(message);
  //     }
  //   } else {
  //     const admin = users.find((x) => x.isAdmin && x.online);
  //     if (admin) {
  //       io.to(admin.socketId).emit("message", message);
  //       const user = users.find((x) => x._id === message._id && x.online);
  //       user.messages.push(message);
  //     } else {
  //       io.to(socket.id).emit("message", {
  //         name: "Admin",
  //         body: "Sorry. I am not online right now",
  //       });
  //     }
  //   }
  // });
});
server.listen(3000, () => {
  console.log("serever is up and runing on here http://localhost:3000");
});
// esta
// app.listen(3000, () => {
//   console.log("serever is up and runing on http://localhost:3000");
// });
