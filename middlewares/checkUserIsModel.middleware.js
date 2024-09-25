module.exports = async (req, res, next) => {
  let model = true;
  if (model) {
    next();
  } else {
    res.status(403).send("You are not authorized to view this page");
  }
};
