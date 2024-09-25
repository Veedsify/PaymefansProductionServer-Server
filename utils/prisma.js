const { PrismaClient } = require("@prisma/client");

const prismaQuery = new PrismaClient();

module.exports = prismaQuery;
