const prismaQuery = require("../../utils/prisma");
const Redis = require("ioredis");
const redis = new Redis(); // Default connection to localhost:6379
const { v4: uuid } = require("uuid");
const SearchMessageService = require("../../services/messages/searchmessages.service");

class ConversationsController {
  static async allConversations(req, res) {
    const conversation = req.params.conversation;
    const user = req.user;
    const redisKey = `user:${user.user_id}:conversations:${conversation}`;

    try {
      // Check if the conversation data is cached
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        return res.json({
          messages: parsedData.messages,
          receiver: parsedData.receiver,
        });
      }
      // Validate user's participation in the conversation
      const validateUserConversation =
        await prismaQuery.conversations.findFirst({
          where: {
            conversation_id: conversation,
            participants: {
              some: {
                OR: [
                  {
                    user_1: user.user_id,
                  },
                  {
                    user_2: user.user_id,
                  },
                ],
              },
            },
          },
          select: {
            id: true,
            conversation_id: true,
          },
        });

      console.log({
        conversation,
        user: user.user_id,
        cachedData,
        validateUserConversation,
      });

      if (!validateUserConversation) {
        return res.json({
          message: "Invalid conversation",
          status: false,
          invalid_conversation: true,
        });
      }

      // Fetch conversation details
      const data = await prismaQuery.conversations.findFirst({
        where: {
          conversation_id: conversation,
        },
        select: {
          messages: {
            orderBy: {
              created_at: "asc",
            },
          },
          participants: true,
        },
      });

      if (data) {
        // Determine the receiver
        const participants = data.participants.find((participant) =>
          participant.user_1 === user.user_id
            ? participant.user_2
            : participant.user_1
        );
        const receiverId =
          participants.user_1 === user.user_id
            ? participants.user_2
            : participants.user_1;

        // Fetch receiver data
        const receiverData = await prismaQuery.user.findFirst({
          where: {
            user_id: receiverId,
          },
          select: {
            id: true,
            user_id: true,
            name: true,
            username: true,
            profile_image: true,
            Settings: true,
          },
        });

        // Cache the result in Redis
        await redis.set(
          redisKey,
          JSON.stringify({
            messages: data.messages,
            receiver: receiverData,
          }),
          "EX",
          3600
        ); // Cache for 1 hour

        return res.json({ messages: data.messages, receiver: receiverData });
      }

      return res.json({ messages: [] });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      await prismaQuery.$disconnect(); // Ensure connection is closed
    }
  }

  static async createConversation(req, res) {
    try {
      const { userId, profileId } = req.body;
      const conversationId = uuid().split("-").join("");
      // Check if user has a conversation already
      const getConversation = await prismaQuery.conversations.findFirst({
        where: {
          OR: [
            {
              participants: {
                every: {
                  user_1: userId,
                  user_2: profileId,
                },
              },
            },
            {
              participants: {
                every: {
                  user_1: profileId,
                  user_2: userId,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          conversation_id: true,
        },
      });

      if (getConversation) {
        return res.json({
          message: "Conversation already exists",
          status: true,
          conversation_id: getConversation.conversation_id,
        });
      }

      // Create a new conversation
      const createConversation = await prismaQuery.conversations.create({
        data: {
          conversation_id: conversationId,
          participants: {
            create: {
              user_1: userId,
              user_2: profileId,
            },
          },
        },
      });

      if (createConversation) {
        return res.json({
          message: "Conversation created",
          status: true,
          conversation_id: conversationId,
        });
      }
      prismaQuery.$disconnect();
    } catch (error) {
      return res.json({ message: "An error occured", status: false });
    }
  }

  static async myConversations(req, res) {
    try {
      const user = req.user;
      const data = await prismaQuery.conversations.findMany({
        where: {
          OR: [
            {
              participants: {
                some: {
                  user_1: user.user_id,
                },
              },
            },
            {
              participants: {
                some: {
                  user_2: user.user_id,
                },
              },
            },
          ],
        },
        select: {
          conversation_id: true,
          participants: true,
          messages: {
            orderBy: {
              created_at: "desc",
            },
            take: 1, // Only fetch the latest message
          },
        },
      });

      if (data) {
        let conversations = [];
        for (let i = 0; i < data.length; i++) {
          let participants = data[i].participants.find((user) =>
            user.user_1 === req.user.user_id ? user.user_2 : user.user_1
          );
          const receiver =
            participants.user_1 === req.user.user_id
              ? participants.user_2
              : participants.user_1;

          const receiverData = await prismaQuery.user.findFirst({
            where: {
              user_id: receiver,
              OR: [
                {
                  Messages: {
                    some: {
                      sender_id: user.user_id,
                    },
                  },
                },
                {
                  Messages: {
                    some: {
                      receiver_id: user.user_id,
                    },
                  },
                },
              ],
            },
            select: {
              id: true,
              user_id: true,
              name: true,
              username: true,
              profile_image: true,
              // Settings: true,
              Messages: true,
            },
          });
          conversations.push({
            conversation: receiverData,
            conversation_id: data[i].conversation_id,
            lastMessage: data[i].messages[0] ? data[i].messages[0] : [],
            // Add the last message to each conversation
          });
        }

        // Sort the conversations by the timestamp of the last message
        conversations.sort((a, b) => {
          if (a.lastMessage.created_at > b.lastMessage.created_at) return -1;
          if (a.lastMessage.created_at < b.lastMessage.created_at) return 1;
          return 0;
        });

        return res.json({ conversations, status: true });
      }

      prismaQuery.$disconnect();
    } catch (err) {
      return res.json({ message: "An error occurred", status: false });
    }
  }

  static async SearchMessages(req, res) {
    const q = req.query.q;
    const handleSearchMessage = await SearchMessageService(
      q,
      req.params.conversationId
    );

    if (handleSearchMessage.error) {
      res
        .status(500)
        .json({
          status: false,
          message: "An Error Occured While Tryign to Search Message",
        });
    }

    res.json({
      status: true,
      message: "Messages Found",
      data: handleSearchMessage.messages,
    });
  }
}

module.exports = ConversationsController;
