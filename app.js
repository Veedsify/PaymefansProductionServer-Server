var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var adminRouter = require("./routes/admin");
var verificationRouter = require("./routes/verification");
var session = require("express-session");
const { SESSION_SECRET } = process.env;
var app = express();
var debug = require("debug")("express-server:server");
const http = require("http").createServer(app);
const serverSocket = require("./utils/socket");
const LiveServerSocket = require("./utils/socket-live");
app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(
  session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


// Socket
serverSocket(http);
LiveServerSocket(http);
//Routes
app.use("/", indexRouter);
app.use("/api", apiRouter);
app.use("/admin", adminRouter);
app.use("/verification", verificationRouter);

// catch 404 and forward to error handler`
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
http.listen(process.env.PORT, () => { });
http.on("error", onError);
http.on("listening", onListening);
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }
  const port = process.env.PORT;
  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = http.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
// module.exports = app;
