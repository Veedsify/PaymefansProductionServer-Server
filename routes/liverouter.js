const express = require("express");

const {
  LiveStreamController,
} = require("../controllers/live/livestream.controller");
const router = express.Router();

router.get("/stream/:stream_id", LiveStreamController.getStream);


// Catch-all 404 middleware
router.use((_, res) => {
  res.status(404).render("live/404", { title: "404 - Page Not Found" });
});
module.exports = router;
