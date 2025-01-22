const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./Utils/messages.js");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./Utils/users.js");
const app = express();
const server = http.createServer(app); //expicityly created server and paased express to use that in websocket.i9o
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");
const io = socketio(server);

app.get("/health", (req, res) => {
  res.send(200).json({
    message: "Health Check Looks Good -v1",
  });
});

//console.log(publicDirectoryPath)
app.use(express.static(publicDirectoryPath));
/*
//Connection will fire when a socket.io gets a new connection
let count =0


io.on('connection',(socket)=>{//socket is an obj having info about new connection
                              //So it can be used to communicate with that specific client
                             // This function will run for each connection we have connected with server
    count=0
   // console.log(socket)
    socket.emit('countUpdated',(count))
    socket.on('increment',()=>{
        count+=1
        //socket.emit('countUpdated',count)//emits the evenmt only to a partticular connection assoc with socket
        io.emit('countUpdated',count)//emits the events with all the connectio0n existing in real time 
    })

}) 


*/

io.on("connection", (socket) => {
  console.log("Connection Established with client");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username,
      room,
    });

    if (error) {
      console.log(error);
      return callback(error);
    }
    //   console.log(user)

    socket.join(user.room); //join is predefined  allows us to join a chgat roo
    // talking about emit specific to room we hjave io.to.emit and socket.broadcast.to.emit

    let Welcomemessage = `Welcome ${username}`;
    socket.emit("message", generateMessage(Welcomemessage));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("System", `${user.username} joined the room`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (userMessage, callback) => {
    const filter = new Filter();
    if (filter.isProfane(userMessage)) {
      return callback("Profanity is not allowed");
    }

    const { error, user } = getUser(socket.id);
    if (error) {
      console.log(error);
    } else {
      console.log(user);

      io.to(user.room).emit(
        "message",
        generateMessage(user.username, userMessage)
      );
      callback("Mesage Received!");
    }
  });

  socket.on("sendLocation", (geoLocation, callback) => {
    //  console.log(Object.keys(geoLocation).length)
    if (Object.keys(geoLocation).length !== 0) {
      const loc = `Location: ${geoLocation.latitude}, ${geoLocation.longitude}`;
      //   console.log(geoLocation)

      const { error, user } = getUser(socket.id);

      if (error) {
        console.log(error.error);
      } else {
        io.to(user.room).emit(
          "locationMessage",
          generateLocationMessage(
            user.username,
            `https://google.com/maps?query=${geoLocation.latitude},${geoLocation.longitude}`
          )
        );
      }

      callback("Location Received by server");
    } else {
      callback("No Valid Coordinated received");
    }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(user.username, `${user.username} has left the room`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("Server Started at port " + port);
});
