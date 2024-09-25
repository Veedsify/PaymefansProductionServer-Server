const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {


  try {
    if (!req.headers) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing", status: false });
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token found", status: false });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", status: false });
  }
};
