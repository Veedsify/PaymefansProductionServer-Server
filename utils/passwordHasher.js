// const { createHash } = require("crypto");
const bcrypt = require("bcrypt");

const hashPass = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// hashPass('password').then((hash) => {
//   console.log(hash);
// });

module.exports = async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};
