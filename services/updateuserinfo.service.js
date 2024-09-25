const prismaQuery = require("../utils/prisma");

module.exports = async ({ name, location, bio, website, email }, req) => {
  try {
    const checkEmail = await prismaQuery.user.findUnique({
      where: {
        email: email,
      },
    });
    if (checkEmail && checkEmail.user_id !== req.user.user_id) {
      return false;
    }
    const updateUser = await prismaQuery.user.update({
      where: {
        user_id: req.user.user_id,
      },
      data: {
        name: name,
        location: location,
        bio: bio,
        email: email,
        website: website,
      },
    });
    prismaQuery.$disconnect();
    return !!updateUser;

  } catch (err) {
    console.log(err);
    return false;
  }
};
