let jwt = require("jsonwebtoken");
let { JWT_SECRET, TOKEN_EXPIRATION } = process.env;
module.exports = async (data) => {
  return jwt.sign(data, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};
