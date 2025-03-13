const {CreateTiersService} = require("../../services/subscriptions/createtiers.service");
const {UserSubscriptions} = require("../../services/subscriptions/usersubscriptions.service");

class SubscriptionTiersController {
    static async CreateSubscriptionTier(req, res) {
        const createNewTiers = await CreateTiersService(req);
        if (createNewTiers.error) {
            res.status(500).json({
                message: createNewTiers.error,
                status: 'error'
            })
            return;
        }

        res.status(200).json({
            message: 'Subscription Tier Created Successfully',
            data: createNewTiers.data,
            status: 'success'
        })
    }

    static async FetchUserSubscription(req, res) {
        const subscription_tiers = await UserSubscriptions(req.user.id, req.params.user_id)

        if (subscription_tiers.error) {
            return res.status(500).json({
                message: subscription_tiers.message,
                status: 'error'
            })
        }

        return res.status(200).json({
            message: 'Subscription Tier Retrieved Successfully',
            data: subscription_tiers.data,
            status: 'success'
        })
    }
}

module.exports = SubscriptionTiersController;