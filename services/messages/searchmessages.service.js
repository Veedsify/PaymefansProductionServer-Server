const prismaQuery = require("../../utils/prisma");

const SearchMessageService = async (q, conversationId) => {
  try {
    if (!q || q.length == 0) {
      return { error: false, messages: [] };
    }

    const messages = await prismaQuery.messages.findMany({
      where: {
        conversationsId: conversationId,
        message: {
          contains: q,
        },
      },
    });

    return { error: false, messages };
  } catch (error) {
    return { error: true, messages: [] };
  }
};

module.exports = SearchMessageService;
