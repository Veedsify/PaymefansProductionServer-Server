const prismaQuery = require("../utils/prisma");

module.exports = async function getUserConversations(userId) {
    try {
        console.log("userId", userId);
        const data = await prismaQuery.conversations.findMany({
            where: {
                OR: [
                    {
                        participants: {
                            some: {
                                user_1: userId
                            }
                        }
                    },
                    {
                        participants: {
                            some: {
                                user_2: userId
                            }
                        }
                    }
                ]
            },
            select: {
                conversation_id: true,
                participants: true,
                messages: {
                    orderBy: {
                        created_at: "desc"
                    },
                    take: 1 // Only fetch the latest message
                }
            }
        });

        if (data) {
            let conversations = [];
            for (let i = 0; i < data.length; i++) {
                let participants = data[i].participants.find(user => user.user_1 === userId ? user.user_2 : user.user_1);
                const receiver = participants.user_1 === userId ? participants.user_2 : participants.user_1;

                const messagerReceiver = await prismaQuery.user.findFirst({
                    where: {
                        user_id: receiver
                    },
                    select: {
                        id: true,
                        user_id: true,
                        name: true,
                        username: true,
                        profile_image: true,
                    }
                });


                const receiverData = await prismaQuery.user.findFirst({
                    where: {
                        user_id: receiver,
                        OR: [
                            {
                                Messages: {
                                    some: {
                                        sender_id: userId
                                    }
                                }
                            },
                            {
                                Messages: {
                                    some: {
                                        receiver_id: userId
                                    }
                                }
                            }
                        ]
                    },
                    select: {
                        id: true,
                        user_id: true,
                        name: true,
                        username: true,
                        profile_image: true,
                        // Settings: true,
                        Messages: true
                    }
                });
                conversations.push({
                    conversation: receiverData,
                    conversation_id: data[i].conversation_id,
                    lastMessage: data[i].messages[0] ? data[i].messages[0] : [],
                    // Add the last message to each conversation
                    receiver: messagerReceiver
                });
            }

            // Sort the conversations by the timestamp of the last message
            conversations.sort((a, b) => {
                if (a.lastMessage.created_at > b.lastMessage.created_at) return -1;
                if (a.lastMessage.created_at < b.lastMessage.created_at) return 1;
                return 0;
            });

            return { conversations, status: true }
        }

        prismaQuery.$disconnect();
    } catch (err) {
        return { message: "An error occurred", status: false, err: err.message }
    }
}

