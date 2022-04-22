import http from "http";
import { Server } from "socket.io";
import express from "express";

const port = 3000;
const app = express();

function handleListen() {
  console.log("now listening to localhost port 3000");
}

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

var arry = [];

function nicknames(roomName, nickname) {
  arry.push([roomName, nickname]);
  return arry;
}

function roomie(roomName) {
  let nickArry = [];
  arry.forEach((room) => {
    if (room[0] == roomName) {
      nickArry.push(room[1]);
    }
  });
  return nickArry;
}
function deleteNickname(nickname) {
  for (let i = 0; i < arry.length; i++) {
    if (arry[i][1] === nickname) {
      arry.splice(i, 1);
      break;
    }
  }
}
wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  wsServer.sockets.emit("room_change", publicRooms());

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();

    socket.to(roomName).emit("welcome", socket.nickname);
    socket.emit("welcomemyself", socket.nickname);

    nicknames(roomName, socket.nickname);
    socket.to(roomName).emit("comein", roomie(roomName));
    socket.emit("comein", roomie(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("msgfromServer", `${socket.nickname} : ${msg}`);
    done();
  });

  socket.on("disconnecting", () => {
    deleteNickname(socket.nickname);

    socket.rooms.forEach((room) => {
      socket.to(room).emit("leavin", socket.nickname);
      socket.to(room).emit("comein", roomie(room));
    });
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("nickname", (nickname, roomName) => {
    if (socket.nickname == "Anonymous") {
      deleteNickname("Anonymous");
      socket["nickname"] = nickname;
    } else {
      deleteNickname(socket.nickname);
      socket["nickname"] = nickname;
    }
    nicknames(roomName, nickname);
    console.log(arry, roomie(roomName));
    socket.to(roomName).emit("comein", roomie(roomName));
    socket.emit("comein", roomie(roomName));
    socket.to(roomName).emit("welcome", nickname);
  });

  socket.on("leave", (roomName) => {
    deleteNickname(socket.nickname);
    socket.rooms.forEach(() => {
      socket.to(roomName).emit("comein", roomie(roomName));
    });
    socket.leave(roomName);
    socket["nickname"] = "Anonymous";
    wsServer.sockets.emit("room_change", publicRooms());
  });
});

httpServer.listen(port, handleListen);
