const prismaQuery = require('../../utils/prisma');
const redis = require("../../libs/redis-store");

const UserSubscriptions = async (id, user_id) => {

    const key = `user:${user_id}:subscriptions`;

    try {
        const result = await redis.get(key); // Redis get returns a promise
        if (result) {
            return {
                error: false,
                data: JSON.parse(result)
            };
        }

        // Proceed to Get From Database
        const subscriptions = await prismaQuery.user.findFirst({
            where: {
                OR: [
                    {id: id},
                    {user_id: user_id}
                ]
            },
            select: {
                ModelSubscriptionPack: {
                    select: {
                        ModelSubscriptionTier: {
                            select: {
                                tier_name: true,
                                tier_price: true,
                                tier_duration: true,
                                tier_description: true,
                                subscription_id: true,
                            }
                        }
                    }
                }
            }
        })
        if (subscriptions.ModelSubscriptionPack !== null) {
            redis.set(key, JSON.stringify(subscriptions.ModelSubscriptionPack.ModelSubscriptionTier), "EX", 600);
            return {
                message: 'Subscriptions found',
                data: subscriptions.ModelSubscriptionPack.ModelSubscriptionTier
            }
        } else {
            return {
                error: true,
                data: null,
                message: 'No subscriptions found'
            }
        }

    } catch (err) {
        console.error(err);
        return {
            error: true,
            data: null,
            message: 'Error retrieving data from Redis'
        }; // Return null in case of an error
    }
}

module.exports = {UserSubscriptions};