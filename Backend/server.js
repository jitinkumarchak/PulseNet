const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const { prototype } = require("events");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

//socket setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//middleware
app.use(cors());
app.use(express.json());

//socket connection
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User Disconnected : ", socket.id);
  });

  socket.on("joinHospital", (hospitalId) => {
    socket.join(hospitalId);
    console.log("Hospital joined room:", hospitalId);
  });
});

//make io accessible globally
app.set("io", io);

//Db connection

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDb Connected"))
  .catch((err) => console.log(err));

//test route
app.get("/", (req, res) => {
  res.send("Pulsenet API Running");
});

//Routes
const hospitalRoutes = require("./routes/hospitalRoutes");
app.use("/api/hospital", hospitalRoutes);

const requestRoutes = require("./routes/requestRoutes");
app.use("/api/request", requestRoutes);

//start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
