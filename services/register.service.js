const prismaQuery = require("../utils/prisma");
const hashPassword = require("../utils/passwordHasher");
const { v4: uuid } = require("uuid");
const sendWelcomeEmail = require("../libs/send-welcome-email");

module.exports = async (body) => {
    const registerData = body;

    if (!registerData) return { error: "Invalid request", status: false };

    const requiredFields = ['name', 'username', 'email', 'phone', 'password', 'location'];
    const missingField = requiredFields.find(field => !registerData[field]);
    if (missingField) {
        return { error: `Sorry, ${missingField} field is missing`, status: false };
    }

    const [checkPhone, checkEmail] = await Promise.all([
        prismaQuery.user.findUnique({ where: { phone: registerData.phone } }),
        prismaQuery.user.findUnique({ where: { email: registerData.email } })
    ]);

    if (checkPhone) return { error: "Sorry, this user already exists", status: false };
    if (checkEmail) return { error: "Sorry, this user already exists", status: false };

    const uniqueUserId = generateUniqueId();
    const hashPass = await hashPassword(registerData.password);
    const walletId = generateUniqueId();
    const pointsId = generateUniqueId();

    try {
        const user = await createUser(registerData, uniqueUserId, hashPass, walletId, pointsId);

        const adminUserId = await prismaQuery.user.findFirst({ where: { username: "@paymefans" } });
        if (!adminUserId) {
            await prismaQuery.user.delete({ where: { id: user.id } });
            console.log(`Admin user not found`);
            return { error: "Sorry, an error occurred while creating your account", status: false };
        }

        const conversationId = generateUniqueId();
        await createConversation(adminUserId.user_id, uniqueUserId, conversationId);
        await createWelcomeMessage(user.username, adminUserId.user_id, conversationId);
        await createNotification(user.id, user.fullname);
        await CreateFollowing(adminUserId.user_id, user.user_id);

        // Send Welcome Email
        await sendWelcomeEmail(user.email, user.username);
        return user;

    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

const generateUniqueId = () => uuid().replace(/-/g, "");

const createUser = (registerData, uniqueUserId, hashPass, walletId, pointsId) => {
    return prismaQuery.user.create({
        data: {
            fullname: registerData.name,
            name: registerData.name,
            user_id: uniqueUserId,
            username: `@${registerData.username}`,
            email: registerData.email,
            phone: registerData.phone,
            location: registerData.location,
            password: hashPass,
            UserWallet: {
                create: {
                    wallet_id: walletId,
                    balance: 0,
                }
            },
            UserPoints: {
                create: {
                    points: 0,
                    conversion_rate: 0,
                }
            },
            Settings: {
                create: {
                    price_per_message: 0,
                    enable_free_message: true,
                    subscription_price: 0,
                    subscription_duration: "1 month",
                    subscription_type: "free",
                }
            },
        },
        include: {
            UserWallet: true,
            UserPoints: true,
            Model: true,
        }
    });
};

const createConversation = (user1, user2, conversationId) => {
    return prismaQuery.conversations.create({
        data: {
            conversation_id: conversationId,
            participants: {
                create: {
                    user_1: user1,
                    user_2: user2
                }
            }
        }
    });
};

const createWelcomeMessage = async (username, senderId, conversationId) => {
    const messageId = generateUniqueId();
    return prismaQuery.messages.create({
        data: {
            message_id: messageId,
            sender_id: senderId,
            conversationsId: conversationId,
            message: `Welcome to PayMeFans, ${username}! <br>We are excited to have you here.<br>If you have any questions or need help, feel free to reach out to us.`,
            seen: false,
            receiver_id: username,
            attachment: [],
        },
        select: {
            message_id: true
        }
    });
};

const createNotification = async (userId, fullname) => {
    const notificationId = uuid();
    return prismaQuery.notifications.create({
        data: {
            notification_id: notificationId,
            message: `Thanks for joining us and creating an account, <strong>${fullname}</strong>. We are thrilled to meet you!`,
            user_id: userId,
            action: "sparkle",
            url: "/profile"
        }
    });
};

const CreateFollowing = async (userId, followingId) => {
    const uuid = generateUniqueId();
    return prismaQuery.follow.create({
        data: {
            user_id: userId,
            follow_id: uuid,
            follower_id: followingId
        }
    });
}