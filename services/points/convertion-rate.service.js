const prismaQuery = require('../../utils/prisma');

const ConversionRateService = async (req) => {
    try {
        // Find either user's conversion rate or global conversion rate, avoiding multiple queries
        const conversionRate = await prismaQuery.pointConversionRate.findFirst({
            where: {
                OR: [
                    {
                        pointConversionRateUsers: {
                            some: {
                                user_id: req.user.id
                            }
                        }
                    },
                    {
                        pointConversionRateUsers: {
                            none: {}
                        }
                    }
                ]
            }
        });

        // If a conversion rate is found, use it. If not, fall back to a default rate.
        if (conversionRate) {
            return {
                error: false,
                rate: conversionRate.points,
                message: 'Rate Retrieved Successfully',
            };
        }

        // If no conversion rate found, fall back to the default rate from the environment
        const rate = Number(process.env.PRICE_PER_POINT);
        return {
            error: false,
            rate: rate,
            message: 'Rate Retrieved Successfully',
        };

    } catch (error) {
        // Optionally log the error for debugging
        console.error('Error retrieving conversion rate:', error);
        return {
            error: true,
            message: 'Could not get conversion rate',
        };
    }
};


module.exports = ConversionRateService;
