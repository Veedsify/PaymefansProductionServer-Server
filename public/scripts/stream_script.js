const socket = io();
let count = 0;

socket.emit("connect-stream", {
  userId: userId,
  streamId: streamId,
});

socket.on("stream-connected", (data) => {
  count = data.count;
  $('[data-attr="views"]').html(data.count);
});
