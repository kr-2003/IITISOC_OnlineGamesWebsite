var socket = io();

init();
function init() {
  console.log("helloeeee");
  socket.emit("join", "hellowwwwww");
}
