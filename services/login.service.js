const passwordHasher = require("../utils/passwordHasher");
const bcrypt = require("bcrypt");
const jwt = require("../utils/jsonwebtoken");
const prismaQuery = require("../utils/prisma");

module.exports = async ({ data }) => {

  const { email = null, password: userpassword = null } = data;

  if (!email || !userpassword) {
    return { error: "Email and password are required", status: false };
  }

  const user = await prismaQuery.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!user) {
    return { error: "Invalid email or password", status: false };
  }

  const match = bcrypt.compare(userpassword, user.password);

  if (!match) {
    return { error: "Invalid email or password", status: false };
  }

  const { password, ...rest } = user;
  return { token: await jwt(rest), status: true, user: rest };
};
