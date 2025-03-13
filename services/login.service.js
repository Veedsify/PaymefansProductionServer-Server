const passwordHasher = require("../utils/passwordHasher");
const bcrypt = require("bcrypt");
const jwt = require("../utils/jsonwebtoken");
const prismaQuery = require("../utils/prisma");
const { error } = require("console");

module.exports = async (data) => {

  if (!data) return { error: true, message: "Invalid request", status: false };

  const email = data.email;
  const userpassword = data.password;


  if (!email || !userpassword) {
    return { error: true, message: "Email and password are required", status: false };
  }

  const user = await prismaQuery.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!user) {
    return { error: true, message: "Invalid email or password", status: false };
  }

  const match = await bcrypt.compare(userpassword, user.password);

  console.log(match)

  if (!match) {
    return { error: true, message: "Invalid email or password", status: false };
  }

  const { password, ...rest } = user;
  return { token: await jwt(rest), status: true, user: rest };
};
