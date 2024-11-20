const { Server } = require("socket.io");
const messagesSeenByReceiver = require("../libs/messages-seen-by-receiver");
const getUserConversations = require("../libs/get-user-conversations");
const { checkUserFollowing, followUser } = require("../libs/check-user-following");
const SaveMessageToDb = require("../libs/save-message-db");
// const handleIncomingStream = require("../livestream-socket/handle-incoming-stream");
// const SocketFunctions = require('./socket/socket-functions');
// const LiveSocketFunctions = require('./socket/socket-live-functions');
const { ADMIN_PANEL_URL, VERIFICATION_URL, APP_URL } = process.env;

const LiveServerSocket = (http) => {
    const io = new Server(http, {
        cors: {
            origin: [VERIFICATION_URL, ADMIN_PANEL_URL, APP_URL],
            methods: ["GET", "POST"],
        },
        path: "/live/socket.io"
    });

    let liveUsers = [];

    io.on("connection", (socket) => {
        let liveRoom = "";
        // console.log("Live Socket Id", socket.id);
        let streamConnectedUsers = [];
        let user = {};

        const handleLiveStreamJoin = (data) => {
            liveRoom = data.streamId;
            socket.join(liveRoom);

            if (!liveUsers.some((u) => u.userId === data.userId)) {
                liveUsers.push({
                    userId: data.userId,
                    socket_id: socket.id,
                });
                socket.emit("stream-connected", { liveUsers, count: liveUsers.length });
            } else {
                liveUsers = liveUsers.map((u) =>
                    u.userId === data.userId
                        ? { userId: data.userId, socket_id: socket.id }
                        : u
                );
            }

            io.to(liveRoom).emit("stream-connected", { liveUsers, count: liveUsers.length });
        };

        const handleDisconnectStream = () => {
            liveUsers = liveUsers.filter((u) => u.socket_id !== socket.id);
            io.to(liveRoom).emit("stream-connected", { liveUsers, count: liveUsers.length });
        };

        socket.on("connect-stream", handleLiveStreamJoin);
        socket.on("disconnect-stream", handleDisconnectStream);

        socket.on("disconnect", () => {
            io.emit("live_users", liveUsers);
        });

        return io;
    });
}
module.exports = LiveServerSocket;
