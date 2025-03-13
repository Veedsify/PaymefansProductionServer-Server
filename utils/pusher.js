const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1906466",
  key: "c057d20025f341e583c4",
  secret: "6057d5fe2db52eaed457",
  cluster: "eu",
  useTLS: true
});


module.exports = pusher;