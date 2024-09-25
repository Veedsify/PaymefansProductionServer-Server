
const LiveSocketFunctions = (io, socket, room, liveUsers) => {
    const handleLiveStreamJoin = (data) => {
        room = data.streamId;
        socket.join(room);

        // Add the user to the liveUsers list if they are not already in it
        if (!liveUsers.some(user => user.userId === data.userId)) {
            liveUsers.push({
                userId: data.userId,
                socket_id: socket.id
            });
        } else {
            liveUsers = liveUsers.map(user => {
                if (user.userId === data.userId) {
                    return {
                        userId: data.userId,
                        socket_id: socket.id
                    }
                }
                return user;
            });
        }

        // Emit to everyone in the room that a user has connected
        io.to(room).emit('stream-connected', { liveUsers, count: liveUsers.length });
    }

    const handleDisconnectStream = (data) => {
        // Remove the user from the liveUsers list
        liveUsers = liveUsers.filter(user => user.socket_id !== socket.id);
        // Emit to everyone in the room that a user has disconnected
        io.to(room).emit('stream-connected', { liveUsers, count: liveUsers.length });
    }


    socket.on('connect-stream', handleLiveStreamJoin);
    socket.on('disconnect-stream', handleDisconnectStream);

    return socket;
}

module.exports = LiveSocketFunctions;
