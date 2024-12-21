const prismaQuery = require('../../utils/prisma');
const {v4: uuidv4} = require('uuid');
const redis = require("../../libs/redis-store");
const CreateTiersService = async (req) => {
        try {
            const {tiers} = req.body;
            const subscriptionId = `sub_${uuidv4()}`;
            const key = `user:${req.user.user_id}:subscriptions`;


            const findIfHasPack = await prismaQuery.modelSubscriptionPack.findFirst({
                where: {
                    user_id: req.user.id,
                },
                select: {
                    id: true,
                }
            })

            async function createSubscriptionTiers(tiers, createPack) {
                const createTiers = await prismaQuery.modelSubscriptionTier.createMany({
                    data: tiers.map(tier => ({
                        subscription_id: createPack.id,
                        tier_name: tier.tier_name,
                        tier_price: parseFloat(tier.tier_price),
                        tier_description: tier.tier_description,
                        tier_duration: tier.tier_duration
                    })),
                })
            }

            async function CacheModelSubscriptionPack(pack) {
                const getTiers = await prismaQuery.modelSubscriptionTier.findMany({
                    where: {
                        subscription_id: pack.id
                    },
                    select: {
                        tier_name: true,
                        tier_price: true,
                        tier_duration: true,
                        tier_description: true,
                        subscription_id: true,
                    }
                })
                redis.set(key, JSON.stringify(getTiers), "EX", 600)
                return getTiers;
            }

            if (findIfHasPack) {
                await prismaQuery.modelSubscriptionTier.deleteMany({
                    where: {
                        subscription_id: findIfHasPack.id
                    }
                })
                await createSubscriptionTiers(tiers, findIfHasPack)
                await CacheModelSubscriptionPack(findIfHasPack)
                return {
                    error: false, message: 'Subscription tiers updated successfully'
                }
            } else {
                const createPack = await prismaQuery.modelSubscriptionPack.create({
                    data: {
                        subscription_id: subscriptionId, user_id: req.user.id,
                    }
                })
                await createSubscriptionTiers(tiers, createPack)
                await CacheModelSubscriptionPack(createPack)
                if (createPack) {
                    return {
                        error: false, message: 'Subscription tiers created successfully'
                    }
                }
            }
        } catch
            (e) {
            console.error(e)
            return {
                error: true, message: e.message
            }
        }
    }
;

module.exports = {
    CreateTiersService,
}