// if (process.env.NODE_ENV === 'production') {
//   module.exports = require('./prod');
// } else if (process.env.NODE_ENV === 'ci') {
//   module.exports = require('./ci');
// } else {
//   module.exports = require('./dev');
// }

module.exports = {
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  mongoURI: process.env.MONGO_URI,
  cookieKey: process.env.COOKIE_KEY,
  redisUrl: process.env.REDIS_URL,
};
