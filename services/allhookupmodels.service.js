const prismaQuery = require("../utils/prisma");

module.exports = async (limit, thisUser) => {
  const models = await prismaQuery.user.findMany({
    where: {
      Model: {
        verification_status: true,
        hookup: true
      },
      NOT: {
        id: thisUser.id
      }
    },
    take: limit,
    select: {
      id: true,
      username: true,
      fullname: true,
      profile_image: true,
      profile_banner: true,
      is_model: true,
      Settings: {
        select: {
          price_per_message: true,
          subscription_price: true,
        }
      },
      Model: {
        select: {
          hookup: true,
        }
      }
    },
    orderBy: {
      id: "desc"
    },
  });
  const modelsWithoutPassword = models.map(({ password, ...rest }) => rest);
  return modelsWithoutPassword;
};
