const registerService = require("../../services/register.service");
const loginService = require("../../services/login.service");
const prismaQuery = require("../../utils/prisma");
const jwt = require("jsonwebtoken");
const fs = require("fs");

/**
 * Controller class for handling authentication-related API endpoints.
 */
class authController {
    /**
     * Register a new user account.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response containing the status and message.
     */
    static async Register(req, res) {
        const createAccount = await registerService(req.body);

        if (createAccount.error) {
            return res
                .status(200)
                .json({ message: createAccount.error, status: false });
        }

        return res
            .status(200)
            .json({ message: "Account created successfully", status: true });
    }

    /**
     * Check if a username is already taken.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response containing the status and message.
     */
    static async Username(req, res) {
        const { username } = req.body;

        if (username === undefined) return res.status(200).json({ message: "Username is required", status: false })

        if (username === `paymefans`) {
            return res.status(200).json({ message: "Username already exists", status: false });
        }

        const user = await prismaQuery.user.findUnique({
            where: {
                username: `@${username}`,
            },
        });

        if (user) {
            return res
                .status(200)
                .json({ message: "Username already exists", status: false });
        }

        return res
            .status(200)
            .json({ message: "Username is available", status: true });
    }

    /**
     * Login a user.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response containing the status, message, and token.
     */
    static async Login(req, res) {
        const signinUser = await loginService(req.body);

        if (signinUser.error) {
            return res.status(200).json({ message: signinUser.error, status: false });
        }

        req.session.user = signinUser.user;
        return res.status(200).json({
            message: "Login successful",
            token: signinUser.token,
            status: true,
        });
    }

    /**
    * Retrieve user information.
    * @param {Object} req - The request object.
    * @param {Object} res - The response object.
    * @returns {Object} The response containing the user information.
    */
    static async Retrieve(req, res) {
        try {
            // Ensure req.user and req.user.id are valid
            if (!req.user || !req.user.id) {
                return res.status(400).json({ message: "Invalid request data", status: false });
            }

            const user = await prismaQuery.user.findUnique({
                where: {
                    id: req.user.id,
                },
                include: {
                    UserPoints: true,
                    UserWallet: true,
                    Settings: true,
                    Model: true,
                    _count: {
                        select: {
                            Follow: {
                                where: {
                                    user_id: req.user.id
                                }
                            },
                            Subscribers: {
                                where: {
                                    user_id: req.user.id
                                }
                            }
                        },
                    }
                }
            });

            const following = await prismaQuery.user.count({
                where: {
                    Follow: {
                        some: {
                            follower_id: req.user.id
                        }
                    }
                }
            });

            if (user) {
                const { password, ...rest } = user;

                // Handle BigInt serialization
                const bigIntToString = (obj) => {
                    return JSON.parse(JSON.stringify(obj, (key, value) =>
                        typeof value === 'bigint' ? value.toString() : value
                    ));
                };

                const data = { user: { ...rest, following }, status: true };
                return res.status(200).json(bigIntToString(data));
            } else {
                return res.status(404).json({ message: "User not found", status: false });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "An error occurred", status: false });
        }
    }


    /**
     * Get user points.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response containing the user points.
     */
    static async Points(req, res) {
        const { points } = await prismaQuery.userPoints.findFirst({
            where: {
                user_id: req.user.id,
            },
            select: {
                points: true,
            },
        });
        return res.status(200).json({ points: points, status: true });
    }

    /**
     * Get user wallet balance.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response containing the user wallet balance.
     */
    static async Wallet(req, res) {
        const { balance } = await prismaQuery.userWallet.findFirst({
            where: {
                user_id: req.user.id,
            },
            select: {
                balance: true,
            },
        });
        if (balance) {
            return res.status(200).json({ wallet: balance, status: true });
        }
        return res.status(200).json({ message: "No Data found", status: false });
    }

    /**
     * Check if an email is verified.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response containing the status and message.
     */
    static async CheckEmail(req, res) {
        const { email } = req.query;

        if (email === undefined) return res.status(200).json({ message: "Email is required", status: false });

        const user = await prismaQuery.user.findUnique({
            where: {
                email: email,
            },
        });

        if (user) {
            return res.status(200).json({ email, message: "Email is verified", status: true });
        }

        return res.status(200).json({ message: "Email is not verified", status: false });
    }

    static async MetaMapVerification(req, res) {
        const path = __dirname + '/../../data.json'
        // Read the file, create it if it doesn't exist, and append new data
        fs.readFile(path, "utf8", (err, data) => {
            let jsonData = [];
            if (err) {
                // If the file doesn't exist, create it with an empty array
                if (err.code === 'ENOENT') {
                    jsonData = [];
                } else {
                    console.error("Error reading file:", err);
                }
            } else {
                // Parse the existing data in the file
                try {
                    jsonData = JSON.parse(data);
                } catch (parseError) {
                    console.error("Error parsing JSON data:", parseError);
                }
            }
            // Append the new data from the request
            jsonData.push(req.body);

            // Write the updated data back to the file
            fs.writeFile(path, JSON.stringify(jsonData, null, 2), (err) => {
                if (err) {
                    console.error("Error writing file:", err);
                }
                console.log("Data written to file");
            });
        });
    }
}

module.exports = authController;
