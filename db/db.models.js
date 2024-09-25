const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    user_id: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    admin: { type: Boolean, default: false },
    role: { type: String, enum: ['fan', 'model'], default: 'fan' },
    is_active: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
    is_email_verified: { type: Boolean, default: false },
    is_model: { type: Boolean, default: false },
    email_verify_code: { type: String },
    email_verify_time: { type: Date },
    is_phone_verified: { type: Boolean, default: false },
    phone: { type: String, unique: true, required: true },
    profile_image: { type: String, default: '/site/avatar.png' },
    profile_banner: { type: String, default: '/site/banner.png' },
    bio: { type: String },
    location: { type: String },
    website: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zip: { type: String },
    post_watermark: { type: String },
    total_followers: { type: Number, default: 0 },
    total_following: { type: Number, default: 0 },
    total_subscribers: { type: Number, default: 0 },
    admin_status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    follow: [{ type: Schema.Types.ObjectId, ref: 'Follow' }],
    liveStream: [{ type: Schema.Types.ObjectId, ref: 'LiveStream' }],
    liveStreamComment: [{ type: Schema.Types.ObjectId, ref: 'LiveStreamComment' }],
    liveStreamLike: [{ type: Schema.Types.ObjectId, ref: 'LiveStreamLike' }],
    liveStreamView: [{ type: Schema.Types.ObjectId, ref: 'LiveStreamView' }],
    notifications: [{ type: Schema.Types.ObjectId, ref: 'Notifications' }],
    postLike: [{ type: Schema.Types.ObjectId, ref: 'PostLike' }],
    postShared: [{ type: Schema.Types.ObjectId, ref: 'PostShared' }],
    reportComment: [{ type: Schema.Types.ObjectId, ref: 'ReportComment' }],
    reportLive: [{ type: Schema.Types.ObjectId, ref: 'ReportLive' }],
    reportMessage: [{ type: Schema.Types.ObjectId, ref: 'ReportMessage' }],
    reportPost: [{ type: Schema.Types.ObjectId, ref: 'ReportPost' }],
    reportUser: [{ type: Schema.Types.ObjectId, ref: 'ReportUser' }],
    settings: { type: Schema.Types.ObjectId, ref: 'Settings' },
    subscribers: [{ type: Schema.Types.ObjectId, ref: 'Subscribers' }],
    userPoints: { type: Schema.Types.ObjectId, ref: 'UserPoints' },
    userRepost: [{ type: Schema.Types.ObjectId, ref: 'UserRepost' }],
    userStory: [{ type: Schema.Types.ObjectId, ref: 'UserStory' }],
    userSubscriptionCurrent: [{ type: Schema.Types.ObjectId, ref: 'UserSubscriptionCurrent' }],
    userTransaction: [{ type: Schema.Types.ObjectId, ref: 'UserTransaction' }],
    userWallet: { type: Schema.Types.ObjectId, ref: 'UserWallet' },
    userWithdrawalBankAccount: [{ type: Schema.Types.ObjectId, ref: 'UserWithdrawalBankAccount' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Messages' }],
    model: { type: Schema.Types.ObjectId, ref: 'Model' },
    userAttachments: [{ type: Schema.Types.ObjectId, ref: 'UserAttachments' }],
    post: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    userBanks: [{ type: Schema.Types.ObjectId, ref: 'UserBanks' }],
    postComment: [{ type: Schema.Types.ObjectId, ref: 'PostComment' }]
});

const ParticipantsSchema = new Schema({
    user_1: { type: String, required: true },
    user_2: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    conversations: [{ type: Schema.Types.ObjectId, ref: 'Conversations' }]
});

const ConversationsSchema = new Schema({
    conversation_id: { type: String, unique: true, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'Participants' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Messages' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const MessagesSchema = new Schema({
    message_id: { type: String, unique: true, required: true },
    sender_id: { type: String, required: true },
    receiver_id: { type: String, required: true },
    seen: { type: Boolean, default: false },
    message: { type: String, required: true },
    attachment: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportMessage: [{ type: Schema.Types.ObjectId, ref: 'ReportMessage' }],
    conversationsId: { type: Schema.Types.ObjectId, ref: 'Conversations' }
});

const ModelSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    country: { type: String, required: true },
    hookup: { type: Boolean, default: false },
    verification_video: { type: String },
    verification_image: { type: String },
    verification_status: { type: Boolean, default: false },
    payment_reference: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const UserMediaSchema = new Schema({
    media_id: { type: String, required: true },
    post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    media_type: { type: String, required: true },
    url: { type: String, required: true },
    media_length: { type: String },
    position: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const UserRepostSchema = new Schema({
    post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    repost_id: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const UserStorySchema = new Schema({
    story_id: { type: Schema.Types.ObjectId, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    story: { type: String, required: true },
    story_type: { type: String, required: true },
    posted_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

const PostSchema = new Schema({
    post_id: { type: Schema.Types.ObjectId, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    was_reposted: { type: Boolean, default: false },
    type: { type: String, required: true },
    content: { type: String },
    media: [{ type: Schema.Types.ObjectId, ref: 'UserMedia' }],
    post_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    post_audience: { type: String, enum: ['public', 'private', 'subscribers'], default: 'public' },
    post_likes: { type: Number, default: 0 },
    post_comments: { type: Number, default: 0 },
    post_shares: { type: Number, default: 0 },
    post_views: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const PostLikeSchema = new Schema({
    like_id: { type: Schema.Types.ObjectId, required: true },
    post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const PostCommentAttachmentsSchema = new Schema({
    attachment_id: { type: Schema.Types.ObjectId, required: true },
    attachment_type: { type: String, required: true },
    attachment_url: { type: String, required: true },
    attachment_name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const PostCommentSchema = new Schema({
    comment_id: { type: Schema.Types.ObjectId, required: true },
    post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    attachments: [{ type: Schema.Types.ObjectId, ref: 'PostCommentAttachments' }],
    createdAt: { type: Date, default: Date.now }
});

const PostSharedSchema = new Schema({
    shared_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const FollowSchema = new Schema({
    follow_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    follower_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const SubscribersSchema = new Schema({
    sub_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriber_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const LiveStreamSchema = new Schema({
    live_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    live_title: { type: String, required: true },
    live_description: { type: String, required: true },
    live_image: { type: String, required: true },
    live_video: { type: String, required: true },
    live_status: { type: String, enum: ['live', 'offline'], default: 'offline' },
    live_views: { type: Number, default: 0 },
    live_likes: { type: Number, default: 0 },
    live_comments: { type: Number, default: 0 },
    live_shares: { type: Number, default: 0 },
    live_started_at: { type: Date, default: Date.now },
    live_ended_at: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const LiveStreamCommentSchema = new Schema({
    comment_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    live_id: { type: Schema.Types.ObjectId, ref: 'LiveStream', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const LiveStreamLikeSchema = new Schema({
    like_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    live_id: { type: Schema.Types.ObjectId, ref: 'LiveStream', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const LiveStreamViewSchema = new Schema({
    view_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    live_id: { type: Schema.Types.ObjectId, ref: 'LiveStream', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const SettingsSchema = new Schema({
    settings_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    price_per_message: { type: Number, default: 0 },
    subscription_active: { type: Boolean, default: false },
    subscription_price: { type: Number, default: 0 },
    subscription_duration: { type: Number, default: 0 },
    enable_free_messages: { type: Boolean, default: false },
    subscription_type: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    subsciptions: {
        name: { type: String, required: true },
        price: { type: Number, default: 0 },
        duration: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
});

const NotificationsSchema = new Schema({
    notification_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notification_type: { type: String, required: true },
    notification_message: { type: String, required: true },
    notification_read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const ReportUserSchema = new Schema({
    report_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reported_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    report_type: { type: String, required: true },
    report_message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ReportPostSchema = new Schema({
    report_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    report_type: { type: String, required: true },
    report_message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ReportCommentSchema = new Schema({
    report_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment_id: { type: Schema.Types.ObjectId, ref: 'PostComment', required: true },
    report_type: { type: String, required: true },
    report_message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ReportMessageSchema = new Schema({
    report_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message_id: { type: Schema.Types.ObjectId, ref: 'Messages', required: true },
    report_type: { type: String, required: true },
    report_message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ReportLiveSchema = new Schema({
    report_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    live_id: { type: Schema.Types.ObjectId, ref: 'LiveStream', required: true },
    report_type: { type: String, required: true },
    report_message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const UserPointsSchema = new Schema({
    points_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const UserTransactionSchema = new Schema({
    transaction_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transaction_type: {
        type: String,
        enum: ['credit', 'debit', 'pending'],
        required: true
    },
    transaction_amount: { type: Number, required: true },
    transaction_status: { type: String, required: true },
    transaction_message: { type: String, required: true },
    transaction_wallet: { type: Schema.Types.ObjectId, ref: 'UserWallet', required: true },
    createdAt: { type: Date, default: Date.now }
});

const UserWalletSchema = new Schema({
    wallet_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    wallet_balance: { type: Number, default: 0 },
    wallet_currency: { type: String, default: 'USD' },
    createdAt: { type: Date, default: Date.now }
});

const UserSubscriptionCurrentSchema = new Schema({
    subscription_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscription_type: { type: String, required: true },
    subscription_duration: { type: Number, required: true },
    subscription_price: { type: Number, required: true },
    subscription_status: { type: String, required: true },
    subsciption_history: [{ type: Schema.Types.ObjectId, ref: 'UserSubscriptionHistory' }],
    createdAt: { type: Date, default: Date.now }
});

const UserSubscriptionHistorySchema = new Schema({
    subscription_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscription_type: { type: String, required: true },
    subscription_duration: { type: Number, required: true },
    subscription_price: { type: Number, required: true },
    subscription_status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const GlobalPointsBuySchema = new Schema({
    points_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    points: { type: Number, required: true },
    amount: { type: Number, required: true },
    conversion_rate: { type: Number, required: true },
    currency: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});


const UserWithdrawalBankAccountSchema = new Schema({
    bank_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    back_account_id: { type: String, required: true, ref: 'UserBankAccount' },
    createdAt: { type: Date, default: Date.now }
});

const UserBankAccountSchema = new Schema({
    bank_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bank_name: { type: String, required: true },
    account_name: { type: String, required: true },
    account_number: { type: String, required: true },
    account_type: { type: String, required: true },
    routing_number: { type: String, required: true },
    swift_code: { type: String, required: true },
    bank_country: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const UserAttachmentsSchema = new Schema({
    attachment_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attachment_type: { type: String, required: true },
    attachment_name: { type: String, required: true },
    attachment_size: { type: String, required: true },
    attachment_extension: { type: String, required: true },
    attachment_url: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const UserPointsPurchaseSchema = new Schema({
    purchase_id: { type: Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    conversion_rate: { type: Number, required: true },
    currency: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});


// Other schemas would follow similarly...


const User = mongoose.model('User', UserSchema);
const Participants = mongoose.model('Participants', ParticipantsSchema);
const Conversations = mongoose.model('Conversations', ConversationsSchema);
const Messages = mongoose.model('Messages', MessagesSchema);
const Model = mongoose.model('Model', ModelSchema);
const UserMedia = mongoose.model('UserMedia', UserMediaSchema);
const UserSubscriptionCurrent = mongoose.model('UserSubscriptionCurrent', UserSubscriptionCurrentSchema);
const Post = mongoose.model('Post', PostSchema);
const Follow = mongoose.model('Follow', FollowSchema);
const Subscribers = mongoose.model('Subscribers', SubscribersSchema);
const LiveStream = mongoose.model('LiveStream', LiveStreamSchema);
const LiveStreamComment = mongoose.model('LiveStreamComment', LiveStreamCommentSchema);
const LiveStreamLike = mongoose.model('LiveStreamLike', LiveStreamLikeSchema);
const LiveStreamView = mongoose.model('LiveStreamView', LiveStreamViewSchema);
const Settings = mongoose.model('Settings', SettingsSchema);
const Notifications = mongoose.model('Notifications', NotificationsSchema);
const UserPoints = mongoose.model('UserPoints', UserPointsSchema);
const UserRepost = mongoose.model('UserRepost', UserRepostSchema);
const UserStory = mongoose.model('UserStory', UserStorySchema);
const PostLike = mongoose.model('PostLike', PostLikeSchema);
const PostShared = mongoose.model('PostShared', PostSharedSchema);
const ReportUser = mongoose.model('ReportUser', ReportUserSchema);
const ReportPost = mongoose.model('ReportPost', ReportPostSchema);
const ReportComment = mongoose.model('ReportComment', ReportCommentSchema);
const ReportMessage = mongoose.model('ReportMessage', ReportMessageSchema);
const ReportLive = mongoose.model('ReportLive', ReportLiveSchema);
const UserTransaction = mongoose.model('UserTransaction', UserTransactionSchema);
const UserWallet = mongoose.model('UserWallet', UserWalletSchema);
const UserSubscriptionHistory = mongoose.model('UserSubscriptionHistory', UserSubscriptionHistorySchema);
const GlobalPointsBuy = mongoose.model('GlobalPointsBuy', GlobalPointsBuySchema);
const UserWithdrawalBankAccount = mongoose.model('UserWithdrawalBankAccount', UserWithdrawalBankAccountSchema);
const UserBankAccount = mongoose.model('UserBankAccount', UserBankAccountSchema);
const UserAttachments = mongoose.model('UserAttachments', UserAttachmentsSchema);
const UserPointsPurchase = mongoose.model('UserPointsPurchase', UserPointsPurchaseSchema);
const PostComment = mongoose.model('PostComment', PostCommentSchema);
const PostCommentAttachments = mongoose.model('PostCommentAttachments', PostCommentAttachmentsSchema);



module.exports = {
    User,
    Participants,
    Conversations,
    Messages,
    Model,
    UserMedia,
    UserSubscriptionCurrent,
    Post,
    Follow,
    Subscribers,
    LiveStream,
    LiveStreamComment,
    LiveStreamLike,
    LiveStreamView,
    Settings,
    Notifications,
    UserPoints,
    UserRepost,
    UserStory,
    PostLike,
    PostShared,
    ReportUser,
    ReportPost,
    ReportComment,
    ReportMessage,
    ReportLive,
    UserTransaction,
    UserWallet,
    UserSubscriptionHistory,
    GlobalPointsBuy,
    UserWithdrawalBankAccount,
    UserBankAccount,
    UserAttachments,
    UserPointsPurchase,
    PostComment,
    PostCommentAttachments
};
