const { clearCache } = require("../services/cache");

const cleanCache = async (req, res, next) => {
  await next();
  clearCache(req.user._id);
};

module.exports = cleanCache;
