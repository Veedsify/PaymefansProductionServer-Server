const prismaQuery = require("../utils/prisma");

module.exports = async (limit, thisUser) => {
  const models = await prismaQuery.$queryRaw`
  SELECT *
  FROM User
  INNER JOIN Model ON User.id = Model.user_id
  WHERE User.is_model = true
  AND User.id != ${thisUser.id}
  AND Model.verification_status = true
  ORDER BY RAND()
  LIMIT ${limit};
  `;

  const modelsWithoutPassword = models.map(({ password, ...rest }) => rest);
  return modelsWithoutPassword;
};
