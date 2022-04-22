const socket = io();

const welcome = document.getElementById("welcomePage");
const welcomeForm = welcome.querySelector("#welcomeForm");

const chatRoom = document.getElementById("chatRoom");

const roomwhere = chatRoom.querySelector("h2");

const messageForm = chatRoom.querySelector("#messagesForm");
const messageList = chatRoom.querySelector("#messageList");
const messagesContainer = chatRoom.querySelector("#messagesContainer");

const nicknameForm = chatRoom.querySelector("#nicknameForm");
const whoyouare = document.querySelector("#whoyouare");

const roomList = document.getElementById("roomList");

const leaveButton = chatRoom.querySelector("#leaveButton");
const participants = chatRoom.querySelector("#participants");
const particiContainer = chatRoom.querySelector("#particiContainer");

function scrollTop() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

let roomName;

/*hide the welcomeForm and go to the chatRoom*/
function showRoom() {
  welcome.classList.add("hidden");
  chatRoom.classList.remove("hidden");
  roomwhere.innerText = `You are in Room ${roomName}`;
}

function addingMessage(msg) {
  const li = document.createElement("li");
  li.innerText = msg;
  messageList.append(li);
}

function addingParticipants(participant) {
  const li = document.createElement("li");
  li.innerText = participant;
  participants.append(li);
}

/*when welcomeForm is submitted*/
function handlewelcomeSubmit(event) {
  event.preventDefault();
  const welcomeinput = welcomeForm.querySelector("input");
  socket.emit("enter_room", welcomeinput.value, showRoom);
  roomName = welcomeinput.value;
  welcomeinput.value = "";
}

function handlemessageSubmit(event) {
  scrollTop();
  event.preventDefault();
  const messageinput = messageForm.querySelector("input");
  const value = messageinput.value;
  socket.emit("new_message", messageinput.value, roomName, () => {
    addingMessage(`You : ${value}`);
  });
  messageinput.value = "";
}

function handlenicknameSubmit(event) {
  event.preventDefault();
  const nicknameinput = nicknameForm.querySelector("input");
  const value = nicknameinput.value;
  whoyouare.innerHTML = `Now chatting as ${value}👋`;
  addingParticipants(value);
  socket.emit("nickname", value, roomName);
  nicknameinput.value = "";
  particiContainer.scrollTop = particiContainer.scrollHeight;
}

function handleLeaveButton(event) {
  event.preventDefault();
  welcome.classList.remove("hidden");
  chatRoom.classList.add("hidden");
  messageList.innerText = "";
  socket.emit("leave", roomName);
}

socket.on("msgfromServer", (msg) => {
  addingMessage(msg);
});
socket.on("comein", (arry) => {
  participants.innerHTML = "";
  for (i = 0; i < arry.length; i++) {
    const li = document.createElement("li");
    li.innerText = arry[i];
    participants.append(li);
  }
});
socket.on("welcome", (nickname) => {
  addingMessage(`${nickname} is here!👏`);
});
socket.on("welcomemyself", (nickname) => {
  whoyouare.innerHTML = `Now chatting as ${nickname}👋`;
});
socket.on("leavin", (nickname) => {
  addingMessage(`${nickname} left!😲`);
});
socket.on("room_change", (rooms) => {
  roomList.innerHTML = "";
  for (i = 0; i < rooms.length; i++) {
    const li = document.createElement("li");
    li.style.listStyle = "square";
    li.innerText = rooms[i];
    roomList.append(li);
  }
});

welcomeForm.addEventListener("submit", handlewelcomeSubmit);
messageForm.addEventListener("submit", handlemessageSubmit);
nicknameForm.addEventListener("submit", handlenicknameSubmit);
leaveButton.addEventListener("click", handleLeaveButton);
