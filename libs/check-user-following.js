const { v4: uuid } = require("uuid");
const prismaQuery = require("../utils/prisma");

class Following {

    static async checkUserFollowing(userId, thisUserId) {
        try {
            const data = await prismaQuery.follow.findFirst({
                where: {
                    user_id: userId,
                    follower_id: thisUserId
                }, select: {
                    follow_id: true
                }
            });

            if (data) {
                return {
                    status: true,
                    followId: data?.follow_id
                };
            } else {
                return {
                    status: false,
                    message: "User is not following"
                };
            }
        } catch (error) {
            return {
                status: false,
                message: error.message
            };
        }
    }

    static async followUser(userId, profileId, followStatus, followId = null) {
        try {
            const followUuid = followId || uuid();

            const followAction = followStatus
                ? prismaQuery.follow.create({
                    data: {
                        user_id: profileId,
                        follow_id: followUuid,
                        follower_id: userId,
                    },
                })
                : prismaQuery.follow.delete({
                    where: { follow_id: followUuid },
                });

            const followerIncrement = followStatus ? 1 : -1;
            const followingIncrement = followStatus ? 1 : -1;

            const updateUserFollowers = prismaQuery.user.update({
                where: { id: profileId },
                data: {
                    total_followers: { increment: followerIncrement },
                },
            });

            const updateUserFollowing = prismaQuery.user.update({
                where: { id: userId },
                data: {
                    total_following: { increment: followingIncrement },
                },
            });

            await Promise.all([followAction, updateUserFollowers, updateUserFollowing]);

            return {
                status: true,
                action: followStatus ? 'followed' : 'unfollowed',
                followUuid: followUuid,
            };
        } catch (error) {
            return {
                status: false,
                message: error.message,
            };
        }
    }

}

module.exports = Following;