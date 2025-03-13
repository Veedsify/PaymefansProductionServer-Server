const SaveMessageToDb = require("../../libs/save-message-db");
const messagesSeenByReceiver = require("../../libs/messages-seen-by-receiver");
const { checkUserFollowing, followUser } = require("../../libs/check-user-following");
const handleIncomingStream = require("../../livestream-socket/handle-incoming-stream");
const getUserConversations = require("../../libs/get-user-conversations");
const fs = require('fs');

const SocketFunctions = (io, socket, activeUsers, room, users) => {
    // Event handler for receiving new messages
    const handleMessage = async (data) => {
        // Save messages here if needed
        console.log({...data})
        const message = await SaveMessageToDb.saveMessage(data);
        if (message) {
            socket.to(room).emit("message", {
                ...data,
                message_id: message.message_id,
            });
            getUserConversations(users.userId).then((data) => {
                socket.emit("conversations", data);
            });
            getUserConversations(data.receiver_id).then((data) => {
                socket.to(room).emit("conversations", data);
            });
        } else {
            socket.emit("message-error", {
                message: "An error occurred while saving message",
            });
        }
    };

    // Event handler for marking messages as seen
    const handleSeen = async (data) => {
        const lastMessageSeen = await messagesSeenByReceiver(data);
        if (lastMessageSeen.success) {
            socket
                .to(room)
                .emit("message-seen-updated", {
                    messageId: lastMessageSeen.data.message_id,
                    seen: true,
                });
        }
    };

    // Event handler for typing indication
    const handleTyping = (data) => {
        socket.to(room).emit("sender-typing", { value: data.value, sender_id: data.sender_id });
    };

    const checkFollowing = (data) => {
        checkUserFollowing(data.user_id, data.thisuser_id).then((response) => {
            socket.emit("isFollowing", {
                status: response.status,
                followID: response.followId ? response.followId : null,
            });
        });
    }

    const followThisUser = (data) => {
        followUser(data.user_id, data.profile_id, data.status, data.followId).then((response) => {
            socket.emit("followed", {
                status: response.action == 'followed' ? true : false,
                followID: response.followUuid
            });
        });
    }


    const handleUserActive = (userid) => {
        if (activeUsers.some((user) => user.userid === userid)) {
            socket.broadcast.emit('active_users', activeUsers);
        } else {
            activeUsers.push({
                userid,
                socket_id: socket.id
            });
            socket.broadcast.emit('active_users', activeUsers); // Broadcast updated list
        }
    }


    // Event handler to check if user is following
    socket.on("checkUserIsFollowing", checkFollowing);

    // Event to follow a user
    socket.on("followUser", followThisUser);

    // Event handler for joining a room
    socket.on("join", (data) => {
        room = data;
        socket.join(data);
        socket.to(room).emit("joined", { message: "User Joined Room" });
        getUserConversations(users.userId).then((data) => {
            socket.emit("conversations", data);
        });
    });

    // Event handler for joining a room
    socket.on("user-connected", (data) => {
        users = {
            socketId: socket.id,
            userId: data.userId
        };
        getUserConversations(data.userId).then((data) => {
            socket.emit("conversations", data);
        });
    });

    // Listen for new messages
    socket.on("new-message", handleMessage);

    // Listen for messages seen
    socket.on("message-seen", handleSeen);

    // Listen for typing indication
    socket.on("typing", handleTyping);

    // Handle User is Active
    socket.on('user_active', handleUserActive)

    socket.on('inactive', (data) => {
        if(activeUsers.some(user => user.socket_id === socket.id)){
            socket.broadcast.emit('active_users', activeUsers)
        }else{
            activeUsers = activeUsers.filter(user => user.socket_id !== socket.id)
            socket.broadcast.emit('active_users', activeUsers)
        }
    })

    // LiveStreamInput
    socket.on('live', handleIncomingStream);


    return socket
}

module.exports = SocketFunctions