const CheckUserIsAdmin = (req, res, next) => {
  try {
    const role = req.user.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden", status: false });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", status: false });D
  }
};

module.exports = CheckUserIsAdmin;
