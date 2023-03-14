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
// //////////////////////////////////////////////////////////////////////////
const users = [];
// Routers
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const favsRoutes = require("./routes/favoriteCartRoutes");
const couponsRoutes = require("./routes/coupons");
const conversationsRoutes = require("./routes/conversations");
const messagesRoutes = require("./routes/messages");

const api = process.env.API_URL;

app.set("socketio", io);

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/favs`, favsRoutes);
app.use(`${api}/coupons`, couponsRoutes);
app.use(`${api}/conversations`, conversationsRoutes);
app.use(`${api}/messages`, messagesRoutes);

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
    console.log("what is socket.id kaka aaaaaaaaa4", socket.id);
    // only normal user, admin nagrtawa.     this (socket.id) comes from connection function
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      console.log("offline kakaaaaaaaaaaaaa aaaaaa1", user);
      console.log("offline kakaaaaaaaaaaaaa aaaaaa1", user._id);
      // kaka this user is made of these {
      //   _id: '63dcb9a90ae23ebfed1dd3a4',
      //   isAdmin: false,
      //   online: true,
      //   socketId: 'S5MoxIO4p3v3KcePAAAo',
      //   message: []
      // }
      user.online = false;
      // console.log("offline kakaaaaaaaaaaaaa aaaaaa2", user.name);
      console.log("offline kakaaaaaaaaaaaaa aaaaaa2", user._id);

      //                            if user is admin and admin is online?
      const admin = users.find((x) => x.isAdmin && x.online);
      console.log("let see if user is admin a aaaaaaaaa5", admin);

      if (admin) {
        console.log("let see if user is admin a aaaaaaaaa6");
        //  if user was online, show this user's info to admin
        io.to(admin.socketId).emit("updateUser", user);
      }
    }
  });

  // this is run when we have a new user in the admin chat screen
  socket.on("onLogin", (user) => {
    console.log("inside onLogin kaka 3001");
    console.log(user);
    console.log("inside onLogin kaka 3002");
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    };
    console.log("inside onLogin kaka 3003");
    console.log(updatedUser);

    // lets check in the users array, if we have a user is qual to updatedUser
    const existUser = users.find((x) => x.id === updatedUser._id);
    if (existUser) {
      existUser.socketId = socket.id;
      existUser.online = true;
    } else {
      users.push(updatedUser);
    }
    // console.log("Online user kakakakakakakakak 77", user.name);
    console.log("Online user kakakakakakakakak 77", user._id);

    // now check if admin is online
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      io.to(admin.socketId).emit("updateUser", updatedUser);
    }
    if (updatedUser.isAdmin) {
      io.to(updatedUser.socketId).emit("listUsers", users);
    }
  });

  // ////////
  // this is emit ed by admin
  socket.on("onUserSelected", (user) => {
    // get the admin fiest and make sure admin is online
    // const admin = users.find((x) => x.isAdmin && x.online);
    // 55
    const admin = users.find((x) => x.isAdmin && x.online);
    //  of user is admin online do this
    if (admin) {
      // get the current user
      const existUser = users.find((x) => x._id === user._id);
      io.to(admin.socketId).emit("selectUser", existUser);
    }
  });

  //
  // this trigers when a new message enter by admin or user.
  socket.on("onMessage", (message) => {
    // check if the message is admin
    if (message.isAdmin) {
      // based on id we check the reciever of the  message
      // 33
      // const user = users.find((x) => x._id === message._id && x.online);
      const user = users.find((x) => x._id === message._id && x.online);
      // if the reciever is online?
      if (user) {
        // send the message to the user by user.socketId
        io.to(user.socketId).emit("message", message);
        // they push the message into the message array
        user.messages.push(message);
      }

      // this time user is not admin, it is a regular user
    } else {
      // first find the admin user, so if user admin is online do this
      // 22
      const admin = users.find((x) => x.isAdmin && x.online);
      // const admin = users.find((x) => x.isAdmin);
      if (admin) {
        io.to(admin.socketId).emit("message", message);
        // 33
        const user = users.find((x) => x._id === message._id && x.online);
        // const user = users.find((x) => x._id === message._id);
        user.messages.push(message);
      }
      // 11
      else {
        io.to(socket.id).emit("message", {
          name: "Admin",
          body: "Sorry. I am not online right now",
        });
      }
    }
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
