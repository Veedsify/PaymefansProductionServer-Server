const express = require("express");
const router = express.Router();
const authController = require("../controllers/api/authController");
const checkUserIsAuthenticated = require("../middlewares/checkUserIsAuthenticated.middleware");
const profileController = require("../controllers/api/profileController");
const modelController = require("../controllers/api/modelsController");
const multerImageMiddleware = require("../middlewares/multerImageMiddleware.middleware");
const PointsController = require("../controllers/api/pointsController");
const followerController = require("../controllers/api/followerController");
const ConversationsController = require("../controllers/api/conversationsController");
const {
    changePassword,
    setMessagePrice,
} = require("../controllers/api/settingsController");
const uploadAttachmentMulterMiddleware = require("../middlewares/uploadAttachmentMulter.middleware");
const multerPostMiddleware = require("../middlewares/multerPostMiddleware.middleware");
const uploadMediaController = require("../controllers/api/mediaUploadController");
const {
    GetTransactions,
    OtherTransactions,
} = require("../controllers/api/transactionsController");
const {
    CreatePost,
    GetMyPosts,
    GetCurrentUserPost,
    GetUserPostByID,
    GetMyMedia,
    GetUsersMedia,
} = require("../controllers/api/postController");
const checkEmailIsVerifiedMiddleware = require("../middlewares/checkEmailIsVerified.middleware");
const {
    GetSubscriptionData,
    checkSubscriber,
    CreateNewSubscription,
} = require("../controllers/api/subscriberController");
const {
    addBank,
    GetBanks,
    DeleteBank,
} = require("../controllers/api/banksController");
const { likePost } = require("../controllers/api/postInteractions");
const {
    UploadStoryFiles,
    SaveStory,
    GetStories,
} = require("../controllers/api/storyController");
const {
    NewPostComment,
    CommentsAttachMents,
    NewCommentLike,
} = require("../controllers/api/commentController");
const commentAttachmentMiddleware = require("../middlewares/commentAttachment.middleware");
const createUploadHandler = require("../middlewares/storypost.middleware");
const LiveStreamController = require("../controllers/api/livestreamController");
const PostController = require("../controllers/api/postController");
const {
    getMyNotifications,
    markNotificationAsRead,
} = require("../controllers/api/notificationController");
const {
    ModelVerification,
} = require("../controllers/api/verificationController");
const SubscriptionTiersController = require("../controllers/api/subscriptionTiersController");
const {
    uploadFIles,
    handleUploadError,
    uploadToCloudinary,
} = require("../middlewares/cloudinaryStorage");
const StoreController = require("../controllers/api/storeController");
const HelpController = require("../controllers/api/HelpController");
const HomeFeedController = require("../controllers/api/homeFeedController");
const uploadFileMiddleware = require("../middlewares/upload-file.middleware");
const UploadController = require("../controllers/api/uploadController");
const WebhookController = require("../controllers/api/webhook.controller");

// Authentication
router.post("/auth/signup", authController.Register);
router.post("/auth/signup/username", authController.Username);
router.post("/auth/login", authController.Login);
router.post("/auth/points", checkUserIsAuthenticated, authController.Points);
router.post("/auth/wallet", checkUserIsAuthenticated, authController.Wallet);
router.get("/retrieve", checkUserIsAuthenticated, authController.Retrieve);

router.post(
    "/users/check-email",
    checkUserIsAuthenticated,
    authController.CheckEmail,
);

// FEEDS
router.get("/home/posts", checkUserIsAuthenticated, HomeFeedController.GetHomePosts);


// Profile
router.post("/profile/user", profileController.Profile);

router.post(
    "/profile/banner/change",
    checkUserIsAuthenticated,
    multerImageMiddleware("banner"),
    profileController.BannerChange,
);
router.post(
    "/profile/image/change",
    checkUserIsAuthenticated,
    multerImageMiddleware("profile_image"),
    profileController.ProfileChange,
);

// router.post("/profile/settings/update/password", checkUserIsAuthenticated, profileController.SettingsPasswordChange);

// Post & Home
router.post("/post/upload-post-media", checkUserIsAuthenticated, uploadFileMiddleware.single("file"), UploadController.uploadImage);

router.post(
    "/post/create",
    checkUserIsAuthenticated,
    multerPostMiddleware.array("media[]"),
    CreatePost,
);
router.post(
    "/post/update/:post_id",
    checkUserIsAuthenticated,
    multerPostMiddleware.array("media[]"),
    PostController.UpdatePost,
);
router.get("/user/posts", checkUserIsAuthenticated, GetMyPosts);
router.get("/user/reposts", checkUserIsAuthenticated, PostController.MyReposts);
router.get(
    "/user/reposts/:userid",
    checkUserIsAuthenticated,
    PostController.OtherReposts,
);
router.get("/user/media", checkUserIsAuthenticated, GetMyMedia);
router.get("/profile/media/:userid", checkUserIsAuthenticated, GetUsersMedia);
router.get('/profile/locked/media')
router.get("/user/:userid/posts", checkUserIsAuthenticated, GetUserPostByID);
router.get("/posts/:post_id", checkUserIsAuthenticated, GetCurrentUserPost);
router.get(
    "/editpost/:post_id",
    checkUserIsAuthenticated,
    PostController.EditPost,
);
router.put(
    "/post/:post_id",
    checkUserIsAuthenticated,
    PostController.UpdateUserPostAudience,
);
router.post(
    "/post/repost/:post_id",
    checkUserIsAuthenticated,
    PostController.CreateRepost,
);
router.get(
    "/post/:post_id/comments",
    checkUserIsAuthenticated,
    PostController.GetPostComments,
);

// Post Interactions
router.post("/post/like/:post_id", checkUserIsAuthenticated, likePost);
router.delete(
    "/post/:post_id",
    checkUserIsAuthenticated,
    PostController.DeletePost,
);

// Settngs and Configs
router.post(
    "/profile/settings/update",
    checkUserIsAuthenticated,
    profileController.SettingsProfileChange,
);
router.post(
    "/profile/settings/update/hookup-status",
    checkUserIsAuthenticated,
    profileController.HookupStatusChange,
);
router.patch(
    "/settings/update/password",
    checkUserIsAuthenticated,
    changePassword,
);
router.post(
    "/settings/billings/message-price",
    checkUserIsAuthenticated,
    setMessagePrice,
);

// Models
router.post("/models/all", checkUserIsAuthenticated, modelController.GetModels);
router.get(
    "/search-models",
    checkUserIsAuthenticated,
    modelController.ModelsSearch,
);
router.post(
    "/models/hookups",
    checkUserIsAuthenticated,
    modelController.GetModelAvailableForHookup,
);
router.post(
    "/models/signup",
    checkUserIsAuthenticated,
    modelController.SignupModel,
);
router.get("/callback/model/signup", modelController.ValidateModelPayment);

/**
 * 
 * 
 * POINTS
 * 
 *
 */
// Route To Buy Points
router.post(
    "/points/buy",
    checkUserIsAuthenticated,
    PointsController.BuyPoints,
);
// Route To Get Conversion Rate For Points
router.post("/point/rate", checkUserIsAuthenticated, PointsController.ConversionRate)

router.post('/points/purchase', checkUserIsAuthenticated, PointsController.PointPurcahse)

// Fallback Route After Payment
router.get("/points/callback", PointsController.Callback);

// Route To Get Points For a User
router.post(
    "/user/get-points",
    checkUserIsAuthenticated,
    PointsController.GetUserPoints,
);

// Route To Get Global Points
router.get("/global/points", PointsController.GetGlobalPoints);

// Route To Get Price Per Message For a User
router.post(
    "/price-per-message",
    checkUserIsAuthenticated,
    PointsController.GetPointPerMessage,
);

// Wallet & Transactions & Banks
router.put("/banks/add", checkUserIsAuthenticated, addBank);
router.get("/banks", checkUserIsAuthenticated, GetBanks);
router.delete("/banks/delete", checkUserIsAuthenticated, DeleteBank);
router.get("/wallet/transactions", checkUserIsAuthenticated, GetTransactions);
router.get(
    "/wallet/transactions/other",
    checkUserIsAuthenticated,
    OtherTransactions,
);

// Subscribers

// router.post("/subscribe", checkUserIsAuthenticated, subscriberController.Subscribe);

// router.post("/unsubscribe", checkUserIsAuthenticated, subscriberController.Unsubscribe);

// router.post("/get/subscribers", checkUserIsAuthenticated, subscriberController.GetSubscribers);
router.post("/subscriber/check", checkUserIsAuthenticated, checkSubscriber);
router.post(
    "/user/subscription-data/:userid",
    checkUserIsAuthenticated,
    GetSubscriptionData,
);
router.post(
    "/subscribe/subscription-to-user/:profileid",
    checkUserIsAuthenticated,
    CreateNewSubscription,
);

// Subscribtion Tiers
router.post(
    "/create/subscription-tiers",
    checkUserIsAuthenticated,
    SubscriptionTiersController.CreateSubscriptionTier
);
router.get(
    "/fetch/user/subscriptions/:user_id",
    checkUserIsAuthenticated,
    SubscriptionTiersController.FetchUserSubscription,
);

// Followers
router.post(
    "/follow/check",
    checkUserIsAuthenticated,
    followerController.CheckFollower,
);
router.post(
    "/get/followers",
    checkUserIsAuthenticated,
    followerController.GetFollowers,
);

// Conversations
router.get(
    "/conversation/get-messages/:conversation",
    checkUserIsAuthenticated,
    ConversationsController.allConversations,
);
router.post(
    "/conversation/create-new",
    checkUserIsAuthenticated,
    ConversationsController.createConversation,
);
router.get(
    "/conversations/my-conversations",
    checkUserIsAuthenticated,
    ConversationsController.myConversations,
);
router.post(
    "/upload/attachments",
    checkUserIsAuthenticated,
    uploadAttachmentMulterMiddleware.array("attachments[]"),
    uploadMediaController.attachments,
);
router.post(
    "/search/messages/:conversationId",
    checkUserIsAuthenticated,
    ConversationsController.SearchMessages,
);
// Comments
router.post(
    "/comment/new",
    checkUserIsAuthenticated,
    commentAttachmentMiddleware("files"),
    NewPostComment,
);

router.post("/comment/like", checkUserIsAuthenticated, NewCommentLike);

// Notifications
router.post(
    "/notifications/:page",
    checkUserIsAuthenticated,
    getMyNotifications,
);
router.get(
    "/read-notification/:id",
    checkUserIsAuthenticated,
    markNotificationAsRead,
);

// Stories
router.get("/story/media", checkUserIsAuthenticated, GetMyMedia);
router.post(
    "/upload/story",
    checkUserIsAuthenticated,
    createUploadHandler("files[]"),
    UploadStoryFiles,
);
router.post("/save/story", checkUserIsAuthenticated, SaveStory);
router.get("/stories", checkUserIsAuthenticated, GetStories);
//Live Streams
router.post(
    "/live/live-stream/create",
    checkUserIsAuthenticated,
    LiveStreamController.CreateLiveStream,
);

// Host & and Invitee can view the stream
router.get("/live/host/:stream_id", LiveStreamController.GetHostStreamSettings);

// Viewers can view the stream
router.get("/stream/:stream_id", LiveStreamController.GetStream);

// Go Live
router.post(
    "/stream/:stream_id/go-live",
    checkUserIsAuthenticated,
    LiveStreamController.GoLive,
);

// Meta Map Verification Webhook
router.post("/meta-map/verification", authController.MetaMapVerification);
router.post("/verification", checkUserIsAuthenticated, ModelVerification);

// Store Controller
router.get("/store/products", StoreController.GetProducts);
router.get("/store/product/:product_id", StoreController.GetSingleProduct);
module.exports = router;

//Help Controllers
router.get("/help-categories", HelpController.GetHelpCategories);


// ProcessMediaControllers 
router.post("/webhooks/cloudflare/processed-post-media", WebhookController.ProcessedMedia)
