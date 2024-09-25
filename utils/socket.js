const { Server } = require("socket.io");
const messagesSeenByReceiver = require("../libs/messages-seen-by-receiver");
const getUserConversations = require("../libs/get-user-conversations");
const { checkUserFollowing, followUser } = require("../libs/check-user-following");
const SaveMessageToDb = require("../libs/save-message-db");
const redis = require("../libs/redis-store");


const serverSocket = (http) => {
    const io = new Server(http, {
        cors: {
            origin: process.env.APP_URL,
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        let userRoom = "";
        let user = {};

        const getCachedConversations = async (userId) => {
            let conversations = await redis.get(`conversations:${userId}`);
            if (!conversations) {
                conversations = await getUserConversations(userId);
                redis.set(`conversations:${userId}`, JSON.stringify(conversations), "EX", 60);
            } else {
                conversations = JSON.parse(conversations);
            }
            return conversations;
        };

        const emitActiveUsers = async () => {
            const activeUsers = await redis.hgetall('activeUsers');
            io.emit("active_users", Object.values(activeUsers).map(JSON.parse));
        };
        emitActiveUsers();

        const interval = setInterval(() => {
            if (!user.userId) return;
            emitActiveUsers();
        }, 500);

        const handleMessage = async (data) => {
            const message = await SaveMessageToDb.saveMessage(data);
            if (message) {
                socket.to(userRoom).emit("message", {
                    ...data,
                    message_id: message.message_id,
                });
                //clear cached conversations
                const userMessageKey = `user:${user.userId}:conversations:${userRoom}`
                const receiverMessageKey = `user:${data.receiver_id}:conversations:${userRoom}`
                await redis.del(userMessageKey);
                await redis.del(receiverMessageKey);
                await redis.del(`conversations:${user.userId}`);
                await redis.del(`conversations:${data.receiver_id}`);
                const conversations = await getCachedConversations(user.userId)
                const receiverConversations = await getCachedConversations(data.receiver_id)
                socket.emit("conversations", conversations);
                socket.to(userRoom).emit("conversations", receiverConversations);
            } else {

                socket.emit("message-error", {
                    message: "An error occurred while saving the message",
                });
            }
        };

        const handleSeen = async (data) => {
            const lastMessageSeen = await messagesSeenByReceiver(data);
            if (lastMessageSeen.success) {
                socket.to(userRoom).emit("message-seen-updated", {
                    messageId: lastMessageSeen.data.message_id,
                    seen: true,
                });
                await redis.del(`conversations:${data.userId}`);
                await redis.del(`conversations:${data.receiver_id}`);
                const conversations = await getCachedConversations(data.userId)
                const receiverConversations = await getCachedConversations(data.receiver_id)
                socket.emit("conversations", conversations);
                socket.to(userRoom).emit("conversations", receiverConversations);
            }
        };

        const handleTyping = (data) => {
            socket.to(userRoom).emit("sender-typing", { value: data.value, sender_id: data.sender_id });
        };

        const checkFollowing = (data) => {
            checkUserFollowing(data.user_id, data.thisuser_id).then((response) => {
                socket.emit("isFollowing", {
                    status: response.status,
                    followID: response.followId || null,
                });
            });
        };

        const followThisUser = (data) => {
            followUser(data.user_id, data.profile_id, data.status, data.followId).then((response) => {
                socket.emit("followed", {
                    status: response.action === "followed",
                    followID: response.followUuid,
                });
            });
        };

        const handleUserActive = async (username) => {
            const userKey = `user:${username}`;
            const userData = {
                username,
                socket_id: socket.id,
            };

            await redis.hset('activeUsers', userKey, JSON.stringify(userData));
            emitActiveUsers();
        };

        const handleJoinRoom = async (data) => {
            userRoom = data;
            socket.join(userRoom);
            socket.to(userRoom).emit("joined", { message: "User Joined Room" });
            const conversations = await getCachedConversations(user.userId)
            socket.emit("conversations", conversations);
        }

        const handleUserConnected = async (data) => {
            user = {
                socketId: socket.id,
                username: data.username,
                userId: data.userId,
            };
            const conversations = await getCachedConversations(data.userId)
            socket.emit("conversations", conversations);
        }

        const handleUserInactive = async () => {
            const userKey = `user:${user.username}`;
            await redis.hdel('activeUsers', userKey);
            emitActiveUsers();
        }

        socket.on("user-connected", handleUserConnected);
        socket.on("join", handleJoinRoom);
        socket.on("new-message", handleMessage);
        socket.on("message-seen", handleSeen);
        socket.on("typing", handleTyping);
        socket.on("user_active", handleUserActive);
        socket.on("checkUserIsFollowing", checkFollowing);
        socket.on("followUser", followThisUser);
        // socket.on("inactive", handleUserInactive);

        socket.on("disconnect", async () => {
            clearInterval(interval);
            // invalidate conversations cache
            await redis.del(`conversations:${user.userId}`);
            await handleUserInactive();
        });
    });

    return io;
};

module.exports = serverSocket;
