module.exports = (req, res, next) => {
    if (req.user && req.user.is_email_verified) {
        return next();
    }
    return res.status(403).json({ message: 'Unauthorized Please Verify Your Email Address To Proceed' });
}