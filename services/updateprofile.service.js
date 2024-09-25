const prismaQuery = require("../utils/prisma");

module.exports = async (path, req) => {
  try {
    const updateUser = await prismaQuery.user.update({
      where: {
        user_id: req.user.user_id,
      },
      data: {
        profile_image: path,
      },
    });
    prismaQuery.$disconnect();
    if (updateUser) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};
